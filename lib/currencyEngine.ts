export type SupportedCurrency =
  | "JPY"
  | "TWD";


export type ExchangeRateSource =
  | "live"
  | "manual"
  | "fallback";


export type ExchangeRateSnapshot = {
  from: SupportedCurrency;
  to: SupportedCurrency;

  /**
   * 1 單位 from 等於多少 to
   *
   * 例如：
   * JPY -> TWD
   * rate = 0.2063
   *
   * ¥1 ≈ NT$0.2063
   */
  rate: number;

  source: ExchangeRateSource;

  /**
   * 匯率取得時間。
   *
   * live:
   * API 更新時間
   *
   * manual:
   * 使用者設定時間
   */
  capturedAt: string;
};


export type CurrencyConversion = {
  originalAmount: number;
  originalCurrency: SupportedCurrency;

  convertedAmount: number;
  convertedCurrency: SupportedCurrency;

  exchangeRate: number;
  exchangeRateSource: ExchangeRateSource;
  exchangeRateCapturedAt: string;
};


// ========================================
// ROUNDING
// ========================================

function roundTWD(
  amount: number
) {
  return Math.round(amount);
}


function roundJPY(
  amount: number
) {
  return Math.round(amount);
}


// ========================================
// VALIDATION
// ========================================

export function isValidExchangeRate(
  rate: number
) {
  return (
    Number.isFinite(rate) &&
    rate > 0
  );
}


// ========================================
// CONVERT
// ========================================

export function convertCurrency({
  amount,
  from,
  to,
  rate,
}: {
  amount: number;
  from: SupportedCurrency;
  to: SupportedCurrency;
  rate: ExchangeRateSnapshot;
}): CurrencyConversion {
  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      "Invalid amount"
    );
  }


  if (
    !isValidExchangeRate(
      rate.rate
    )
  ) {
    throw new Error(
      "Invalid exchange rate"
    );
  }


  // Same currency

  if (from === to) {
    return {
      originalAmount: amount,
      originalCurrency: from,

      convertedAmount: amount,
      convertedCurrency: to,

      exchangeRate: 1,
      exchangeRateSource:
        rate.source,

      exchangeRateCapturedAt:
        rate.capturedAt,
    };
  }


  // Rate direction matches

  if (
    rate.from === from &&
    rate.to === to
  ) {
    const raw =
      amount * rate.rate;


    return {
      originalAmount: amount,
      originalCurrency: from,

      convertedAmount:
        to === "TWD"
          ? roundTWD(raw)
          : roundJPY(raw),

      convertedCurrency: to,

      exchangeRate:
        rate.rate,

      exchangeRateSource:
        rate.source,

      exchangeRateCapturedAt:
        rate.capturedAt,
    };
  }


  // Reverse rate

  if (
    rate.from === to &&
    rate.to === from
  ) {
    const reverseRate =
      1 / rate.rate;


    const raw =
      amount *
      reverseRate;


    return {
      originalAmount: amount,
      originalCurrency: from,

      convertedAmount:
        to === "TWD"
          ? roundTWD(raw)
          : roundJPY(raw),

      convertedCurrency: to,

      exchangeRate:
        reverseRate,

      exchangeRateSource:
        rate.source,

      exchangeRateCapturedAt:
        rate.capturedAt,
    };
  }


  throw new Error(
    `Unsupported conversion: ${from} -> ${to}`
  );
}


// ========================================
// JPY -> TWD
// ========================================

export function convertJPYToTWD(
  amountJPY: number,
  rate: ExchangeRateSnapshot
) {
  return convertCurrency({
    amount: amountJPY,
    from: "JPY",
    to: "TWD",
    rate,
  });
}


// ========================================
// TWD -> JPY
// ========================================

export function convertTWDToJPY(
  amountTWD: number,
  rate: ExchangeRateSnapshot
) {
  return convertCurrency({
    amount: amountTWD,
    from: "TWD",
    to: "JPY",
    rate,
  });
}


// ========================================
// FOREIGN TRANSACTION FEE
// ========================================

export function calculateForeignFee({
  amountTWD,
  feeRate,
}: {
  amountTWD: number;

  /**
   * 百分比。
   *
   * 例如 1.5 代表 1.5%
   */
  feeRate: number;
}) {
  if (
    !Number.isFinite(
      amountTWD
    ) ||
    amountTWD < 0
  ) {
    return 0;
  }


  if (
    !Number.isFinite(
      feeRate
    ) ||
    feeRate <= 0
  ) {
    return 0;
  }


  return Math.round(
    amountTWD *
      (feeRate / 100)
  );
}


// ========================================
// REWARD
// ========================================

export function calculateReward({
  eligibleSpendTWD,
  rewardRate,
  rewardAmountCapTWD,
}: {
  eligibleSpendTWD: number;

  /**
   * 百分比。
   *
   * 5 = 5%
   */
  rewardRate: number;

  rewardAmountCapTWD?: number;
}) {
  if (
    eligibleSpendTWD <= 0 ||
    rewardRate <= 0
  ) {
    return 0;
  }


  const rawReward =
    eligibleSpendTWD *
    (rewardRate / 100);


  const reward =
    Math.round(rawReward);


  if (
    rewardAmountCapTWD ===
    undefined
  ) {
    return reward;
  }


  return Math.min(
    reward,
    rewardAmountCapTWD
  );
}


// ========================================
// ELIGIBLE SPEND
// ========================================

export function calculateEligibleSpend({
  spendingTWD,
  eligibleSpendCapTWD,
}: {
  spendingTWD: number;
  eligibleSpendCapTWD?: number;
}) {
  if (
    spendingTWD <= 0
  ) {
    return 0;
  }


  if (
    eligibleSpendCapTWD ===
    undefined
  ) {
    return spendingTWD;
  }


  return Math.min(
    spendingTWD,
    eligibleSpendCapTWD
  );
}


// ========================================
// NET REWARD
// ========================================

export function calculateNetReward({
  rewardTWD,
  foreignFeeTWD,
}: {
  rewardTWD: number;
  foreignFeeTWD: number;
}) {
  return (
    rewardTWD -
    foreignFeeTWD
  );
}