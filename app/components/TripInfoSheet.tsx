"use client";

import { useEffect } from "react";
import { tripData } from "../../data/tripData";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-");

  return `${year}/${month}/${day}`;
}

export default function TripInfoSheet({
  isOpen,
  onClose,
}: Props) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        originalOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <button
        type="button"
        aria-label="關閉旅程資訊"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
      />

      {/* Bottom Sheet */}
      <section className="absolute bottom-0 left-0 right-0 mx-auto max-h-[85vh] max-w-md overflow-y-auto rounded-t-[32px] bg-white px-5 pb-8 pt-3 shadow-2xl">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-200" />

        <div className="mt-6 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] text-blue-600">
              TRIP INFO
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              🇯🇵 {tripData.name}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {tripData.country}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500 transition active:scale-95"
          >
            ×
          </button>
        </div>

        {/* Date */}
        <div className="mt-6 rounded-3xl bg-slate-900 px-5 py-4 text-white">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-[0.2em] text-blue-300">
              TRAVEL PERIOD
            </p>

            <p className="text-xs font-bold text-slate-300">
              {tripData.duration}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <p className="text-base font-bold tracking-tight">
              {formatDate(tripData.startDate)}
            </p>

            <span className="text-slate-500">
              —
            </span>

            <p className="text-base font-bold tracking-tight">
              {formatDate(tripData.endDate)}
            </p>
          </div>
        </div>

        {/* Route */}
        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400">
            ROUTE
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
              🛫
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                台灣 → 大阪
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                2027/02/28
              </p>
            </div>
          </div>

          <div className="ml-5 my-2 h-5 border-l border-dashed border-slate-300" />

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
              🛬
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                大阪 → 台灣
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                2027/03/06
              </p>
            </div>
          </div>
        </div>

        {/* Days */}
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400">
                ITINERARY
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {tripData.days.length} 天行程
              </p>
            </div>

            <span className="text-xl">
              🗺️
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {tripData.days.map((day) => (
              <div
                key={day.day}
                className="flex items-start gap-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                  {day.day}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">
                    {day.title}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-slate-400">
                    {day.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Future data */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <span className="text-lg">
              ✈️
            </span>

            <p className="mt-3 text-xs font-bold text-slate-900">
              航班
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              尚未設定
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <span className="text-lg">
              🏨
            </span>

            <p className="mt-3 text-xs font-bold text-slate-900">
              住宿
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              尚未設定
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}