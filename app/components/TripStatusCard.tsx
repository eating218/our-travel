"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import { useTripClock } from "../../hooks/useTripClock";
import { useTripSettings } from "../../hooks/useTripSettings";

import {
  tripData,
  TripDay,
  TripItem,
} from "../../data/tripData";

import {
  getNextTripItem,
  getTodayTripDay,
  getTripPhase,
} from "../../lib/tripStatus";


// ========================================
// TYPE
// ========================================

type Countdown = {
  days: number;
  hours: number;
};

type TripStatus =
  | "loading"
  | "before"
  | "during"
  | "after";


// ========================================
// DATE HELPERS
// ========================================

function formatShortDateRange(
  startDate: string,
  endDate: string
) {
  const start =
    startDate.split("-");

  const end =
    endDate.split("-");


  if (
    start.length !== 3 ||
    end.length !== 3
  ) {
    return "";
  }


  return `${start[1]}/${start[2]} - ${end[1]}/${end[2]}`;
}


function getTripDuration(
  startDate: string,
  endDate: string
) {
  if (
    !startDate ||
    !endDate
  ) {
    return "";
  }


  const start =
    new Date(
      `${startDate}T00:00:00`
    );

  const end =
    new Date(
      `${endDate}T00:00:00`
    );


  const difference =
    end.getTime() -
    start.getTime();


  const days =
    Math.floor(
      difference /
        (
          1000 *
          60 *
          60 *
          24
        )
    ) + 1;


  if (
    !Number.isFinite(days) ||
    days <= 0
  ) {
    return "";
  }


  return `${days} 天 ${Math.max(
    days - 1,
    0
  )} 夜`;
}


// ========================================
// TRIP STATUS CARD
// ========================================

export default function TripStatusCard() {

  // 全 App 共用時間
  // 測試時間 / 真實時間都由 useTripClock 處理
  const now =
    useTripClock();


  // ========================================
  // TRIP SETTINGS
  // ========================================

  const {
    loaded:
      tripSettingsLoaded,

    settings:
      tripSettings,
  } = useTripSettings();


  const activeTripName =
    tripSettingsLoaded
      ? tripSettings.name
      : tripData.name;


  const activeStartDate =
    tripSettingsLoaded
      ? tripSettings.startDate
      : tripData.startDate;


  const activeEndDate =
    tripSettingsLoaded
      ? tripSettings.endDate
      : tripData.endDate;


  // 旅程生命週期：
  // startDate 00:00 → 正式開始
  // endDate 23:59:59 → 正式結束

  const activeDepartAt =
    `${activeStartDate}T00:00:00`;

  const activeTripEnd =
    `${activeEndDate}T23:59:59`;


  const activeDuration =
    getTripDuration(
      activeStartDate,
      activeEndDate
    );


  const activeDateRange =
    formatShortDateRange(
      activeStartDate,
      activeEndDate
    );


  // ========================================
  // STATE
  // ========================================

  const [
    status,
    setStatus,
  ] =
    useState<TripStatus>(
      "loading"
    );


  const [
    currentDay,
    setCurrentDay,
  ] =
    useState<TripDay | null>(
      null
    );


  const [
    nextItem,
    setNextItem,
  ] =
    useState<TripItem | null>(
      null
    );


  const [
    countdown,
    setCountdown,
  ] =
    useState<Countdown | null>(
      null
    );


  // ========================================
  // TRIP STATUS
  // ========================================

  useEffect(() => {

    // useTripClock 第一次 render
    // 時可能還沒有時間
    if (!now) {
      return;
    }


    const phase =
      getTripPhase(
        now,
        activeDepartAt,
        activeTripEnd
      );


    // ======================================
    // 旅行前
    // ======================================

    if (
      phase === "before"
    ) {

      const departAt =
        new Date(
          activeDepartAt
        );


      const diff =
        departAt.getTime() -
        now.getTime();


      const safeDiff =
        Math.max(
          diff,
          0
        );


      setCountdown({
        days:
          Math.floor(
            safeDiff /
              (
                1000 *
                60 *
                60 *
                24
              )
          ),

        hours:
          Math.floor(
            (
              safeDiff /
                (
                  1000 *
                  60 *
                  60
                )
            ) %
              24
          ),
      });


      setCurrentDay(
        null
      );

      setNextItem(
        null
      );

      setStatus(
        "before"
      );

      return;
    }


    // ======================================
    // 旅行中
    // ======================================

    if (
      phase === "during"
    ) {

      const todayDay =
        getTodayTripDay(
          tripData.days,
          now
        );


      if (
        todayDay
      ) {

        setCurrentDay(
          todayDay
        );


        const next =
          getNextTripItem(
            todayDay,
            now
          );


        setNextItem(
          next ?? null
        );

      } else {

        setCurrentDay(
          null
        );

        setNextItem(
          null
        );
      }


      setCountdown(
        null
      );

      setStatus(
        "during"
      );

      return;
    }


    // ======================================
    // 旅行結束
    // ======================================

    setCountdown(
      null
    );

    setCurrentDay(
      null
    );

    setNextItem(
      null
    );

    setStatus(
      "after"
    );

  }, [
    now,
    activeDepartAt,
    activeTripEnd,
  ]);


  // ========================================
  // LOADING
  // ========================================

  if (
    status === "loading"
  ) {

    return (
      <div className="mt-5 h-44 animate-pulse rounded-3xl bg-slate-200" />
    );
  }


  // ========================================
  // UI
  // ========================================

  return (

    <section className="mt-5 rounded-3xl bg-slate-900 p-5 text-white shadow-sm">


      {/* =====================================
          旅行前
      ===================================== */}

      {status ===
        "before" && (

        <>

          {/* Header */}

          <div className="flex items-start justify-between">


            {/* Trip */}

            <div>

              <p className="text-[11px] font-semibold tracking-wider text-blue-300">
                UPCOMING TRIP
              </p>


              <h2 className="mt-2 text-2xl font-bold">
                {activeTripName}
              </h2>


              <p className="mt-1 text-xs text-slate-400">

                {activeDateRange}

                {activeDuration && (
                  <>
                    {" · "}
                    {activeDuration}
                  </>
                )}

              </p>

            </div>


            {/* Countdown */}

            {countdown && (

              <div className="text-right">

                <p className="text-3xl font-bold">
                  {
                    countdown.days
                  }
                </p>

                <p className="text-[10px] text-slate-400">
                  天後出發
                </p>

              </div>
            )}

          </div>


          {/* Next */}

          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">

            <div>

              <p className="text-[10px] font-bold tracking-wider text-slate-400">
                NEXT
              </p>


              <p className="mt-1 text-sm font-semibold">

                Day 1 ·{" "}

                {
                  tripData.days[0]
                    ?.title ??
                  "尚未設定行程"
                }

              </p>

            </div>


            <Link
              href="/itinerary"
              className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold transition hover:bg-white/20"
            >
              行程 →
            </Link>

          </div>

        </>
      )}


      {/* =====================================
          旅行中
      ===================================== */}

      {status ===
        "during" &&
        currentDay && (

        <>

          {/* Day / Date */}

          <div className="flex items-center justify-between">

            <span className="text-[11px] font-bold tracking-wide text-blue-300">

              TODAY · DAY{" "}

              {
                currentDay.day
              }

            </span>


            <span className="text-xs text-slate-400">

              {
                currentDay.date
                  .slice(5)
                  .replace(
                    "-",
                    "/"
                  )
              }

            </span>

          </div>


          {/* =================================
              TITLE
          ================================= */}

          <div className="mt-3 flex items-start justify-between gap-3">


            <div className="min-w-0">

              <h2 className="text-2xl font-bold">

                {
                  currentDay.title
                }

              </h2>


              <p className="mt-1 truncate text-xs text-slate-300">

                {
                  currentDay.subtitle
                }

              </p>

            </div>


            <Link
              href="/itinerary"
              className="shrink-0 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold transition hover:bg-white/20"
            >
              行程 →
            </Link>

          </div>


          {/* =================================
              NEXT
          ================================= */}

          <div className="mt-5 rounded-2xl bg-white/[0.06] p-4">


            <p className="text-[10px] font-bold tracking-[0.18em] text-blue-300">
              NEXT
            </p>


            {nextItem ? (

              <NextItem
                item={
                  nextItem
                }
              />

            ) : (

              <div className="mt-3">

                <p className="text-sm font-bold text-white">
                  🎉 今天的行程完成了
                </p>


                <p className="mt-1 text-xs text-slate-400">
                  好好享受剩下的時間
                </p>

              </div>
            )}

          </div>

        </>
      )}


      {/* =====================================
          旅行中但今天沒有 itinerary
      ===================================== */}

      {status ===
        "during" &&
        !currentDay && (

        <div className="flex items-center justify-between">

          <div>

            <p className="text-[11px] font-semibold tracking-wider text-blue-300">
              TRIP IN PROGRESS
            </p>


            <h2 className="mt-2 text-xl font-bold">
              {activeTripName}
            </h2>


            <p className="mt-1 text-xs text-slate-400">
              今天尚未設定行程
            </p>

          </div>


          <Link
            href="/itinerary"
            className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold transition hover:bg-white/20"
          >
            行程 →
          </Link>

        </div>
      )}


      {/* =====================================
          旅行結束
      ===================================== */}

      {status ===
        "after" && (

        <div className="flex items-center justify-between">

          <div>

            <p className="text-[11px] font-semibold tracking-wider text-slate-400">
              TRIP COMPLETED
            </p>


            <h2 className="mt-2 text-xl font-bold">
              {activeTripName}
            </h2>


            <p className="mt-1 text-xs text-slate-400">

              {activeDateRange}

              {activeDuration && (
                <>
                  {" · "}
                  {activeDuration}
                </>
              )}

            </p>

          </div>


          <Link
            href="/itinerary"
            className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold transition hover:bg-white/20"
          >
            回顧 →
          </Link>

        </div>
      )}

    </section>
  );
}


// ========================================
// NEXT ITEM
// ========================================

function NextItem({
  item,
}: {
  item: TripItem;
}) {


  // ========================================
  // GOOGLE MAPS
  // ========================================

  const mapUrl =
    item.location
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          item.location.mapQuery
        )}`
      : null;


  return (

    <div className="mt-3 flex items-center gap-4">


      {/* =====================================
          TIME
      ===================================== */}

      <div className="shrink-0">

        <p className="text-xl font-bold">

          {
            item.startTime
          }

        </p>


        <p className="mt-0.5 text-[9px] font-semibold tracking-wider text-slate-500">
          NEXT STOP
        </p>

      </div>


      {/* Divider */}

      <div className="h-11 w-px bg-white/10" />


      {/* =====================================
          LOCATION
      ===================================== */}

      <div className="min-w-0 flex-1">


        <p className="truncate text-sm font-bold text-white">

          {
            item.name
          }

        </p>


        {item.detail && (

          <p className="mt-1 truncate text-xs text-slate-400">

            {
              item.detail
            }

          </p>
        )}

      </div>


      {/* =====================================
          NAVIGATION
      ===================================== */}

      {mapUrl && (

        <a
          href={
            mapUrl
          }
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl bg-white px-3 py-2 text-[11px] font-bold text-slate-900 transition active:scale-95"
        >
          導航 ↗
        </a>
      )}

    </div>
  );
}