"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  TripDay,
  TripItem,
} from "../../data/tripData";

import {
  getItemStatus,
} from "../../lib/tripStatus";


type Props = {
  item: TripItem;
  day: TripDay;
  now: Date;
  isLast: boolean;
  note: string;
  onOpenGuide: (item: TripItem) => void;
  onEdit: (item: TripItem) => void;
  onDelete: (item: TripItem) => void;
};

const typeConfig = {
  sightseeing: {
    label: "景點",
    icon: "⛩️",
    dot: "bg-[#D6AD51]",
    badge:
      "text-[#805C17] bg-[#FFF0C7] border border-[#E9CE8B]",
  },

  food: {
    label: "餐飲",
    icon: "🍴",
    dot: "bg-[#D98B9E]",
    badge:
      "text-[#925568] bg-[#FBE8EE] border border-[#EFCBD5]",
  },

  transport: {
    label: "交通",
    icon: "🚆",
    dot: "bg-[#8DB99B]",
    badge:
      "text-[#4C775A] bg-[#EAF4E9] border border-[#CFE2CF]",
  },

  hotel: {
    label: "住宿",
    icon: "🏨",
    dot: "bg-[#B4A2C8]",
    badge:
      "text-[#75618C] bg-[#F1ECF6] border border-[#DCD0E8]",
  },
};

export default function ItineraryItem({
  item,
  day,
  now,
  isLast,
  note,
  onOpenGuide,
  onEdit,
  onDelete,
}: Props) {

  const config =
    typeConfig[item.type];

  const [menuOpen, setMenuOpen] = useState(false);


  // ========================================
  // 行程狀態
  // ========================================

  const status =
    getItemStatus(
      day,
      item,
      now
    );


  const isCompleted =
    status === "completed";

  const isNow =
    status === "now";

  const isNext =
    status === "next";


  // ========================================
  // COMPLETED EXPAND
  // ========================================

  // 已完成的行程預設收合
  //
  // 使用者仍然可以點開，
  // 查看完整資訊、景點介紹與導航。

  const [
    completedExpanded,
    setCompletedExpanded,
  ] = useState(false);


  // 如果時間推進，
  // 原本 NOW 的行程變成 completed，
  // 自動恢復成收合狀態。

  useEffect(() => {

    if (isCompleted) {
      setCompletedExpanded(false);
    }

  }, [isCompleted]);


  // ========================================
  // Google Maps
  // ========================================

  const mapUrl =
    item.location
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          item.location.mapQuery
        )}`
      : null;


  // ========================================
  // COMPLETED COMPACT ROW
  // ========================================

  if (
    isCompleted &&
    !completedExpanded
  ) {

    return (

      <div className="grid grid-cols-[55px_25px_minmax(0,1fr)]">


        {/* =================================
            TIME
        ================================= */}

        <div className="pt-1 text-right">

          <p className="text-sm font-bold text-[#B0A69B]">

            {item.startTime}

          </p>

        </div>


        {/* =================================
            TIMELINE
        ================================= */}

        <div className="relative flex justify-center">


          {/* Timeline line */}

          {!isLast && (

            <div className="absolute bottom-0 top-5 w-px bg-[#D9CBB5]" />

          )}


          {/* Completed check */}

          <div className="relative z-10 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#D9CBB5] text-[9px] font-bold text-white ring-4 ring-[#FFFCF6]">

            ✓

          </div>

        </div>


        {/* =================================
            COMPACT CONTENT
        ================================= */}

        <div className="pb-5 pl-2">

          <button
            type="button"
            onClick={() =>
              setCompletedExpanded(true)
            }
            className="group w-full rounded-2xl px-3 py-1 text-left transition active:bg-[#F5F0E7]"
          >

            <div className="flex items-center gap-3">


              {/* Text */}

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2">

                  <h3 className="truncate text-sm font-bold text-[#91877B]">

                    {item.name}

                  </h3>


                  <span className="shrink-0 text-[9px] font-bold tracking-[0.12em] text-[#B0A69B]">

                    DONE

                  </span>

                </div>


                <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-[#B0A69B]">


                  {/* Detail */}

                  {item.detail && (

                    <span>
                      {item.detail}
                    </span>

                  )}


                  {/* Separator */}

                  {item.detail &&
                    item.endTime && (

                      <span>
                        ·
                      </span>

                    )}


                  {/* Time */}

                  {item.endTime && (

                    <span>

                      {item.startTime}
                      {"–"}
                      {item.endTime}

                    </span>

                  )}

                </div>

              </div>


              {/* Expand */}

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F0E7] text-xs text-[#B0A69B] transition group-active:scale-95">

                ›

              </div>

            </div>

          </button>

        </div>

      </div>

    );

  }


  // ========================================
  // FULL CARD
  // ========================================

  return (

    <div
      className={`grid grid-cols-[55px_25px_minmax(0,1fr)] transition ${
        isCompleted
          ? "opacity-60"
          : "opacity-100"
      }`}
    >


      {/* =================================
          TIME
      ================================= */}

      <div className="pt-1 text-right">

        <p
          className={`text-sm font-bold ${
            isNow
              ? "text-[#9C6D16]"
              : isCompleted
              ? "text-[#91877B]"
              : "text-[#3E3A39]"
          }`}
        >

          {item.startTime}

        </p>

      </div>


      {/* =================================
          TIMELINE
      ================================= */}

      <div className="relative flex justify-center">


        {/* Timeline 線 */}

        {!isLast && (

          <div className="absolute bottom-0 top-5 w-px bg-[#D9CBB5]" />

        )}


        {/* Completed */}

        {isCompleted ? (

          <div className="relative z-10 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#B6AC9D] text-[9px] font-bold text-white ring-4 ring-[#FFFCF6]">

            ✓

          </div>


        ) : isNow ? (

          /* NOW */

          <div className="relative z-10 mt-1 flex h-4 w-4 items-center justify-center">

            <span className="absolute h-4 w-4 animate-ping rounded-full bg-[#E7C469] opacity-40" />

            <span className="relative h-4 w-4 rounded-full bg-[#8DB99B] ring-4 ring-[#FFF0C7]" />

          </div>


        ) : isNext ? (

          /* NEXT */

          <div className="relative z-10 mt-1.5 h-3 w-3 rounded-full bg-[#3E3A39] ring-4 ring-slate-200" />


        ) : (

          /* UPCOMING */

          <div
            className={`relative z-10 mt-1.5 h-3 w-3 rounded-full ring-4 ring-[#FFFCF6] ${config.dot}`}
          />

        )}

      </div>


      {/* =================================
          CARD
      ================================= */}

      <div className="pb-7 pl-2">

        <article
          className={`rounded-[20px] bg-[#FFFEFB] p-4 transition ${
            isNow
              ? "border-2 border-[#E0B85D] shadow-[0_6px_20px_rgba(140,93,0,0.12)]"
              : isNext
              ? "border-2 border-[#D6AD51] shadow-[0_6px_20px_rgba(140,93,0,0.10)]"
              : "border border-[#E8DFD1] shadow-[0_3px_12px_rgba(62,58,57,0.05)]"
          }`}
        >


          {/* =================================
              COMPLETED HEADER
          ================================= */}

          {isCompleted && (

            <div className="mb-3 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#B6AC9D] text-[8px] font-bold text-white">

                  ✓

                </div>

                <span className="text-[10px] font-bold tracking-[0.15em] text-[#91877B]">

                  COMPLETED

                </span>

              </div>


              {/* Collapse */}

              <button
                type="button"
                onClick={() =>
                  setCompletedExpanded(false)
                }
                className="rounded-lg bg-[#F5F0E7] px-2.5 py-1.5 text-[10px] font-bold text-[#91877B] transition active:scale-95"
              >

                收起 ↑

              </button>

            </div>

          )}


          {/* =================================
              NOW
          ================================= */}

          {isNow && (

            <div className="mb-3 flex items-center gap-2">

              <span className="relative flex h-2.5 w-2.5">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E7C469] opacity-75" />

                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#8DB99B]" />

              </span>


              <span className="text-[10px] font-bold tracking-[0.15em] text-[#9C6D16]">

                NOW

              </span>

            </div>

          )}


          {/* =================================
              NEXT
          ================================= */}

          {isNext && (

            <div className="mb-3 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-[#3E3A39]" />

              <span className="text-[10px] font-bold tracking-[0.15em] text-[#74685D]">

                NEXT

              </span>

            </div>

          )}


          {/* =================================
              TYPE
          ================================= */}

          <div className="relative flex items-center justify-between gap-2">

            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span
                className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-bold ${config.badge}`}
              >
                {config.label}
              </span>
              {item.endTime && (
                <span className="inline-flex items-center rounded-lg bg-[#F8F4EC] px-2.5 py-1.5 text-[10px] font-medium text-[#82796F]">
                  ◷ {item.startTime} - {item.endTime}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-sm">{config.icon}</span>

              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-[#91877B] transition active:bg-[#F5F0E7]"
                aria-label="行程選單"
              >
                ⋮
              </button>
            </div>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="關閉行程選單"
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />

                <div className="absolute right-0 top-9 z-50 w-36 overflow-hidden rounded-2xl border border-[#E8DFD1] bg-white p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(item);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-slate-700 transition active:bg-[#F5F0E7]"
                  >
                    <span>✏️</span>
                    編輯行程
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(item);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-rose-600 transition active:bg-rose-50"
                  >
                    <span>🗑️</span>
                    刪除行程
                  </button>
                </div>
              </>
            )}

          </div>


          {/* =================================
              NAME
          ================================= */}

          <h3 className="mt-3 text-lg font-bold text-[#3E3A39]">

            {item.name}

          </h3>


          {/* =================================
              DETAIL
          ================================= */}

          {item.detail && (

            <p className="mt-1 text-xs text-[#82796F]">

              {item.detail}

            </p>

          )}


          {/* =================================
              OPENING HOURS
          ================================= */}

          {item.openingHours && (

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#FFF4DC] px-3 py-2 text-xs text-[#8C5D00]">

              <span>◷</span>

              <span>
                營業／參拜時間 {item.openingHours}
              </span>

            </div>

          )}


          {/* =================================
              USER NOTE PREVIEW
          ================================= */}

          {note && (

            <button
              type="button"
              onClick={() => onOpenGuide(item)}
              className="mt-3 w-full rounded-xl bg-[#F8F4EC] px-3 py-2.5 text-left transition active:scale-[0.99]"
            >

              <div className="flex items-start gap-2">

                <span className="mt-0.5 text-xs">📝</span>

                <div className="min-w-0 flex-1">

                  <p className="text-[10px] font-bold tracking-wider text-[#91877B]">
                    我的景點備註
                  </p>

                  <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs leading-5 text-[#74685D]">
                    {note}
                  </p>

                </div>

                <span className="text-xs text-[#B0A69B]">›</span>

              </div>

            </button>

          )}


          {/* =================================
              ADDRESS
          ================================= */}

          {item.location?.address && (

            <div className="mt-3 flex gap-2 text-xs leading-5 text-[#91877B]">

              <span>
                ⌖
              </span>

              <span>
                {item.location.address}
              </span>

            </div>

          )}


          {/* =================================
              BUTTONS
          ================================= */}

          <div className="mt-4 flex gap-2">


            {/* 景點介紹 */}

            {item.type ===
              "sightseeing" &&
              item.guide && (

                <button
                  type="button"
                  onClick={() =>
                    onOpenGuide(item)
                  }
                  className="flex-1 rounded-xl bg-[#3E3A39] px-3 py-2.5 text-xs font-bold text-white transition active:scale-[0.98]"
                >

                  景點介紹

                </button>

              )}


            {/* Google Maps */}

            {mapUrl && (

              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl border border-[#E6C36C] bg-[#F6D27A] px-3 py-2.5 text-center text-xs font-bold text-[#554018] transition active:scale-[0.98]"
              >

                導航 ↗

              </a>

            )}

          </div>

        </article>

      </div>

    </div>

  );
}