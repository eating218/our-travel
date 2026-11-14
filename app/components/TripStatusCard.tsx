"use client";

import Link from "next/link";
import { TRAVEL_DAY_IMAGES } from "./travelDayImages";
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
      <div className="mt-5 h-44 animate-pulse rounded-3xl bg-[#1C2D48]" />
    );
  }


  // ========================================
  // UI
  // ========================================

  return (

    <section className="relative mt-4 overflow-hidden rounded-3xl border border-[#385777] bg-[#14243F] px-4 py-3 text-[#FFFCF6] shadow-sm">


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

              <p className="text-[11px] font-semibold tracking-wider text-[#F6D27A]">
                UPCOMING TRIP
              </p>


              <h2 className="mt-2 text-2xl font-bold">
                {activeTripName}
              </h2>


              <p className="mt-1 text-xs text-[#C4D4E6]">

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

                <p className="text-[10px] text-[#C4D4E6]">
                  天後出發
                </p>

              </div>
            )}

          </div>


          {/* Next */}

          <div className="mt-5 flex items-center justify-between border-t border-[#54759A] pt-4">

            <div>

              <p className="text-[10px] font-bold tracking-wider text-[#C4D4E6]">
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
              className="rounded-full border border-[#E6C36C] bg-[#F6D27A]/75 backdrop-blur-[1px] px-4 py-2 text-xs font-semibold text-[#554018] transition hover:bg-[#F2C45F]"
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

          {/* TODAY 與風景疊圖：固定精簡高度，不改動行程資料 */}
          <div className="relative -mx-4 -mt-3 h-[104px] overflow-hidden px-4 pt-3 sm:h-[112px]">

            {/* Day 1～7 共用圖片 */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            >
              {TRAVEL_DAY_IMAGES[currentDay.day] && (
                <img
                  src={TRAVEL_DAY_IMAGES[currentDay.day]}
                  alt=""
                  draggable={false}
                  className="absolute bottom-[-1px] left-[-5%] h-[101%] w-[105%] max-w-none select-none"
                />
              )}
            </div>
            {/* 左側淡入深藍，保護文字可讀性；右上角留按鈕安全區 */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[1]"
              style={{
                background: "linear-gradient(90deg, #14243F 0%, rgba(20,36,63,.95) 18%, rgba(20,36,63,.62) 36%, rgba(20,36,63,.12) 58%, transparent 74%)",
              }}
            />
            <div className="relative z-10 flex items-center gap-2.5">
              <span className="text-[11px] font-bold tracking-wide text-[#F6D27A]">
                TODAY · DAY {currentDay.day}
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-[#F6D27A]/60" />
              <span className="text-[11px] font-medium tracking-wide text-[#C4D4E6]">
                {currentDay.date.slice(5).replace("-", "/")}
              </span>
            </div>
            <div className="relative z-10 mt-2 flex items-start justify-between gap-2">
              <div className="min-w-0 max-w-[64%]">
                <h2 className="text-[22px] font-bold leading-tight drop-shadow-[0_2px_3px_rgba(20,36,63,1)] sm:text-2xl">
                  {currentDay.title}
                </h2>
                <p className="mt-1 text-[11px] leading-4 text-[#D4E0EE] drop-shadow-[0_2px_3px_rgba(20,36,63,1)] sm:text-xs">
                  {currentDay.subtitle}
                </p>
              </div>
              <Link
                href="/itinerary"
                className="relative z-20 shrink-0 rounded-full border border-white/80 bg-white/[0.01] px-3 py-2 text-xs font-bold text-white shadow-[inset_0_2px_2px_rgba(255,255,255,0.65),inset_0_-3px_5px_rgba(0,0,0,0.12),0_5px_14px_rgba(0,0,0,0.24)] backdrop-blur-[2px] backdrop-saturate-150 transition-all hover:bg-white/[0.16] active:scale-95"
              >
                行程 →
              </Link>
            </div>
            {/* 風景與 NEXT 之間的柔和金色波浪；只做裝飾，不遮擋按鈕 */}
            <svg
              aria-hidden="true"
              viewBox="0 0 400 18"
              preserveAspectRatio="none"
              className="pointer-events-none absolute bottom-[-1px] left-0 z-[5] h-[12px] w-full sm:h-[14px]"
            >
              <path
                d="M0 8 C70 -3 120 18 200 10 S330 3 400 9 L400 18 L0 18 Z"
                fill="#14243F"
              />
              <path
                d="M0 8 C70 -3 120 18 200 10 S330 3 400 9"
                fill="none"
                stroke="#F6D27A"
                strokeWidth="1.8"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* =================================
              NEXT：直接呈現在深藍底色，不使用內層方框
          ================================= */}

          <div className="relative z-10 px-3 pb-0 pt-2">
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#F6D27A]">
              NEXT
            </p>


            {nextItem ? (

              <NextItem
                item={
                  nextItem
                }
              />

            ) : (

              <div className="mt-1.5">

                <p className="text-sm font-bold text-[#FFFCF6]">
                  🎉 今天的行程完成了
                </p>


                <p className="mt-1 text-xs text-[#C4D4E6]">
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

            <p className="text-[11px] font-semibold tracking-wider text-[#F6D27A]">
              TRIP IN PROGRESS
            </p>


            <h2 className="mt-2 text-xl font-bold">
              {activeTripName}
            </h2>


            <p className="mt-1 text-xs text-[#C4D4E6]">
              今天尚未設定行程
            </p>

          </div>


          <Link
            href="/itinerary"
            className="rounded-full border border-[#E6C36C] bg-[#F6D27A] px-4 py-2 text-xs font-semibold text-[#554018] transition hover:bg-[#F2C45F]"
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

            <p className="text-[11px] font-semibold tracking-wider text-[#C4D4E6]">
              TRIP COMPLETED
            </p>


            <h2 className="mt-2 text-xl font-bold">
              {activeTripName}
            </h2>


            <p className="mt-1 text-xs text-[#C4D4E6]">

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
            className="rounded-full border border-[#E6C36C] bg-[#F6D27A] px-4 py-2 text-xs font-semibold text-[#554018] transition hover:bg-[#F2C45F]"
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

    <div className="mt-1.5 flex items-center gap-3">


      {/* =====================================
          TIME
      ===================================== */}

      <div className="shrink-0">

        <p className="text-xl font-bold">

          {
            item.startTime
          }

        </p>


        <p className="mt-0.5 text-[9px] font-semibold tracking-wider text-[#C4D4E6]">
          NEXT STOP
        </p>

      </div>


      {/* Divider */}

      <div className="h-11 w-px bg-[#F6D27A]" />


      {/* =====================================
          LOCATION
      ===================================== */}

      <div className="min-w-0 flex-1">


        <p className="truncate text-sm font-bold text-[#FFFCF6]">

          {
            item.name
          }

        </p>


        {item.detail && (

          <p className="mt-1 truncate text-xs text-[#C4D4E6]">

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
          className="shrink-0 rounded-xl border border-[#E6C36C] bg-[#F6D27A] px-3 py-2 text-[11px] font-bold text-[#554018] shadow-[0_2px_6px_rgba(0,0,0,0.15)] transition hover:bg-[#FFE09A] active:scale-95"
        >
          導航 ↗
        </a>
      )}

    </div>
  );
}