import {
  NextResponse,
} from "next/server";


export const dynamic =
  "force-dynamic";


type FrankfurterRateResponse = {
  date?: string;
  base?: string;
  quote?: string;
  rate?: number;
};


export async function GET() {
  try {
    const response =
      await fetch(
        "https://api.frankfurter.dev/v2/rate/jpy/twd",
        {
          cache:
            "no-store",

          headers: {
            Accept:
              "application/json",
          },
        }
      );


    if (!response.ok) {
      throw new Error(
        `Exchange rate provider returned ${response.status}`
      );
    }


    const data =
      (await response.json()) as
        FrankfurterRateResponse;


    const rate =
      Number(
        data.rate
      );


    if (
      !Number.isFinite(
        rate
      ) ||
      rate <= 0
    ) {
      throw new Error(
        "Invalid exchange rate"
      );
    }


    return NextResponse.json(
      {
        success: true,

        from: "JPY",
        to: "TWD",

        rate,

        provider:
          "Frankfurter",

        providerDate:
          data.date ?? null,

        capturedAt:
          new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Exchange rate error:",
      error
    );


    return NextResponse.json(
      {
        success: false,

        error:
          "目前無法取得參考匯率，將繼續使用最近一次成功匯率。",
      },
      {
        status: 503,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}