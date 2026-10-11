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
  onOpenGuide: (item: TripItem) => void;
};


const typeConfig = {
  sightseeing: {
    label: "SIGHTSEEING",
    icon: "⛩️",
    dot: "bg-emerald-500",
    badge:
      "text-emerald-700 bg-emerald-50",
  },

  food: {
    label: "FOOD",
    icon: "🍴",
    dot: "bg-rose-500",
    badge:
      "text-rose-700 bg-rose-50",
  },

  transport: {
    label: "TRANSPORT",
    icon: "🚆",
    dot: "bg-blue-500",
    badge:
      "text-blue-700 bg-blue-50",
  },
};


export default function ItineraryItem({
  item,
  day,
  now,
  isLast,
  onOpenGuide,
}: Props) {

  const config =
    typeConfig[item.type];


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

      <div className="grid grid-cols-[54px_24px_1fr]">


        {/* =================================
            TIME
        ================================= */}

        <div className="pt-1 text-right">

          <p className="text-sm font-bold text-slate-300">

            {item.startTime}

          </p>

        </div>


        {/* =================================
            TIMELINE
        ================================= */}

        <div className="relative flex justify-center">


          {/* Timeline line */}

          {!isLast && (

            <div className="absolute bottom-0 top-5 w-px bg-slate-200" />

          )}


          {/* Completed check */}

          <div className="relative z-10 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-white ring-4 ring-slate-50">

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
            className="group w-full rounded-2xl px-3 py-1 text-left transition active:bg-slate-100"
          >

            <div className="flex items-center gap-3">


              {/* Text */}

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2">

                  <h3 className="truncate text-sm font-bold text-slate-400">

                    {item.name}

                  </h3>


                  <span className="shrink-0 text-[9px] font-bold tracking-[0.12em] text-slate-300">

                    DONE

                  </span>

                </div>


                <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-slate-300">


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

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-300 transition group-active:scale-95">

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
      className={`grid grid-cols-[54px_24px_1fr] transition ${
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
              ? "text-blue-600"
              : isCompleted
              ? "text-slate-400"
              : "text-slate-900"
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

          <div className="absolute bottom-0 top-5 w-px bg-slate-200" />

        )}


        {/* Completed */}

        {isCompleted ? (

          <div className="relative z-10 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-[9px] font-bold text-white ring-4 ring-slate-50">

            ✓

          </div>


        ) : isNow ? (

          /* NOW */

          <div className="relative z-10 mt-1 flex h-4 w-4 items-center justify-center">

            <span className="absolute h-4 w-4 animate-ping rounded-full bg-blue-400 opacity-40" />

            <span className="relative h-4 w-4 rounded-full bg-blue-500 ring-4 ring-blue-100" />

          </div>


        ) : isNext ? (

          /* NEXT */

          <div className="relative z-10 mt-1.5 h-3 w-3 rounded-full bg-slate-900 ring-4 ring-slate-200" />


        ) : (

          /* UPCOMING */

          <div
            className={`relative z-10 mt-1.5 h-3 w-3 rounded-full ring-4 ring-slate-50 ${config.dot}`}
          />

        )}

      </div>


      {/* =================================
          CARD
      ================================= */}

      <div className="pb-7 pl-2">

        <article
          className={`rounded-2xl bg-white p-4 transition ${
            isNow
              ? "border-2 border-blue-500 shadow-md"
              : isNext
              ? "border-2 border-slate-900 shadow-md"
              : "border border-slate-100 shadow-sm"
          }`}
        >


          {/* =================================
              COMPLETED HEADER
          ================================= */}

          {isCompleted && (

            <div className="mb-3 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 text-[8px] font-bold text-white">

                  ✓

                </div>

                <span className="text-[10px] font-bold tracking-[0.15em] text-slate-400">

                  COMPLETED

                </span>

              </div>


              {/* Collapse */}

              <button
                type="button"
                onClick={() =>
                  setCompletedExpanded(false)
                }
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-400 transition active:scale-95"
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

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />

                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />

              </span>


              <span className="text-[10px] font-bold tracking-[0.15em] text-blue-600">

                NOW

              </span>

            </div>

          )}


          {/* =================================
              NEXT
          ================================= */}

          {isNext && (

            <div className="mb-3 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-slate-900" />

              <span className="text-[10px] font-bold tracking-[0.15em] text-slate-600">

                NEXT

              </span>

            </div>

          )}


          {/* =================================
              TYPE
          ================================= */}

          <div className="flex items-center justify-between gap-2">

            <span
              className={`rounded-md px-2 py-1 text-[9px] font-bold tracking-wider ${config.badge}`}
            >

              {config.label}

            </span>


            <span className="text-sm">

              {config.icon}

            </span>

          </div>


          {/* =================================
              NAME
          ================================= */}

          <h3 className="mt-3 text-lg font-bold text-slate-900">

            {item.name}

          </h3>


          {/* =================================
              DETAIL
          ================================= */}

          {item.detail && (

            <p className="mt-1 text-xs text-slate-500">

              {item.detail}

            </p>

          )}


          {/* =================================
              DURATION
          ================================= */}

          {item.endTime && (

            <div className="mt-3 inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1.5">

              <span className="text-[10px] font-medium text-slate-500">

                ◷ {item.startTime} - {item.endTime}

              </span>

            </div>

          )}


          {/* =================================
              ADDRESS
          ================================= */}

          {item.location?.address && (

            <div className="mt-3 flex gap-2 text-xs leading-5 text-slate-400">

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
                  className="flex-1 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white transition active:scale-[0.98]"
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
                className="flex-1 rounded-xl bg-slate-100 px-3 py-2.5 text-center text-xs font-bold text-slate-700 transition active:scale-[0.98]"
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