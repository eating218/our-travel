"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  tripData,
  TripDay,
  TripItem,
} from "../../data/tripData";

import {
  getTodayTripDay,
  getTripPhase,
} from "../../lib/tripStatus";

import {
  useTripClock,
} from "../../hooks/useTripClock";

import {
  useTripNotes,
} from "../../hooks/useTripNotes";

import {
  useCustomItinerary,
} from "../../hooks/useCustomItinerary";

import {
  useTripSettings,
} from "../../hooks/useTripSettings";

import AddItinerarySheet from "../components/AddItinerarySheet";
import EditItinerarySheet from "../components/EditItinerarySheet";
import ItineraryItem from "../components/ItineraryItem";
import SightseeingSheet from "../components/SightseeingSheet";


// ========================================
// DATE HELPERS
// ========================================

function addDaysToDate(
  dateString: string,
  daysToAdd: number
) {
  const parts =
    dateString
      .split("-")
      .map(Number);


  if (
    parts.length !== 3 ||
    parts.some(
      (part) =>
        !Number.isFinite(part)
    )
  ) {
    return dateString;
  }


  const [
    year,
    month,
    day,
  ] = parts;


  // 使用 UTC 做純日期運算，
  // 避免 DST / timezone 造成日期偏移。
  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );


  date.setUTCDate(
    date.getUTCDate() +
      daysToAdd
  );


  const nextYear =
    date.getUTCFullYear();

  const nextMonth =
    String(
      date.getUTCMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const nextDay =
    String(
      date.getUTCDate()
    ).padStart(
      2,
      "0"
    );


  return `${nextYear}-${nextMonth}-${nextDay}`;
}


// ========================================
// DERIVE ITINERARY DAYS
// ========================================

function createDerivedDays(
  startDate: string,
  endDate: string
): TripDay[] {

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


  const totalDays =
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
    !Number.isFinite(
      totalDays
    ) ||
    totalDays <= 0
  ) {
    return [];
  }


  return Array.from(
    {
      length:
        totalDays,
    },
    (
      _,
      index
    ) => {

      const dayNumber =
        index + 1;


      const baseDay =
        tripData.days.find(
          (day) =>
            day.day ===
            dayNumber
        );


      if (
        baseDay
      ) {

        return {
          ...baseDay,

          date:
            addDaysToDate(
              startDate,
              index
            ),
        };
      }


      return {
        day:
          dayNumber,

        date:
          addDaysToDate(
            startDate,
            index
          ),

        title:
          "自由行程",

        subtitle:
          "尚未安排",

        items:
          [],
      };

    }
  );
}

// ========================================
// ITINERARY PAGE
// ========================================

export default function ItineraryPage() {

  // ========================================
  // APP CLOCK
  // ========================================

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


  // ========================================
  // DERIVED DAYS
  // ========================================

  const itineraryDays =
    createDerivedDays(
      activeStartDate,
      activeEndDate
    );


  // ========================================
  // TRIP LIFE CYCLE
  // ========================================

  const activeDepartAt =
    `${activeStartDate}T00:00:00`;

  const activeTripEnd =
    `${activeEndDate}T23:59:59`;


  // ========================================
  // TRIP NOTES
  // ========================================

  const {
    notes,
    saveNote,
    deleteNote,
  } = useTripNotes();


  // ========================================
  // CUSTOM ITINERARY
  // ========================================

  const {
    customItemsByDay,
    baseItemOverrides,
    hiddenBaseItemIds,
    addCustomItem,
    updateCustomItem,
    deleteCustomItem,
    updateBaseItem,
    hideBaseItem,
  } = useCustomItinerary();


  // ========================================
  // STATE
  // ========================================

  const [
    selectedDay,
    setSelectedDay,
  ] =
    useState<number | null>(
      null
    );


  const [
    selectedItem,
    setSelectedItem,
  ] =
    useState<TripItem | null>(
      null
    );


  const [
    isAddSheetOpen,
    setIsAddSheetOpen,
  ] =
    useState(false);


  const [
    editingItem,
    setEditingItem,
  ] =
    useState<TripItem | null>(
      null
    );


  const [
    editingDay,
    setEditingDay,
  ] =
    useState<number | null>(
      null
    );


  const [
    editingSource,
    setEditingSource,
  ] =
    useState<
      "base" |
      "custom" |
      null
    >(null);


  // ========================================
  // INITIAL DAY CONTROL
  // ========================================

  // useTripClock 會定期更新。
  //
  // 我們只希望第一次進入頁面時，
  // 自動幫使用者選擇日期。
  //
  // 使用者之後如果自己切到其他 Day，
  // 不要再強迫他跳回今天。

  const hasInitializedDay =
    useRef(false);


  // ========================================
  // DATE TAB SCROLL
  // ========================================

  const dateTabsRef =
    useRef<HTMLDivElement | null>(
      null
    );


  const dayButtonRefs =
    useRef<
      Record<
        number,
        HTMLButtonElement | null
      >
    >({});


  // ========================================
  // SCROLL SELECTED DAY TO CENTER
  // ========================================

  const scrollDayIntoView =
    useCallback(
      (
        dayNumber: number
      ) => {

        const container =
          dateTabsRef.current;

        const button =
          dayButtonRefs.current[
            dayNumber
          ];


        if (
          !container ||
          !button
        ) {
          return;
        }


        const targetLeft =
          button.offsetLeft -
          container.clientWidth / 2 +
          button.clientWidth / 2;


        container.scrollTo({
          left:
            Math.max(
              0,
              targetLeft
            ),

          behavior:
            "smooth",
        });

      },
      []
    );


  // ========================================
  // AUTO SELECT DAY
  // ========================================

  useEffect(() => {

    if (
      !now ||
      !tripSettingsLoaded
    ) {
      return;
    }


    // 已經自動選過一次。
    //
    // 後續時間更新不要再干涉
    // 使用者目前選擇的 Day。

    if (
      hasInitializedDay.current
    ) {
      return;
    }


    if (
      itineraryDays.length === 0
    ) {
      return;
    }


    const phase =
      getTripPhase(
        now,
        activeDepartAt,
        activeTripEnd
      );


    // ======================================
    // BEFORE TRIP
    // → Day 1
    // ======================================

    if (
      phase === "before"
    ) {

      setSelectedDay(
        itineraryDays[0].day
      );


      hasInitializedDay.current =
        true;


      return;
    }


    // ======================================
    // AFTER TRIP
    // → Last Day
    // ======================================

    if (
      phase === "after"
    ) {

      const lastDay =
        itineraryDays[
          itineraryDays.length -
            1
        ];


      setSelectedDay(
        lastDay.day
      );


      hasInitializedDay.current =
        true;


      return;
    }


    // ======================================
    // DURING TRIP
    // → Today
    // ======================================

    const todayDay =
      getTodayTripDay(
        itineraryDays,
        now
      );


    setSelectedDay(
      todayDay?.day ??
        itineraryDays[0].day
    );


    hasInitializedDay.current =
      true;

  }, [
    now,
    tripSettingsLoaded,
    activeDepartAt,
    activeTripEnd,
    activeStartDate,
  ]);


  // ========================================
  // RESET AUTO DAY
  // WHEN TRIP START DATE CHANGES
  // ========================================

  useEffect(() => {

    hasInitializedDay.current =
      false;

  }, [
    activeStartDate,
    activeEndDate,
  ]);


  // ========================================
  // SCROLL WHEN SELECTED DAY CHANGES
  // ========================================

  useEffect(() => {

    if (
      selectedDay === null
    ) {
      return;
    }


    const frame =
      requestAnimationFrame(
        () => {

          scrollDayIntoView(
            selectedDay
          );

        }
      );


    return () => {

      cancelAnimationFrame(
        frame
      );

    };

  }, [
    selectedDay,
    scrollDayIntoView,
  ]);


  // ========================================
  // CURRENT DAY
  // ========================================

  const baseCurrentDay =
    itineraryDays.find(
      (day) =>
        day.day ===
        selectedDay
    ) ??
    itineraryDays[0];


  // ========================================
  // SAFETY
  // ========================================

  if (
    !baseCurrentDay
  ) {

    return (

      <main className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-md px-5 py-12 text-center">

          <p className="text-sm font-bold text-slate-700">
            尚未建立行程日期
          </p>

        </div>

      </main>
    );
  }


  // ========================================
  // VISIBLE BASE ITEMS
  // ========================================

  const visibleBaseItems =
    tripData.days.flatMap(
      (sourceDay) =>

        sourceDay.items.flatMap(
          (item) => {

            if (
              hiddenBaseItemIds.includes(
                item.id
              )
            ) {
              return [];
            }


            const override =
              baseItemOverrides[
                item.id
              ];


            const targetDay =
              override?.day ??
              sourceDay.day;


            if (
              targetDay !==
              baseCurrentDay.day
            ) {
              return [];
            }


            return [
              override?.item ??
                item,
            ];

          }
        )
    );


  // ========================================
  // CUSTOM ITEMS
  // ========================================

  const customItems =
    customItemsByDay[
      baseCurrentDay.day
    ] ?? [];


  // ========================================
  // CURRENT DAY
  // ========================================

  const currentDay: TripDay = {
    ...baseCurrentDay,

    items: [
      ...visibleBaseItems,
      ...customItems,
    ].sort(
      (
        a,
        b
      ) =>
        a.startTime.localeCompare(
          b.startTime
        )
    ),
  };


  // ========================================
  // ITEM SOURCE
  // ========================================

  function getItemSource(
    itemId: string
  ) {

    const isBase =
      tripData.days.some(
        (day) =>
          day.items.some(
            (item) =>
              item.id ===
              itemId
          )
      );


    return isBase
      ? "base" as const
      : "custom" as const;
  }


  // ========================================
  // EDIT ITEM
  // ========================================

  function handleEditItem(
    item: TripItem
  ) {

    setEditingItem(
      item
    );

    setEditingDay(
      currentDay.day
    );

    setEditingSource(
      getItemSource(
        item.id
      )
    );
  }


  // ========================================
  // DELETE ITEM
  // ========================================

  function handleDeleteItem(
    item: TripItem
  ) {

    const confirmed =
      window.confirm(
        `確定要刪除「${item.name}」嗎？`
      );


    if (
      !confirmed
    ) {
      return;
    }


    const source =
      getItemSource(
        item.id
      );


    if (
      source === "base"
    ) {

      hideBaseItem(
        item.id
      );

      return;
    }


    deleteCustomItem(
      currentDay.day,
      item.id
    );
  }


  // ========================================
  // SAVE EDITED ITEM
  // ========================================

  function handleSaveEditedItem(
    newDay: number,
    updatedItem: TripItem
  ) {

    if (
      editingDay === null ||
      editingSource === null
    ) {
      return;
    }


    if (
      editingSource === "base"
    ) {

      updateBaseItem(
        updatedItem.id,
        newDay,
        updatedItem
      );

    } else {

      updateCustomItem(
        editingDay,
        newDay,
        updatedItem
      );
    }


    setEditingItem(
      null
    );

    setEditingDay(
      null
    );

    setEditingSource(
      null
    );


    if (
      newDay !==
      currentDay.day
    ) {

      setSelectedDay(
        newDay
      );
    }
  }


  // ========================================
  // LOADING
  // ========================================

  if (
    !now ||
    !tripSettingsLoaded
  ) {

    return (

      <main className="min-h-screen bg-slate-50">


        {/* TOP BAR LOADING */}

        <header className="border-b border-slate-100 bg-white">

          <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">

            <div className="h-9 w-9 rounded-full bg-slate-100" />


            <div className="text-center">

              <div className="mx-auto h-2.5 w-16 animate-pulse rounded bg-slate-200" />

              <div className="mx-auto mt-2 h-4 w-24 animate-pulse rounded bg-slate-200" />

            </div>


            <div className="w-9" />

          </div>

        </header>


        {/* CONTENT LOADING */}

        <div className="mx-auto max-w-md px-5 pt-6">

          <div className="h-4 w-14 animate-pulse rounded bg-slate-200" />

          <div className="mt-3 h-8 w-40 animate-pulse rounded bg-slate-200" />

          <div className="mt-3 h-4 w-52 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 h-44 animate-pulse rounded-3xl bg-slate-200" />

        </div>

      </main>
    );
  }


  // ========================================
  // TRIP PHASE
  // ========================================

  const phase =
    getTripPhase(
      now,
      activeDepartAt,
      activeTripEnd
    );


  // ========================================
  // REAL TODAY
  // ========================================

  // TODAY 只有旅行進行中才顯示。
  //
  // selectedDay：
  // 使用者目前正在看的 Day
  //
  // todayDay：
  // 真正的今天
  //
  // 兩者是不同概念。

  const todayDay =
    phase === "during"
      ? getTodayTripDay(
          itineraryDays,
          now
        )
      : null;


  // ========================================
  // PAGE
  // ========================================

  return (

    <main className="min-h-screen bg-slate-50">


      {/* =====================================
          TOP BAR
      ===================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">


        {/* TITLE BAR */}

        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">


          {/* Back */}

          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg transition active:scale-95"
          >
            ‹
          </Link>


          {/* Title */}

          <div className="text-center">

            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400">
              ITINERARY
            </p>


            <h1 className="text-sm font-bold text-slate-900">
              {activeTripName}
            </h1>

          </div>


          {/* Spacer */}

          <div className="w-9" />

        </div>


        {/* =================================
            DATE TABS
        ================================= */}

        <div
          ref={
            dateTabsRef
          }
          className="mx-auto max-w-md overflow-x-auto px-4 pb-3"
          style={{
            scrollbarWidth:
              "none",

            msOverflowStyle:
              "none",
          }}
        >

          <div className="flex gap-2">


            {itineraryDays.map(
              (day) => {


                const active =
                  day.day ===
                  selectedDay;


                const isToday =
                  todayDay?.day ===
                  day.day;


                return (

                  <button
                    key={
                      day.day
                    }

                    ref={(
                      element
                    ) => {

                      dayButtonRefs.current[
                        day.day
                      ] = element;

                    }}

                    type="button"

                    onClick={() =>
                      setSelectedDay(
                        day.day
                      )
                    }

                    className={`min-w-[58px] rounded-2xl px-3 py-2.5 text-center transition active:scale-95 ${
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : isToday
                        ? "bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >


                    {/* DAY / TODAY */}

                    <p
                      className={`text-[9px] font-bold tracking-[0.04em] ${
                        active &&
                        isToday
                          ? "text-blue-300"
                          : ""
                      }`}
                    >

                      {isToday
                        ? "TODAY"
                        : `DAY ${day.day}`}

                    </p>


                    {/* DATE */}

                    <p
                      className={`mt-1 text-xs font-semibold ${
                        active
                          ? "text-white"
                          : isToday
                          ? "text-blue-600"
                          : ""
                      }`}
                    >

                      {day.date
                        .slice(5)
                        .replace(
                          "-",
                          "/"
                        )}

                    </p>

                  </button>
                );

              }
            )}

          </div>

        </div>

      </header>


      {/* =====================================
          CONTENT
      ===================================== */}

      <div className="mx-auto max-w-md px-5 pb-28 pt-6">


        {/* =================================
            DAY TITLE
        ================================= */}

        <section>


          {/* DAY + TODAY */}

          <div className="flex items-center gap-2">

            <p className="text-xs font-bold text-blue-600">

              DAY{" "}
              {currentDay.day}

            </p>


            {todayDay?.day ===
              currentDay.day && (

              <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold tracking-[0.1em] text-blue-600">
                TODAY
              </span>
            )}

          </div>


          {/* TITLE */}

          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {currentDay.title}
          </h2>


          {/* SUBTITLE */}

          <p className="mt-2 text-sm text-slate-400">
            {currentDay.subtitle}
          </p>

        </section>


        {/* =================================
            TIMELINE
        ================================= */}

        <section className="mt-8">


          {currentDay.items.length >
          0 ? (

            currentDay.items.map(
              (
                item,
                index
              ) => (

                <ItineraryItem
                  key={
                    item.id
                  }

                  item={
                    item
                  }

                  day={
                    currentDay
                  }

                  now={
                    now
                  }

                  isLast={
                    index ===
                    currentDay.items.length -
                      1
                  }

                  note={
                    notes[
                      item.id
                    ] ?? ""
                  }

                  onOpenGuide={
                    setSelectedItem
                  }

                  onEdit={
                    handleEditItem
                  }

                  onDelete={
                    handleDeleteItem
                  }
                />

              )
            )

          ) : (

            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center">

              <div className="text-3xl">
                🗓️
              </div>


              <p className="mt-3 text-sm font-bold text-slate-700">
                這一天還沒有加入行程
              </p>


              <p className="mt-1 text-xs text-slate-400">
                之後我們會把景點加入這裡
              </p>

            </div>
          )}


          <button
            type="button"

            onClick={() =>
              setIsAddSheetOpen(
                true
              )
            }

            className="mt-3 flex w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-xs font-bold text-slate-500 transition active:scale-[0.99]"
          >
            ＋ 新增行程
          </button>

        </section>

      </div>


      {/* =====================================
          SIGHTSEEING BOTTOM SHEET
      ===================================== */}

      <SightseeingSheet
        item={
          selectedItem
        }

        note={
          selectedItem
            ? notes[
                selectedItem.id
              ] ?? ""
            : ""
        }

        onSaveNote={
          saveNote
        }

        onDeleteNote={
          deleteNote
        }

        onClose={() =>
          setSelectedItem(
            null
          )
        }
      />


      {/* =====================================
          ADD ITINERARY
      ===================================== */}

      <AddItinerarySheet
        isOpen={
          isAddSheetOpen
        }

        day={
          currentDay.day
        }

        onClose={() =>
          setIsAddSheetOpen(
            false
          )
        }

        onAdd={
          addCustomItem
        }
      />


      {/* =====================================
          EDIT ITINERARY
      ===================================== */}

      <EditItinerarySheet
        isOpen={
          editingItem !==
          null
        }

        item={
          editingItem
        }

        currentDay={
          editingDay ??
          currentDay.day
        }

        onClose={() => {

          setEditingItem(
            null
          );

          setEditingDay(
            null
          );

          setEditingSource(
            null
          );

        }}

        onSave={
          handleSaveEditedItem
        }
      />

    </main>
  );
}