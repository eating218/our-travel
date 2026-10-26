import {
  GoogleGenAI,
} from "@google/genai";

import {
  NextRequest,
  NextResponse,
} from "next/server";

const MODEL =
  "gemini-3.8-flash";

const FALLBACK_MODEL =
  "gemini-3.5-flash-lite";

type PlaceGuideResult = {
  placeName: string;
  address: string;
  openingHours: string;
  closedDays: string;
  introduction: string;
  highlights: string;
  story: string;
  tips: string;
  sourceName: string;
  sourceUrl: string;
};

const responseSchema = {
  type: "object",

  properties: {
    placeName: {
      type: "string",
    },

    address: {
      type: "string",
    },

    openingHours: {
      type: "string",
    },

    closedDays: {
      type: "string",
    },

    introduction: {
      type: "string",
    },

    highlights: {
      type: "string",
    },

    story: {
      type: "string",
    },

    tips: {
      type: "string",
    },

    sourceName: {
      type: "string",
    },

    sourceUrl: {
      type: "string",
    },
  },

  required: [
    "placeName",
    "address",
    "openingHours",
    "closedDays",
    "introduction",
    "highlights",
    "story",
    "tips",
    "sourceName",
    "sourceUrl",
  ],

  additionalProperties: false,
};

function cleanString(
  value: unknown
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function normalizeResult(
  value: unknown
): PlaceGuideResult {
  const object =
    value &&
    typeof value ===
      "object"
      ? (value as Record<
          string,
          unknown
        >)
      : {};

  return {
    placeName:
      cleanString(
        object.placeName
      ),

    address:
      cleanString(
        object.address
      ),

    // 這一版不讓 AI 猜即時資訊
    openingHours: "",

    closedDays: "",

    introduction:
      cleanString(
        object.introduction
      ),

    highlights:
      cleanString(
        object.highlights
      ),

    story:
      cleanString(
        object.story
      ),

    tips:
      cleanString(
        object.tips
      ),

    // 沒有 Google Search，
    // 就不冒充有查官方來源
    sourceName: "",

    sourceUrl: "",
  };
}

function getErrorText(
  error: unknown
) {
  return error instanceof Error
    ? error.message
    : String(error);
}

function isQuotaError(
  error: unknown
) {
  const text =
    getErrorText(error)
      .toLowerCase();

  return (
    text.includes("429") ||
    text.includes("quota") ||
    text.includes(
      "resource_exhausted"
    )
  );
}

function isUnavailableError(
  error: unknown
) {
  const text =
    getErrorText(error)
      .toLowerCase();

  return (
    text.includes("503") ||
    text.includes(
      "unavailable"
    )
  );
}

async function generatePlaceGuide(
  ai: GoogleGenAI,
  model: string,
  prompt: string
) {
  const response =
    await ai.models.generateContent({
      model,

      contents: prompt,

      config: {
        responseMimeType:
          "application/json",

        responseJsonSchema:
          responseSchema,
      },
    });

  const outputText =
    response.text;

  if (!outputText) {
    throw new Error(
      "EMPTY_RESPONSE"
    );
  }

  const parsed =
    JSON.parse(outputText);

  return normalizeResult(
    parsed
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    // ========================================
    // API KEY
    // ========================================

    const apiKey =
      process.env
        .GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "伺服器尚未設定 Gemini API Key。",
        },
        {
          status: 500,
        }
      );
    }

    // ========================================
    // INPUT
    // ========================================

    const body =
      await request.json();

    const name =
      typeof body?.name ===
      "string"
        ? body.name.trim()
        : "";

    const address =
      typeof body?.address ===
      "string"
        ? body.address.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          error:
            "請先輸入景點名稱。",
        },
        {
          status: 400,
        }
      );
    }

    if (
      name.length > 100 ||
      address.length > 200
    ) {
      return NextResponse.json(
        {
          error:
            "景點名稱或地址過長。",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // GEMINI
    // ========================================

    const ai =
      new GoogleGenAI({
        apiKey,
      });

    const prompt = `
你是私人旅遊 App 的景點介紹助手。

景點名稱：
${name}

使用者提供的地點：
${address || "未提供"}

請根據你既有的知識，使用繁體中文整理這個景點。

這不是即時網路搜尋。

請遵守以下規則：

1. placeName
   填寫最常使用的繁體中文景點名稱。

2. address
   如果你非常確定，可以提供簡潔地址。
   如果不確定，回傳空字串。

3. openingHours
   一律回傳空字串。

4. closedDays
   一律回傳空字串。

5. introduction
   用 2～3 句介紹這個景點。
   適合直接放進私人旅遊 App。

6. highlights
   說明實際到現場最值得注意、觀賞或體驗的內容。

7. story
   整理一段有根據的歷史背景、典故或小故事。
   不確定的傳說不要寫成確定事實。

8. tips
   提供實際造訪時有用的建議。
   可以包含拍照、參觀順序、停留方式等。

   不要提供可能隨時間改變的即時資訊，
   例如目前票價、目前營業時間、
   臨時休館、最新交通異動。

9. sourceName
   一律回傳空字串。

10. sourceUrl
    一律回傳空字串。

不要假裝你有搜尋網路。
不要捏造官方來源。
不要猜測營業時間或休館日。

只回傳指定 JSON。
`;

    // ========================================
    // PRIMARY MODEL
    // ========================================

    try {
      const result =
        await generatePlaceGuide(
          ai,
          MODEL,
          prompt
        );

      return NextResponse.json(
        {
          result,

          meta: {
            model: MODEL,

            checkedAt:
              new Date()
                .toISOString(),

            searchedWeb: false,
          },
        }
      );
    } catch (error) {
      // 額度問題不切 fallback，
      // 避免兩個模型一起消耗 quota。

      if (
        isQuotaError(error)
      ) {
        return NextResponse.json(
          {
            error:
              "Gemini 目前無法完成這次請求，可能是 API 額度或速率限制。請稍後再試。",
          },
          {
            status: 429,
          }
        );
      }

      // 只有模型暫時不可用 503
      // 才切 fallback。

      if (
        !isUnavailableError(
          error
        )
      ) {
        throw error;
      }
    }

    // ========================================
    // FALLBACK
    // ========================================

    try {
      const result =
        await generatePlaceGuide(
          ai,
          FALLBACK_MODEL,
          prompt
        );

      return NextResponse.json(
        {
          result,

          meta: {
            model:
              FALLBACK_MODEL,

            checkedAt:
              new Date()
                .toISOString(),

            searchedWeb: false,
          },
        }
      );
    } catch (error) {
      if (
        isQuotaError(error)
      ) {
        return NextResponse.json(
          {
            error:
              "Gemini 目前無法完成這次請求，可能是 API 額度或速率限制。請稍後再試。",
          },
          {
            status: 429,
          }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error(
      "Place guide error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "AI 景點介紹產生失敗，請稍後再試。",
      },
      {
        status: 500,
      }
    );
  }
}