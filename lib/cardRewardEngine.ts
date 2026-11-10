import type {
  CardRewardRule,
} from "../data/cardCatalog";

// ========================================
// TYPES
// ========================================

export type RewardProgressStatus =
  | "valid"
  | "partial"
  | "expired"
  | "upcoming";

export type RewardEligibility =
  | "general"
  | "requires-verification";

export type CardRewardProgress = {
  ruleId: string;
  label: string;
  rewardRate: number;

  status: RewardProgressStatus;
  eligibility: RewardEligibility;

  totalSpentTWD: number;

  minimumSpendTWD?: number;
  minimumProgressPercent?: number;
  minimumRemainingTWD?: number;
  minimumReached?: boolean;

  eligibleSpendCapTWD?: number;
  rewardAmountCapTWD?: number;

  estimatedSpendToCapTWD?: number;
  capProgressPercent?: number;

  registrationRequired: boolean;

  warnings: string[];
};

// ========================================
// HELPERS
// ========================================

function isValidAmount(
  value: number
): boolean {
  return (
    Number.isFinite(value) &&
    value >= 0
  );
}

function roundMoney(
  value: number
): number {
  return (
    Math.round(
      (value + Number.EPSILON) * 100
    ) / 100
  );
}

function percentage(
  value: number,
  target: number
): number {
  if (
    !Number.isFinite(target) ||
    target <= 0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (value / target) * 100
      )
    )
  );
}

// ========================================
// DATE STATUS
// ========================================

export function getRewardPeriodStatus(
  rule: CardRewardRule,
  tripStart: string,
  tripEnd: string
): RewardProgressStatus {
  if (
    tripEnd < rule.validFrom
  ) {
    return "upcoming";
  }

  if (
    tripStart > rule.validUntil
  ) {
    return "expired";
  }

  if (
    rule.validFrom <= tripStart &&
    rule.validUntil >= tripEnd
  ) {
    return "valid";
  }

  return "partial";
}

// ========================================
// SPENDING TARGET
// ========================================

export function getEstimatedSpendToCap(
  rule: CardRewardRule
): number | undefined {
  const targets: number[] = [];

  if (
    rule.eligibleSpendCapTWD !==
      undefined &&
    rule.eligibleSpendCapTWD > 0
  ) {
    targets.push(
      rule.eligibleSpendCapTWD
    );
  }

  if (
    rule.rewardAmountCapTWD !==
      undefined &&
    rule.rewardAmountCapTWD > 0 &&
    rule.rewardRate > 0
  ) {
    targets.push(
      rule.rewardAmountCapTWD /
        (rule.rewardRate / 100)
    );
  }

  if (targets.length === 0) {
    return undefined;
  }

  return roundMoney(
    Math.min(...targets)
  );
}

// ========================================
// RULE PROGRESS
// ========================================

export function calculateRewardProgress(
  rule: CardRewardRule,
  totalSpentTWD: number,
  tripStart: string,
  tripEnd: string
): CardRewardProgress {
  const spent =
    isValidAmount(totalSpentTWD)
      ? totalSpentTWD
      : 0;

  const status =
    getRewardPeriodStatus(
      rule,
      tripStart,
      tripEnd
    );

  const eligibility:
    RewardEligibility =
    rule.spendingType === "general"
      ? "general"
      : "requires-verification";

  const warnings: string[] = [];

  if (
    status === "expired"
  ) {
    warnings.push(
      "此活動在旅行開始前已結束"
    );
  }

  if (
    status === "upcoming"
  ) {
    warnings.push(
      "此活動在旅行結束後才開始"
    );
  }

  if (
    status === "partial"
  ) {
    warnings.push(
      "此活動僅涵蓋部分旅行日期"
    );
  }

  if (
    eligibility ===
    "requires-verification"
  ) {
    warnings.push(
      "需確認消費是否符合指定通路或交易類型"
    );
  }

  if (
    rule.registrationRequired
  ) {
    warnings.push(
      "此優惠需要事先登錄"
    );
  }

  const minimum =
    rule.minimumSpendTWD;

  const hasMinimum =
    minimum !== undefined &&
    minimum > 0;

  const estimatedSpendToCapTWD =
    getEstimatedSpendToCap(rule);

  const hasCap =
    estimatedSpendToCapTWD !==
    undefined &&
    estimatedSpendToCapTWD > 0;

  return {
    ruleId: rule.id,
    label: rule.label,
    rewardRate: rule.rewardRate,

    status,
    eligibility,

    totalSpentTWD: spent,

    minimumSpendTWD:
      hasMinimum
        ? minimum
        : undefined,

    minimumProgressPercent:
      hasMinimum
        ? percentage(
            spent,
            minimum
          )
        : undefined,

    minimumRemainingTWD:
      hasMinimum
        ? roundMoney(
            Math.max(
              0,
              minimum - spent
            )
          )
        : undefined,

    minimumReached:
      hasMinimum
        ? spent >= minimum
        : undefined,

    eligibleSpendCapTWD:
      rule.eligibleSpendCapTWD,

    rewardAmountCapTWD:
      rule.rewardAmountCapTWD,

    estimatedSpendToCapTWD,

    capProgressPercent:
      hasCap
        ? percentage(
            spent,
            estimatedSpendToCapTWD
          )
        : undefined,

    registrationRequired:
      Boolean(
        rule.registrationRequired
      ),

    warnings,
  };
}

// ========================================
// MULTIPLE RULES
// ========================================

export function calculateCardRewardProgress(
  rules: CardRewardRule[],
  totalSpentTWD: number,
  tripStart: string,
  tripEnd: string
): CardRewardProgress[] {
  return rules.map(
    (rule) =>
      calculateRewardProgress(
        rule,
        totalSpentTWD,
        tripStart,
        tripEnd
      )
  );
}