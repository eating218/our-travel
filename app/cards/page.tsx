"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  cardCatalog,
  CardCatalogItem,
} from "../../data/cardCatalog";

import {
  MyTravelCard,
} from "../../data/cardData";

import {
  useExpenseData,
} from "../../hooks/useExpenseData";

import {
  useCreditCards,
} from "../../hooks/useCreditCards";

import {
  useTripSettings,
} from "../../hooks/useTripSettings";

import {
  useExchangeRate,
} from "../../hooks/useExchangeRate";


// ========================================
// HELPERS
// ========================================

function formatTWD(
  amount: number
) {
  return `NT$${Math.round(
    amount
  ).toLocaleString(
    "zh-TW"
  )}`;
}


function getCatalogCard(
  card: MyTravelCard
) {
  if (
    !card.catalogCardId
  ) {
    return undefined;
  }

  return cardCatalog.find(
    (catalogCard) =>
      catalogCard.id ===
      card.catalogCardId
  );
}


function getCardName(
  card: MyTravelCard
) {
  const catalogCard =
    getCatalogCard(card);

  return (
    catalogCard?.name ??
    card.customName ??
    "自訂信用卡"
  );
}


function getCardIssuer(
  card: MyTravelCard
) {
  const catalogCard =
    getCatalogCard(card);

  return (
    catalogCard?.issuer ??
    card.customIssuer ??
    ""
  );
}


function formatDate(
  value?: string
) {
  if (!value) {
    return "";
  }

  return value.replace(
    /-/g,
    "/"
  );
}


// ========================================
// TRIP OFFER STATUS
// ========================================

type TripOfferStatus =
  | "valid"
  | "partial"
  | "expired"
  | "unknown";


function getTripOfferStatus(
  catalogCard:
    CardCatalogItem,
  tripStart: string,
  tripEnd: string
): TripOfferStatus {
  if (
    catalogCard.rewardRules
      .length === 0
  ) {
    return "unknown";
  }


  const overlappingRules =
    catalogCard.rewardRules.filter(
      (rule) =>
        rule.validUntil >=
          tripStart &&
        rule.validFrom <=
          tripEnd
    );


  if (
    overlappingRules.length ===
    0
  ) {
    return "expired";
  }


  const coversWholeTrip =
    overlappingRules.some(
      (rule) =>
        rule.validFrom <=
          tripStart &&
        rule.validUntil >=
          tripEnd
    );


  if (coversWholeTrip) {
    return "valid";
  }


  return "partial";
}


function getStatusUI(
  status:
    TripOfferStatus
) {
  switch (status) {
    case "valid":
      return {
        label:
          "✓ 涵蓋旅行",

        className:
          "bg-emerald-50 text-emerald-600",
      };


    case "partial":
      return {
        label:
          "△ 部分期間",

        className:
          "bg-amber-50 text-amber-600",
      };


    case "expired":
      return {
        label:
          "旅行時已過期",

        className:
          "bg-rose-50 text-rose-500",
      };


    default:
      return {
        label:
          "待確認規則",

        className:
          "bg-slate-100 text-slate-500",
      };
  }
}


// ========================================
// RULE HELPERS
// ========================================

function spendingTypeLabel(
  type?: string
) {
  switch (type) {
    case "general":
      return "一般消費";

    case "physical":
      return "實體消費";

    case "online":
      return "網路消費";

    case "selected":
      return "指定通路";

    default:
      return "依活動規則";
  }
}


function regionLabels(
  regions: string[]
) {
  const labels: Record<
    string,
    string
  > = {
    japan:
      "日本",

    korea:
      "韓國",

    thailand:
      "泰國",

    overseas:
      "海外",
  };


  return regions
    .map(
      (region) =>
        labels[region] ??
        region
    )
    .join("、");
}


function getCatalogValidRange(
  card: CardCatalogItem
) {
  if (
    card.rewardRules.length ===
    0
  ) {
    return null;
  }


  const starts =
    card.rewardRules
      .map(
        (rule) =>
          rule.validFrom
      )
      .sort();


  const ends =
    card.rewardRules
      .map(
        (rule) =>
          rule.validUntil
      )
      .sort();


  return {
    from:
      starts[0],

    until:
      ends[
        ends.length - 1
      ],
  };
}


// ========================================
// REWARD DETAILS
// ========================================

function RewardDetails({
  card,
}: {
  card: CardCatalogItem;
}) {
  const validRange =
    getCatalogValidRange(
      card
    );


  return (
    <div className="mt-4 rounded-2xl bg-slate-50 p-4">

      {/* UNKNOWN */}

      {card.rewardRules.length ===
        0 && (
        <div>

          <p className="text-xs font-bold text-amber-600">
            ⚠ 詳細優惠規則尚待確認
          </p>


          <p className="mt-2 text-[11px] leading-5 text-slate-500">
            目前只收錄銀行公開的最高回饋摘要，
            尚未將門檻、指定通路、登錄與額度完整轉成可計算規則。
          </p>

        </div>
      )}


      {/* RULES */}

      {card.rewardRules.length >
        0 && (
        <div className="space-y-4">

          {card.rewardRules.map(
            (rule) => (
              <div
                key={
                  rule.id
                }
                className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0"
              >

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <p className="text-xs font-bold text-slate-800">
                      {
                        rule.label
                      }
                    </p>


                    <p className="mt-1 text-[10px] text-slate-400">

                      {
                        regionLabels(
                          rule.regions
                        )
                      }

                      {" · "}

                      {
                        spendingTypeLabel(
                          rule.spendingType
                        )
                      }

                    </p>

                  </div>


                  <p className="shrink-0 text-sm font-bold text-blue-600">
                    {
                      rule.rewardRate
                    }
                    %
                  </p>

                </div>


                <div className="mt-3 space-y-1.5 text-[10px] leading-5 text-slate-500">

                  {/* DATE */}

                  <p>
                    活動期間：
                    {
                      formatDate(
                        rule.validFrom
                      )
                    }
                    {" — "}
                    {
                      formatDate(
                        rule.validUntil
                      )
                    }
                  </p>


                  {/* MINIMUM */}

                  {rule.minimumSpendTWD !==
                    undefined && (
                    <p>
                      消費門檻：
                      {
                        formatTWD(
                          rule.minimumSpendTWD
                        )
                      }
                    </p>
                  )}


                  {/* ELIGIBLE SPEND CAP */}

                  {rule.eligibleSpendCapTWD !==
                    undefined && (
                    <p>
                      符合回饋消費上限：
                      {
                        formatTWD(
                          rule.eligibleSpendCapTWD
                        )
                      }
                    </p>
                  )}


                  {/* REWARD CAP */}

                  {rule.rewardAmountCapTWD !==
                    undefined && (
                    <p>
                      回饋金上限：
                      {
                        formatTWD(
                          rule.rewardAmountCapTWD
                        )
                      }
                    </p>
                  )}


                  {/* REGISTRATION */}

                  {rule.registrationRequired && (
                    <p className="font-bold text-amber-600">
                      ⚠ 需要登錄
                    </p>
                  )}


                  {/* NOTE */}

                  {rule.note && (
                    <p>
                      {
                        rule.note
                      }
                    </p>
                  )}

                </div>

              </div>
            )
          )}

        </div>
      )}


      {/* REQUIREMENTS */}

      {card.requirements &&
        card.requirements.length >
          0 && (
          <div className="mt-5 border-t border-slate-200 pt-4">

            <p className="text-[10px] font-bold tracking-wide text-slate-500">
              必備條件
            </p>


            <div className="mt-2 space-y-1.5">

              {card.requirements.map(
                (
                  requirement,
                  index
                ) => (
                  <p
                    key={`${requirement}-${index}`}
                    className="text-[10px] leading-5 text-slate-500"
                  >
                    •{" "}
                    {
                      requirement
                    }
                  </p>
                )
              )}

            </div>

          </div>
        )}


      {/* VALID RANGE */}

      {validRange && (
        <div className="mt-4 border-t border-slate-200 pt-4">

          <p className="text-[10px] font-bold text-slate-500">
            已收錄優惠期間
          </p>


          <p className="mt-1 text-[10px] text-slate-500">

            {
              formatDate(
                validRange.from
              )
            }

            {" — "}

            {
              formatDate(
                validRange.until
              )
            }

          </p>

        </div>
      )}


      {/* VERIFIED */}

      <div className="mt-4 border-t border-slate-200 pt-4">

        <p className="text-[10px] text-slate-400">
          最後確認：
          {
            formatDate(
              card.verifiedAt
            )
          }
        </p>


        <a
          href={
            card.officialUrl
          }
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex text-xs font-bold text-blue-600"
        >
          ↗ 銀行官方資訊
        </a>

      </div>

    </div>
  );
}


// ========================================
// PAGE
// ========================================

export default function CardsPage() {
  const {
    loaded:
      expenseLoaded,

    currentMember,
  } = useExpenseData();


  const {
    loaded:
      tripSettingsLoaded,

    settings:
      tripSettings,
  } = useTripSettings();


  const {
    loaded: exchangeLoaded,
    refreshing: exchangeRefreshing,
    error: exchangeError,
    activeRate,
    useManualRate,
    isStale,
    refreshRate,
    setManualRate,
    useLiveRate,
  } = useExchangeRate();


  const {
    loaded:
      cardsLoaded,

    cards,
    activeCards,

    addCatalogCard,
    addCustomCard,

    updatePreTripSpent,

    toggleCardActive,

    deleteCard,
  } = useCreditCards(
    currentMember?.id
  );


  // ========================================
  // STATES
  // ========================================

  const [
    catalogOpen,
    setCatalogOpen,
  ] = useState(false);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    customOpen,
    setCustomOpen,
  ] = useState(false);


  const [
    customIssuer,
    setCustomIssuer,
  ] = useState("");


  const [
    customName,
    setCustomName,
  ] = useState("");


  const [
    editingSpendCard,
    setEditingSpendCard,
  ] = useState<
    MyTravelCard | null
  >(null);


  const [
    spendInput,
    setSpendInput,
  ] = useState("");


  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<
    MyTravelCard | null
  >(null);


  const [
    expandedMyCardId,
    setExpandedMyCardId,
  ] = useState<
    string | null
  >(null);


  const [
    expandedCatalogId,
    setExpandedCatalogId,
  ] = useState<
    string | null
  >(null);


  const [
    actionMenuCardId,
    setActionMenuCardId,
  ] = useState<string | null>(null);


  const [
    manualRateOpen,
    setManualRateOpen,
  ] = useState(false);


  const [
    manualRateInput,
    setManualRateInput,
  ] = useState("");


  useEffect(() => {
    if (!exchangeLoaded) return;

    if (!activeRate || isStale) {
      void refreshRate();
    }
  }, [exchangeLoaded, activeRate, isStale, refreshRate]);


  // ========================================
  // CATALOG SEARCH
  // ========================================

  const filteredCatalog =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();


      if (!keyword) {
        return cardCatalog;
      }


      return cardCatalog.filter(
        (card) =>
          `${card.issuer} ${card.name}`
            .toLowerCase()
            .includes(
              keyword
            )
      );
    }, [search]);


  // ========================================
  // ADDED IDS
  // ========================================

  const addedCatalogIds =
    useMemo(
      () =>
        new Set(
          cards
            .map(
              (card) =>
                card.catalogCardId
            )
            .filter(
              (
                value
              ): value is string =>
                Boolean(value)
            )
        ),
      [cards]
    );


  // ========================================
  // CUSTOM CARD
  // ========================================

  function handleSaveCustom() {
    const success =
      addCustomCard(
        customIssuer,
        customName
      );


    if (!success) {
      return;
    }


    setCustomIssuer("");
    setCustomName("");
    setCustomOpen(false);
  }


  // ========================================
  // PRE TRIP SPENDING
  // ========================================

  function openSpendEditor(
    card: MyTravelCard
  ) {
    setEditingSpendCard(
      card
    );


    setSpendInput(
      String(
        card.preTripSpentTWD
      )
    );
  }


  function savePreTripSpent() {
    if (
      !editingSpendCard
    ) {
      return;
    }


    const amount =
      Number(spendInput);


    if (
      !Number.isFinite(
        amount
      ) ||
      amount < 0
    ) {
      return;
    }


    updatePreTripSpent(
      editingSpendCard.id,
      amount
    );


    setEditingSpendCard(
      null
    );
  }


  function openManualRate() {
    setManualRateInput(
      activeRate ? String(activeRate.rate) : ""
    );
    setManualRateOpen(true);
  }


  function saveManualRate() {
    const rate = Number(manualRateInput);

    if (!Number.isFinite(rate) || rate <= 0) return;

    const success = setManualRate(rate);
    if (success) setManualRateOpen(false);
  }


  // ========================================
  // LOADING
  // ========================================

  if (
    !expenseLoaded ||
    !cardsLoaded ||
    !tripSettingsLoaded ||
    !exchangeLoaded
  ) {
    return (
      <main className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-md px-5 pt-6">

          <div className="h-14 animate-pulse rounded-2xl bg-slate-200" />

          <div className="mt-5 h-40 animate-pulse rounded-[28px] bg-slate-200" />

        </div>

      </main>
    );
  }


  // ========================================
  // NO IDENTITY
  // ========================================

  if (!currentMember) {
    return (
      <main className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-md px-5 pt-20 text-center">

          <div className="text-4xl">
            💳
          </div>


          <h1 className="mt-4 text-xl font-bold text-slate-900">
            尚未選擇身份
          </h1>


          <p className="mt-2 text-sm text-slate-400">
            請先回首頁選擇你是誰。
          </p>


          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-bold text-white"
          >
            回首頁
          </Link>

        </div>

      </main>
    );
  }


  // ========================================
  // UI
  // ========================================

  return (
    <main className="min-h-screen bg-slate-50 pb-28">

      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">

          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600"
          >
            ‹
          </Link>


          <div className="text-center">

            <p className="text-[9px] font-bold tracking-[0.22em] text-blue-600">
              CARD STATUS
            </p>

            <h1 className="mt-0.5 text-sm font-bold text-slate-900">
              我的旅行信用卡
            </h1>

          </div>


          <button
            type="button"
            onClick={() =>
              setCatalogOpen(
                true
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xl font-light text-white"
          >
            ＋
          </button>

        </div>

      </header>


      <div className="mx-auto max-w-md px-5 pt-5">

        {/* HERO */}

        <section className="rounded-[24px] bg-slate-900 p-4 text-white">

          <p className="text-[9px] font-bold tracking-[0.2em] text-blue-300">
            TRAVEL WALLET
          </p>


          <div className="mt-2 flex items-end justify-between">

            <div>

              <h2 className="text-lg font-bold">
                {currentMember.name}
                的卡片
              </h2>


              <p className="mt-0.5 text-[11px] text-slate-400">

                {
                  formatDate(
                    tripSettings.startDate
                  )
                }

                {" — "}

                {
                  formatDate(
                    tripSettings.endDate
                  )
                }

              </p>

            </div>


            <div className="text-right">

              <p className="text-2xl font-bold">
                {
                  activeCards.length
                }
              </p>

              <p className="text-[9px] text-slate-400">
                張使用中
              </p>

            </div>

          </div>

        </section>


        {/* REFERENCE RATE */}

        <section className="mt-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-bold tracking-[0.16em] text-slate-400">
                REFERENCE RATE
              </p>

              {activeRate ? (
                <>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    🇯🇵 ¥1 ≈ NT${activeRate.rate.toFixed(4)}
                  </p>
                  <p className="mt-0.5 text-[9px] text-slate-400">
                    {useManualRate ? "手動匯率" : "參考匯率"}
                    {" · "}
                    {new Date(activeRate.capturedAt).toLocaleString("zh-TW", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" · ¥10,000 ≈ "}
                    {formatTWD(10000 * activeRate.rate)}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  尚無參考匯率
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => void refreshRate()}
                disabled={exchangeRefreshing}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 disabled:opacity-40"
                aria-label="更新匯率"
              >
                {exchangeRefreshing ? "…" : "↻"}
              </button>

              <button
                type="button"
                onClick={useManualRate ? useLiveRate : openManualRate}
                className="h-8 rounded-full bg-slate-100 px-3 text-[10px] font-bold text-slate-600"
              >
                {useManualRate ? "改自動" : "手動"}
              </button>
            </div>
          </div>

          {exchangeError && (
            <p className="mt-2 text-[9px] leading-4 text-amber-600">
              {exchangeError}
            </p>
          )}
        </section>


        {/* EMPTY */}

        {cards.length ===
          0 && (
          <section className="mt-4 rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-9 text-center">

            <div className="text-4xl">
              💳
            </div>


            <h2 className="mt-4 text-base font-bold text-slate-900">
              選擇這趟要帶的卡
            </h2>


            <p className="mx-auto mt-2 max-w-[260px] text-xs leading-5 text-slate-400">
              不用自己輸入優惠。
              從整理好的卡庫直接加入即可。
            </p>


            <button
              type="button"
              onClick={() =>
                setCatalogOpen(
                  true
                )
              }
              className="mt-5 h-11 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white"
            >
              從卡庫加入
            </button>

          </section>
        )}


        {/* MY CARDS */}

        {cards.length >
          0 && (
          <section className="mt-6">

            <div className="flex items-end justify-between">

              <div>

                <p className="text-[9px] font-bold tracking-[0.18em] text-slate-400">
                  MY CARDS
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  這趟帶的卡
                </h2>

              </div>


              <button
                type="button"
                onClick={() =>
                  setCatalogOpen(
                    true
                  )
                }
                className="text-xs font-bold text-blue-600"
              >
                ＋ 加入
              </button>

            </div>


            <div className="mt-3 space-y-3">

              {cards.map(
                (card) => {
                  const catalogCard =
                    getCatalogCard(
                      card
                    );


                  const status =
                    catalogCard
                      ? getTripOfferStatus(
                          catalogCard,
                          tripSettings.startDate,
                          tripSettings.endDate
                        )
                      : "unknown";


                  const statusUI =
                    getStatusUI(
                      status
                    );


                  const expanded =
                    expandedMyCardId ===
                    card.id;


                  return (
                    <article
                      key={
                        card.id
                      }
                      className={`relative rounded-[22px] border bg-white p-4 shadow-sm ${
                        card.isActive
                          ? "border-slate-100"
                          : "border-slate-200 opacity-60"
                      }`}
                    >

                      {/* TOP */}

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <div className="flex flex-wrap gap-1.5">

                            <span
                              className={`rounded-full px-2 py-1 text-[9px] font-bold ${statusUI.className}`}
                            >
                              {
                                statusUI.label
                              }
                            </span>


                            {!card.isActive && (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-400">
                                未使用
                              </span>
                            )}

                          </div>


                          <h3 className="mt-2 text-[15px] font-bold text-slate-900">
                            {
                              getCardName(
                                card
                              )
                            }
                          </h3>


                          <p className="mt-1 text-xs text-slate-400">
                            {
                              getCardIssuer(
                                card
                              )
                            }
                          </p>

                        </div>


                        <div className="flex shrink-0 items-start gap-2">
                          {catalogCard && (
                            <div className="text-right">
                              <p className="text-xl font-bold leading-none text-blue-600">
                                {catalogCard.headlineRewardRate}%
                              </p>
                              <p className="mt-1 text-[9px] text-slate-400">
                                最高
                              </p>
                            </div>
                          )}

                          <button
                            type="button"
                            aria-label="卡片設定"
                            onClick={() =>
                              setActionMenuCardId((current) =>
                                current === card.id ? null : card.id
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full text-xl font-bold leading-none text-slate-400 hover:bg-slate-100"
                          >
                            ⋮
                          </button>
                        </div>

                      </div>


                      {/* PRE TRIP */}

                      <button
                        type="button"
                        onClick={() =>
                          openSpendEditor(
                            card
                          )
                        }
                        className="mt-3 flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-left"
                      >

                        <div>

                          <p className="text-[9px] font-bold tracking-wide text-slate-400">
                            出發前已刷
                          </p>

                          <p className="mt-0.5 text-sm font-bold text-slate-800">
                            {
                              formatTWD(
                                card.preTripSpentTWD
                              )
                            }
                          </p>

                        </div>


                        <span className="text-xs font-bold text-blue-600">
                          編輯
                        </span>

                      </button>


                      {/* DETAILS */}

                      {catalogCard && (
                        <div className="mt-2">

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedMyCardId(
                                (
                                  current
                                ) =>
                                  current ===
                                  card.id
                                    ? null
                                    : card.id
                              )
                            }
                            className="flex w-full items-center justify-between py-1 text-left"
                          >

                            <span className="text-xs font-bold text-blue-600">

                              {expanded
                                ? "▲ 收起回饋條件"
                                : "▼ 查看回饋條件"}

                            </span>


                            <span className="text-[10px] text-slate-400">

                              最後確認{" "}

                              {
                                formatDate(
                                  catalogCard.verifiedAt
                                )
                              }

                            </span>

                          </button>


                          {expanded && (
                            <RewardDetails
                              card={
                                catalogCard
                              }
                            />
                          )}

                        </div>
                      )}


                      {/* CARD ACTION MENU */}

                      {actionMenuCardId === card.id && (
                        <div className="absolute right-4 top-12 z-20 w-44 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl">
                          <button
                            type="button"
                            onClick={() => {
                              toggleCardActive(card.id);
                              setActionMenuCardId(null);
                            }}
                            className="flex h-10 w-full items-center rounded-xl px-3 text-left text-xs font-bold text-slate-600 hover:bg-slate-50"
                          >
                            {card.isActive ? "⏸  暫停使用" : "▶  加入這趟"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget(card);
                              setActionMenuCardId(null);
                            }}
                            className="flex h-10 w-full items-center rounded-xl px-3 text-left text-xs font-bold text-rose-500 hover:bg-rose-50"
                          >
                            🗑  從這趟旅行移除
                          </button>
                        </div>
                      )}

                    </article>
                  );
                }
              )}

            </div>

          </section>
        )}

      </div>


      {/* CATALOG */}

      {catalogOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center">

          <button
            type="button"
            aria-label="關閉"
            onClick={() =>
              setCatalogOpen(
                false
              )
            }
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
          />


          <section className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col rounded-t-[32px] bg-white shadow-2xl">

            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>


            <div className="px-5 pb-4 pt-3">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[9px] font-bold tracking-[0.2em] text-blue-600">
                    CARD CATALOG
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    加入信用卡
                  </h2>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setCatalogOpen(
                      false
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-400"
                >
                  ×
                </button>

              </div>


              <input
                type="search"
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event
                      .target
                      .value
                  )
                }
                placeholder="搜尋銀行或信用卡..."
                className="mt-4 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
              />

            </div>


            <div className="overflow-y-auto px-5 pb-8">

              <div className="space-y-3">

                {filteredCatalog.map(
                  (
                    catalogCard
                  ) => {
                    const added =
                      addedCatalogIds.has(
                        catalogCard.id
                      );


                    const status =
                      getTripOfferStatus(
                        catalogCard,
                        tripSettings.startDate,
                        tripSettings.endDate
                      );


                    const statusUI =
                      getStatusUI(
                        status
                      );


                    const expanded =
                      expandedCatalogId ===
                      catalogCard.id;


                    return (
                      <article
                        key={
                          catalogCard.id
                        }
                        className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <span
                              className={`rounded-full px-2 py-1 text-[9px] font-bold ${statusUI.className}`}
                            >
                              {
                                statusUI.label
                              }
                            </span>


                            <p className="mt-3 text-[10px] font-bold text-slate-400">
                              {
                                catalogCard.issuer
                              }
                            </p>


                            <h3 className="mt-1 text-sm font-bold text-slate-900">
                              {
                                catalogCard.name
                              }
                            </h3>

                          </div>


                          <div className="shrink-0 text-right">

                            <p className="text-2xl font-bold text-blue-600">
                              {
                                catalogCard.headlineRewardRate
                              }
                              %
                            </p>

                            <p className="text-[9px] text-slate-400">
                              最高回饋
                            </p>

                          </div>

                        </div>


                        {catalogCard.note && (
                          <p className="mt-3 text-[11px] leading-5 text-slate-500">
                            {
                              catalogCard.note
                            }
                          </p>
                        )}


                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCatalogId(
                              (
                                current
                              ) =>
                                current ===
                                catalogCard.id
                                  ? null
                                  : catalogCard.id
                            )
                          }
                          className="mt-3 text-xs font-bold text-blue-600"
                        >
                          {expanded
                            ? "▲ 收起回饋條件"
                            : "▼ 查看回饋條件"}
                        </button>


                        {expanded && (
                          <RewardDetails
                            card={
                              catalogCard
                            }
                          />
                        )}


                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                          <p className="text-[9px] text-slate-400">
                            驗證{" "}
                            {
                              formatDate(
                                catalogCard.verifiedAt
                              )
                            }
                          </p>


                          <button
                            type="button"
                            disabled={
                              added
                            }
                            onClick={() =>
                              addCatalogCard(
                                catalogCard.id
                              )
                            }
                            className={`h-9 rounded-xl px-4 text-xs font-bold ${
                              added
                                ? "bg-slate-100 text-slate-400"
                                : "bg-slate-900 text-white"
                            }`}
                          >
                            {added
                              ? "✓ 已加入"
                              : "＋ 加入"}
                          </button>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>


              <button
                type="button"
                onClick={() =>
                  setCustomOpen(
                    true
                  )
                }
                className="mt-4 h-11 w-full rounded-xl border border-dashed border-slate-300 text-xs font-bold text-slate-500"
              >
                找不到？＋ 自訂信用卡
              </button>

            </div>

          </section>

        </div>
      )}


      {/* CUSTOM */}

      {customOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">

          <button
            type="button"
            aria-label="關閉"
            onClick={() =>
              setCustomOpen(
                false
              )
            }
            className="absolute inset-0 bg-slate-950/45"
          />


          <section className="relative z-10 w-full max-w-sm rounded-[28px] bg-white p-5">

            <p className="text-[9px] font-bold tracking-[0.2em] text-blue-600">
              CUSTOM CARD
            </p>


            <h2 className="mt-1 text-xl font-bold text-slate-900">
              自訂信用卡
            </h2>


            <p className="mt-2 text-xs leading-5 text-slate-400">
              卡庫找不到時才需要手動建立。
              自訂卡目前不會自動套用優惠規則。
            </p>


            <input
              value={
                customIssuer
              }
              onChange={(
                event
              ) =>
                setCustomIssuer(
                  event
                    .target
                    .value
                )
              }
              placeholder="銀行，例如：台新銀行"
              className="mt-5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
            />


            <input
              value={
                customName
              }
              onChange={(
                event
              ) =>
                setCustomName(
                  event
                    .target
                    .value
                )
              }
              placeholder="卡片名稱"
              className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
            />


            <div className="mt-5 grid grid-cols-2 gap-2">

              <button
                type="button"
                onClick={() =>
                  setCustomOpen(
                    false
                  )
                }
                className="h-11 rounded-xl bg-slate-100 text-sm font-bold text-slate-600"
              >
                取消
              </button>


              <button
                type="button"
                onClick={
                  handleSaveCustom
                }
                disabled={
                  !customName.trim()
                }
                className="h-11 rounded-xl bg-slate-900 text-sm font-bold text-white disabled:opacity-40"
              >
                加入
              </button>

            </div>

          </section>

        </div>
      )}


      {/* PRE TRIP SPEND */}

      {editingSpendCard && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">

          <button
            type="button"
            aria-label="關閉"
            onClick={() =>
              setEditingSpendCard(
                null
              )
            }
            className="absolute inset-0 bg-slate-950/45"
          />


          <section className="relative z-10 w-full max-w-sm rounded-[28px] bg-white p-5">

            <p className="text-[9px] font-bold tracking-[0.2em] text-blue-600">
              PRE-TRIP SPEND
            </p>


            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {
                getCardName(
                  editingSpendCard
                )
              }
            </h2>


            <p className="mt-2 text-xs leading-5 text-slate-400">
              填入出發前已經占用同一信用卡活動額度的消費。
            </p>


            <div className="mt-5 flex h-14 items-center rounded-2xl bg-slate-50 px-4">

              <span className="text-sm font-bold text-slate-400">
                NT$
              </span>


              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={
                  spendInput
                }
                onChange={(
                  event
                ) =>
                  setSpendInput(
                    event
                      .target
                      .value
                  )
                }
                className="ml-2 min-w-0 flex-1 bg-transparent text-right text-xl font-bold text-slate-900 outline-none"
              />

            </div>


            <div className="mt-5 grid grid-cols-2 gap-2">

              <button
                type="button"
                onClick={() =>
                  setEditingSpendCard(
                    null
                  )
                }
                className="h-11 rounded-xl bg-slate-100 text-sm font-bold text-slate-600"
              >
                取消
              </button>


              <button
                type="button"
                onClick={
                  savePreTripSpent
                }
                className="h-11 rounded-xl bg-slate-900 text-sm font-bold text-white"
              >
                儲存
              </button>

            </div>

          </section>

        </div>
      )}


      {/* MANUAL EXCHANGE RATE */}

      {manualRateOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
          <button
            type="button"
            aria-label="關閉"
            onClick={() => setManualRateOpen(false)}
            className="absolute inset-0 bg-slate-950/45"
          />

          <section className="relative z-10 w-full max-w-sm rounded-[28px] bg-white p-5">
            <p className="text-[9px] font-bold tracking-[0.2em] text-blue-600">
              MANUAL RATE
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              手動設定日圓匯率
            </h2>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              輸入 ¥1 約等於多少新台幣。之後可以隨時切回自動參考匯率。
            </p>

            <div className="mt-5 flex h-14 items-center rounded-2xl bg-slate-50 px-4">
              <span className="text-sm font-bold text-slate-400">
                ¥1 = NT$
              </span>
              <input
                type="number"
                min="0"
                step="0.0001"
                inputMode="decimal"
                value={manualRateInput}
                onChange={(event) => setManualRateInput(event.target.value)}
                className="ml-2 min-w-0 flex-1 bg-transparent text-right text-xl font-bold text-slate-900 outline-none"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setManualRateOpen(false)}
                className="h-11 rounded-xl bg-slate-100 text-sm font-bold text-slate-600"
              >
                取消
              </button>

              <button
                type="button"
                onClick={saveManualRate}
                className="h-11 rounded-xl bg-slate-900 text-sm font-bold text-white"
              >
                使用此匯率
              </button>
            </div>
          </section>
        </div>
      )}


      {/* DELETE */}

      {deleteTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">

          <button
            type="button"
            aria-label="關閉"
            onClick={() =>
              setDeleteTarget(
                null
              )
            }
            className="absolute inset-0 bg-slate-950/45"
          />


          <section className="relative z-10 w-full max-w-sm rounded-[28px] bg-white p-5">

            <div className="text-3xl">
              💳
            </div>


            <h2 className="mt-4 text-xl font-bold text-slate-900">
              移除這張卡？
            </h2>


            <p className="mt-2 text-sm text-slate-500">
              {
                getCardName(
                  deleteTarget
                )
              }
            </p>


            <p className="mt-2 text-xs leading-5 text-slate-400">
              這只會從你的旅行卡片中移除，
              不會刪除 Card Catalog 的優惠資料。
            </p>


            <div className="mt-6 grid grid-cols-2 gap-2">

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
                className="h-11 rounded-xl bg-slate-100 text-sm font-bold text-slate-600"
              >
                取消
              </button>


              <button
                type="button"
                onClick={() => {
                  deleteCard(
                    deleteTarget.id
                  );

                  setDeleteTarget(
                    null
                  );
                }}
                className="h-11 rounded-xl bg-rose-500 text-sm font-bold text-white"
              >
                移除
              </button>

            </div>

          </section>

        </div>
      )}

    </main>
  );
}