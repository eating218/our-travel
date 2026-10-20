import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

const RECEIPT_PROMPT = `
你是一個旅遊消費收據辨識器，目前支援日本與台灣收據。
只根據照片中實際看得到的內容輸出資料，不要猜測照片外的商品。
將日文商品名稱翻譯成繁體中文；中文商品名稱維持繁體中文。
最重要的是金額忠實、折扣正確歸屬，以及幣別正確。

幣別規則：
- 日本收據輸出 JPY。
- 台灣收據輸出 TWD。
- 根據店家名稱、語言、地址、電話格式、貨幣符號與收據內容綜合判斷。
- 不要因為這是旅遊 App 就預設 JPY。
- 明顯台灣商家，例如全聯福利中心，應輸出 TWD。
- 明顯日本商家與日本收據應輸出 JPY。

每個商品輸出：
- originalAmount：折扣前、已包含數量後的商品總價。
- discountAmount：直接屬於該商品的折扣總額，以正數輸出；沒有折扣就是 0。
- amount：該商品最終實付，必須等於 originalAmount - discountAmount。分帳只使用 amount。

例：商品 554円、下一行値引 56円：
originalAmount=554, discountAmount=56, amount=498。

例：@700 × 2個，無折扣：
quantity=2, originalAmount=1400, discountAmount=0, amount=1400。

規則：
1. 不要把小計、合計、稅額、現金、找零當商品。
2. 不要把値引、割引、クーポン、ポイント値引等折扣列當商品。
3. 能明確判斷屬於某商品的折扣，必須套到該商品。
4. discountAmount 永遠是正數。
5. quantity 看不清楚時為 1。
6. date 用 YYYY-MM-DD，time 用 HH:mm。
7. tax 只作資訊，不要重複加進商品或 total。
8. total 使用收據印出的最終應付／合計，不要用商品加總取代。
9. discountTotal 是整張收據所有折扣的總額，以正數輸出。
10. 若有整單折扣但無法可靠歸屬特定商品，不要亂分配；仍計入 discountTotal，並降低 confidence。
11. 照片只有部分收據時，不要補造看不到的商品。
12. suggestedCategory 只能是：餐飲、交通、購物、門票、住宿、其他。
13. confidence 為 0 到 1。
`;

const RECEIPT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    merchantOriginal: { type: Type.STRING },
    merchantTranslated: { type: Type.STRING },
    date: { type: Type.STRING },
    time: { type: Type.STRING },
    currency: { type: Type.STRING, enum: ["JPY", "TWD"] },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          originalName: { type: Type.STRING },
          chineseName: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          originalAmount: { type: Type.NUMBER },
          discountAmount: { type: Type.NUMBER },
          amount: { type: Type.NUMBER },
        },
        required: [
          "originalName",
          "chineseName",
          "quantity",
          "originalAmount",
          "discountAmount",
          "amount",
        ],
      },
    },
    subtotal: { type: Type.NUMBER },
    discountTotal: { type: Type.NUMBER },
    tax: { type: Type.NUMBER },
    total: { type: Type.NUMBER },
    suggestedCategory: {
      type: Type.STRING,
      enum: ["餐飲", "交通", "購物", "門票", "住宿", "其他"],
    },
    confidence: { type: Type.NUMBER },
  },
  required: [
    "merchantOriginal",
    "merchantTranslated",
    "date",
    "time",
    "currency",
    "items",
    "subtotal",
    "discountTotal",
    "tax",
    "total",
    "suggestedCategory",
    "confidence",
  ],
};

function getGeminiStatus(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }

  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) return 429;
  if (message.includes("503") || message.includes("UNAVAILABLE")) return 503;

  return undefined;
}

function isStatus(error: unknown, status: number) {
  return getGeminiStatus(error) === status;
}

async function scanWithGemini(
  ai: GoogleGenAI,
  model: string,
  mimeType: string,
  base64Image: string
) {
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: RECEIPT_PROMPT },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: RECEIPT_SCHEMA,
      temperature: 0,
    },
  });

  if (!response.text) throw new Error("Gemini returned an empty response.");
  return JSON.parse(response.text);
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing.");
    return NextResponse.json(
      { error: "收據辨識服務尚未設定完成", code: "GEMINI_NOT_CONFIGURED" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "沒有收到收據照片", code: "IMAGE_MISSING" },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
      return NextResponse.json(
        { error: "目前只支援 JPG、PNG、WEBP 圖片", code: "IMAGE_TYPE_NOT_ALLOWED" },
        { status: 415 }
      );
    }

    if (image.size <= 0) {
      return NextResponse.json(
        { error: "收據照片是空的", code: "IMAGE_EMPTY" },
        { status: 400 }
      );
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "收據照片太大，請使用 8 MB 以下的圖片", code: "IMAGE_TOO_LARGE" },
        { status: 413 }
      );
    }

    const base64Image = Buffer.from(await image.arrayBuffer()).toString("base64");
    const ai = new GoogleGenAI({ apiKey });

    let result: unknown;
    let usedModel = PRIMARY_MODEL;

    try {
      result = await scanWithGemini(ai, PRIMARY_MODEL, image.type, base64Image);
    } catch (primaryError) {
      if (isStatus(primaryError, 429)) {
        console.warn("Gemini primary model quota exceeded.");
        return NextResponse.json(
          { error: "今日 AI 收據辨識額度已用完，請稍後再試", code: "GEMINI_QUOTA_EXCEEDED" },
          { status: 429 }
        );
      }

      if (!isStatus(primaryError, 503)) {
        console.error("Gemini primary model failed:", primaryError);
        return NextResponse.json(
          { error: "AI 收據辨識失敗，請稍後再試", code: "GEMINI_SCAN_FAILED" },
          { status: 500 }
        );
      }

      console.warn(`Gemini ${PRIMARY_MODEL} unavailable. Falling back to ${FALLBACK_MODEL}.`);
      usedModel = FALLBACK_MODEL;

      try {
        result = await scanWithGemini(ai, FALLBACK_MODEL, image.type, base64Image);
      } catch (fallbackError) {
        if (isStatus(fallbackError, 429)) {
          return NextResponse.json(
            { error: "今日 AI 收據辨識額度已用完，請稍後再試", code: "GEMINI_QUOTA_EXCEEDED" },
            { status: 429 }
          );
        }

        if (isStatus(fallbackError, 503)) {
          return NextResponse.json(
            { error: "AI 目前忙碌中，請稍後再試", code: "GEMINI_TEMPORARILY_UNAVAILABLE" },
            { status: 503 }
          );
        }

        console.error("Gemini fallback model failed:", fallbackError);
        return NextResponse.json(
          { error: "AI 收據辨識失敗，請稍後再試", code: "GEMINI_SCAN_FAILED" },
          { status: 500 }
        );
      }
    }

    console.info(`Receipt scan successful. Model: ${usedModel}`);

    return NextResponse.json({
      success: true,
      result,
      meta: { model: usedModel },
    });
  } catch (error) {
    console.error("Receipt scan route failed:", error);
    return NextResponse.json(
      { error: "收據辨識服務發生錯誤，請稍後再試", code: "RECEIPT_SCAN_ERROR" },
      { status: 500 }
    );
  }
}
