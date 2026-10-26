"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  TripItem,
  TripItemType,
} from "../../data/tripData";

type Props = {
  isOpen: boolean;
  day: number;
  onClose: () => void;
  onAdd: (
    day: number,
    item: TripItem
  ) => void;
};

type TypeOption = {
  type: TripItemType;
  label: string;
  icon: string;
};

type AiPlaceResult = {
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

type AiResponse = {
  result?: AiPlaceResult;

  meta?: {
    model?: string;
    checkedAt?: string;
  };

  error?: string;
};

const TYPE_OPTIONS: TypeOption[] = [
  {
    type: "sightseeing",
    label: "景點",
    icon: "⛩️",
  },
  {
    type: "food",
    label: "餐廳",
    icon: "🍴",
  },
  {
    type: "transport",
    label: "交通",
    icon: "🚆",
  },
  {
    type: "hotel",
    label: "飯店",
    icon: "🏨",
  },
];

export default function AddItinerarySheet({
  isOpen,
  day,
  onClose,
  onAdd,
}: Props) {
  const [
    type,
    setType,
  ] =
    useState<TripItemType>(
      "sightseeing"
    );

  const [
    name,
    setName,
  ] = useState("");

  const [
    detail,
    setDetail,
  ] = useState("");

  const [
    startTime,
    setStartTime,
  ] = useState("09:00");

  const [
    endTime,
    setEndTime,
  ] = useState("");

  const [
    address,
    setAddress,
  ] = useState("");

  const [
    openingHours,
    setOpeningHours,
  ] = useState("");

  const [
    closedDays,
    setClosedDays,
  ] = useState("");

  // ========================================
  // AI GUIDE
  // ========================================

  const [
    introduction,
    setIntroduction,
  ] = useState("");

  const [
    highlights,
    setHighlights,
  ] = useState("");

  const [
    story,
    setStory,
  ] = useState("");

  const [
    tips,
    setTips,
  ] = useState("");

  const [
    sourceName,
    setSourceName,
  ] = useState("");

  const [
    sourceUrl,
    setSourceUrl,
  ] = useState("");

  const [
    checkedAt,
    setCheckedAt,
  ] = useState("");

  const [
    isAiLoading,
    setIsAiLoading,
  ] = useState(false);

  const [
    aiError,
    setAiError,
  ] = useState("");

  const [
    hasAiResult,
    setHasAiResult,
  ] = useState(false);

  // ========================================
  // RESET
  // ========================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setType("sightseeing");
    setName("");
    setDetail("");
    setStartTime("09:00");
    setEndTime("");
    setAddress("");
    setOpeningHours("");
    setClosedDays("");

    setIntroduction("");
    setHighlights("");
    setStory("");
    setTips("");

    setSourceName("");
    setSourceUrl("");
    setCheckedAt("");

    setIsAiLoading(false);
    setAiError("");
    setHasAiResult(false);
  }, [
    isOpen,
    day,
  ]);

  if (!isOpen) {
    return null;
  }

  // ========================================
  // AI LOOKUP
  // ========================================

  async function handleAiLookup() {
    const cleanName =
      name.trim();

    if (!cleanName) {
      setAiError(
        "請先輸入景點名稱。"
      );

      return;
    }

    setIsAiLoading(true);
    setAiError("");

    try {
      const response =
        await fetch(
          "/api/place-guide",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name:
                cleanName,

              address:
                address.trim(),
            }),
          }
        );

      const data =
        (await response.json()) as AiResponse;

      if (
        !response.ok ||
        !data.result
      ) {
        throw new Error(
          data.error ||
            "景點資料查找失敗。"
        );
      }

      const result =
        data.result;

      // 名稱保留使用者輸入優先。
      // 只有目前名稱為空才由 AI 填。
      if (
        !name.trim() &&
        result.placeName
      ) {
        setName(
          result.placeName
        );
      }

      // 地址若 AI 有找到，
      // 可以直接填入，使用者仍能修改。
      if (result.address) {
        setAddress(
          result.address
        );
      }

      setOpeningHours(
        result.openingHours ||
          ""
      );

      setClosedDays(
        result.closedDays ||
          ""
      );

      setIntroduction(
        result.introduction ||
          ""
      );

      setHighlights(
        result.highlights ||
          ""
      );

      setStory(
        result.story ||
          ""
      );

      setTips(
        result.tips ||
          ""
      );

      setSourceName(
        result.sourceName ||
          ""
      );

      setSourceUrl(
        result.sourceUrl ||
          ""
      );

      setCheckedAt(
        data.meta
          ?.checkedAt ||
          new Date()
            .toISOString()
      );

      setHasAiResult(true);
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : "景點資料查找失敗，請稍後再試。"
      );
    } finally {
      setIsAiLoading(false);
    }
  }

  // ========================================
  // SUBMIT
  // ========================================

  function handleSubmit() {
    const cleanName =
      name.trim();

    if (!cleanName) {
      return;
    }

    const cleanDetail =
      detail.trim();

    const cleanAddress =
      address.trim();

    const cleanOpeningHours =
      openingHours.trim();

    const cleanClosedDays =
      closedDays.trim();

    const cleanIntroduction =
      introduction.trim();

    const cleanHighlights =
      highlights.trim();

    const cleanStory =
      story.trim();

    const cleanTips =
      tips.trim();

    const cleanSourceName =
      sourceName.trim();

    const cleanSourceUrl =
      sourceUrl.trim();

    const id =
      `custom-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    const hasGuide =
      type ===
        "sightseeing" &&
      (
        cleanIntroduction ||
        cleanHighlights ||
        cleanStory ||
        cleanTips
      );

    const item: TripItem = {
      id,
      type,
      startTime,
      name: cleanName,

      ...(endTime
        ? {
            endTime,
          }
        : {}),

      ...(cleanDetail
        ? {
            detail:
              cleanDetail,
          }
        : {}),

      ...(type ===
        "sightseeing" &&
      cleanOpeningHours
        ? {
            openingHours:
              cleanOpeningHours,
          }
        : {}),

      ...(type ===
        "sightseeing" &&
      cleanClosedDays
        ? {
            closedDays:
              cleanClosedDays,
          }
        : {}),

      ...(type ===
        "sightseeing" &&
      cleanSourceName &&
      checkedAt
        ? {
            placeInfoSource: {
              name:
                cleanSourceName,

              ...(cleanSourceUrl
                ? {
                    url:
                      cleanSourceUrl,
                  }
                : {}),

              checkedAt,
            },
          }
        : {}),

      ...(hasGuide
        ? {
            guide: {
              introduction:
                cleanIntroduction,

              highlights:
                cleanHighlights,

              story:
                cleanStory,

              tips:
                cleanTips,
            },
          }
        : {}),

      location: {
        name: cleanName,

        ...(cleanAddress
          ? {
              address:
                cleanAddress,
            }
          : {}),

        mapQuery:
          cleanAddress ||
          cleanName,
      },
    };

    onAdd(
      day,
      item
    );

    onClose();
  }

  const canSubmit =
    name.trim().length > 0 &&
    startTime.length > 0;

  return (
    <div className="fixed inset-0 z-50">
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="關閉新增行程"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      {/* SHEET */}

      <section className="absolute bottom-0 left-0 right-0 mx-auto max-h-[92vh] max-w-md overflow-y-auto rounded-t-[32px] bg-[#fffdfa]">
        {/* HANDLE */}

        <div className="sticky top-0 z-20 bg-[#fffdfa] pt-3">
          <div className="mx-auto h-1 w-10 rounded-full bg-slate-300" />
        </div>

        <div className="p-6">
          {/* HEADER */}

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold tracking-[0.18em] text-slate-400">
                NEW ITINERARY
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                新增行程
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                DAY {day}
              </p>
            </div>

            <button
              type="button"
              aria-label="關閉"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 transition active:scale-95"
            >
              ×
            </button>
          </div>

          {/* TYPE */}

          <section className="mt-7">
            <FieldLabel>
              類型
            </FieldLabel>

            <div className="mt-2 grid grid-cols-4 gap-2">
              {TYPE_OPTIONS.map(
                (option) => {
                  const active =
                    type ===
                    option.type;

                  return (
                    <button
                      key={
                        option.type
                      }
                      type="button"
                      onClick={() => {
                        setType(
                          option.type
                        );

                        setAiError("");
                      }}
                      className={`rounded-2xl px-2 py-3 text-center transition active:scale-95 ${
                        active
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <div className="text-lg">
                        {
                          option.icon
                        }
                      </div>

                      <div className="mt-1 text-[10px] font-bold">
                        {
                          option.label
                        }
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </section>

          {/* NAME */}

          <section className="mt-6">
            <FieldLabel>
              名稱
            </FieldLabel>

            <input
              value={name}
              onChange={(
                event
              ) => {
                setName(
                  event.target
                    .value
                );

                setAiError("");
              }}
              placeholder={
                type ===
                "sightseeing"
                  ? "例如：金閣寺"
                  : type ===
                    "food"
                  ? "例如：午餐"
                  : type ===
                    "transport"
                  ? "例如：前往嵐山"
                  : "例如：京都飯店"
              }
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-slate-400"
            />
          </section>

          {/* DETAIL */}

          <section className="mt-5">
            <FieldLabel>
              簡短說明
            </FieldLabel>

            <input
              value={detail}
              onChange={(
                event
              ) =>
                setDetail(
                  event.target
                    .value
                )
              }
              placeholder="選填"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-slate-400"
            />
          </section>

          {/* TIME */}

          <section className="mt-5">
            <FieldLabel>
              時間
            </FieldLabel>

            <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <input
                type="time"
                value={
                  startTime
                }
                onChange={(
                  event
                ) =>
                  setStartTime(
                    event.target
                      .value
                  )
                }
                className="h-12 min-w-0 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />

              <span className="text-xs text-slate-300">
                ～
              </span>

              <input
                type="time"
                value={
                  endTime
                }
                onChange={(
                  event
                ) =>
                  setEndTime(
                    event.target
                      .value
                  )
                }
                className="h-12 min-w-0 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </div>
          </section>

          {/* ADDRESS */}

          <section className="mt-5">
            <FieldLabel>
              地址 / 地點
            </FieldLabel>

            <input
              value={address}
              onChange={(
                event
              ) =>
                setAddress(
                  event.target
                    .value
                )
              }
              placeholder="選填，也可只填景點名稱"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-slate-400"
            />
          </section>

          {/* SIGHTSEEING */}

          {type ===
            "sightseeing" && (
            <section className="mt-6 rounded-2xl bg-amber-50 p-4">
              <div>
                <p className="text-[9px] font-bold tracking-[0.16em] text-amber-500">
                  PLACE INFO
                </p>

                <h3 className="mt-1 text-sm font-bold text-amber-900">
                  景點資訊
                </h3>

                <p className="mt-1 text-[11px] leading-5 text-amber-700">
                  可以自己填，也可以讓 AI 搜尋後再修改。
                </p>
              </div>

              {/* AI BUTTON */}

              <button
                type="button"
                disabled={
                  isAiLoading ||
                  !name.trim()
                }
                onClick={
                  handleAiLookup
                }
                className={`mt-4 flex h-12 w-full items-center justify-center rounded-xl text-xs font-bold transition ${
                  isAiLoading ||
                  !name.trim()
                    ? "cursor-not-allowed bg-amber-100 text-amber-400"
                    : "bg-amber-900 text-white active:scale-[0.99]"
                }`}
              >
                {isAiLoading
                  ? "✨ AI 正在查找景點資料..."
                  : hasAiResult
                  ? "↻ 重新 AI 查找"
                  : "✨ AI 查找景點資料"}
              </button>

              {/* ERROR */}

              {aiError && (
                <div className="mt-3 rounded-xl bg-red-50 px-3 py-3">
                  <p className="text-xs font-semibold text-red-700">
                    {aiError}
                  </p>
                </div>
              )}

              {/* HOURS */}

              <div className="mt-4">
                <FieldLabel>
                  營業／參拜時間
                </FieldLabel>

                <input
                  value={
                    openingHours
                  }
                  onChange={(
                    event
                  ) =>
                    setOpeningHours(
                      event.target
                        .value
                    )
                  }
                  placeholder="AI 查不到也可以手動輸入"
                  className="mt-2 h-12 w-full rounded-xl border border-amber-100 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-amber-300"
                />
              </div>

              {/* CLOSED */}

              <div className="mt-4">
                <FieldLabel>
                  休館日
                </FieldLabel>

                <input
                  value={
                    closedDays
                  }
                  onChange={(
                    event
                  ) =>
                    setClosedDays(
                      event.target
                        .value
                    )
                  }
                  placeholder="AI 查不到也可以手動輸入"
                  className="mt-2 h-12 w-full rounded-xl border border-amber-100 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-amber-300"
                />
              </div>

                {/* OFFICIAL HOURS SEARCH */}

                <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                    `${name.trim()} ${address.trim()} 官方 営業時間`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-amber-200 bg-white text-xs font-bold text-amber-800 transition active:scale-[0.99]"
                >
                🔎 搜尋官方營業資訊
                </a>

              {/* GUIDE */}

              {(hasAiResult ||
                introduction ||
                highlights ||
                story ||
                tips) && (
                <div className="mt-6 border-t border-amber-100 pt-5">
                  <p className="text-[9px] font-bold tracking-[0.16em] text-amber-500">
                    PLACE GUIDE
                  </p>

                  <h3 className="mt-1 text-sm font-bold text-amber-900">
                    景點介紹
                  </h3>

                  <GuideTextarea
                    label="關於這裡"
                    value={
                      introduction
                    }
                    onChange={
                      setIntroduction
                    }
                    placeholder="景點簡介"
                  />

                  <GuideTextarea
                    label="值得注意"
                    value={
                      highlights
                    }
                    onChange={
                      setHighlights
                    }
                    placeholder="值得看的地方"
                  />

                  <GuideTextarea
                    label="小故事"
                    value={
                      story
                    }
                    onChange={
                      setStory
                    }
                    placeholder="歷史、典故或小故事"
                  />

                  <GuideTextarea
                    label="推薦"
                    value={
                      tips
                    }
                    onChange={
                      setTips
                    }
                    placeholder="參觀建議"
                  />
                </div>
              )}

              {/* SOURCE */}

              {(sourceName ||
                sourceUrl ||
                checkedAt) && (
                <div className="mt-5 rounded-xl bg-white/80 px-3 py-3">
                  <p className="text-[9px] font-bold tracking-[0.14em] text-slate-400">
                    SOURCE
                  </p>

                  {sourceName && (
                    <p className="mt-2 text-xs font-semibold text-slate-700">
                      資料來源：
                      {sourceName}
                    </p>
                  )}

                  {sourceUrl && (
                    <a
                      href={
                        sourceUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block break-all text-[11px] leading-5 text-blue-600"
                    >
                      查看來源 ↗
                    </a>
                  )}

                  {checkedAt && (
                    <p className="mt-2 text-[10px] text-slate-400">
                      查詢日期：
                      {
                        checkedAt
                          .slice(
                            0,
                            10
                          )
                          .replaceAll(
                            "-",
                            "/"
                          )
                      }
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* SUBMIT */}

          <button
            type="button"
            disabled={
              !canSubmit ||
              isAiLoading
            }
            onClick={
              handleSubmit
            }
            className={`mt-8 flex h-14 w-full items-center justify-center rounded-2xl text-sm font-bold transition ${
              canSubmit &&
              !isAiLoading
                ? "bg-slate-900 text-white active:scale-[0.99]"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            ＋ 新增行程
          </button>
        </div>
      </section>
    </div>
  );
}

function FieldLabel({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <p className="text-[11px] font-bold text-slate-500">
      {children}
    </p>
  );
}

function GuideTextarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder: string;
}) {
  return (
    <div className="mt-4">
      <FieldLabel>
        {label}
      </FieldLabel>

      <textarea
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        rows={4}
        className="mt-2 w-full resize-none rounded-xl border border-amber-100 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-amber-300"
      />
    </div>
  );
}