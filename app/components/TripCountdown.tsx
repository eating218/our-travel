"use client";

import { useEffect, useState } from "react";

const departAt = new Date("2027-02-28T06:00:00");
const tripEnd = new Date("2027-03-06T23:59:59");

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
};

export default function TripCountdown() {
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [status, setStatus] = useState<"before" | "during" | "after">("before");

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();

      if (now >= tripEnd) {
        setStatus("after");
        return;
      }

      if (now >= departAt) {
        setStatus("during");
        return;
      }

      setStatus("before");

      const diff = departAt.getTime() - now.getTime();

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
      });
    }

    updateCountdown();

    const timer = setInterval(updateCountdown, 30000);

    return () => clearInterval(timer);
  }, []);

  if (status === "during") {
    return (
      <div className="mt-4 rounded-2xl bg-blue-50 p-4">
        <p className="text-sm font-bold text-blue-700">
          🇯🇵 旅行進行中
        </p>

        <p className="mt-1 text-xs text-blue-500">
          Enjoy your trip!
        </p>
      </div>
    );
  }

  if (status === "after") {
    return (
      <div className="mt-4 rounded-2xl bg-slate-100 p-4">
        <p className="text-sm font-bold text-slate-700">
          ✈️ 旅程已結束
        </p>
      </div>
    );
  }

  if (!countdown) {
    return (
      <div className="mt-4 h-24 animate-pulse rounded-2xl bg-slate-100" />
    );
  }

  return (
    <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs font-bold tracking-wider text-slate-400">
        COUNTDOWN
      </p>

      <div className="mt-3 flex items-end gap-5">
        <div>
          <span className="text-3xl font-bold text-slate-900">
            {countdown.days}
          </span>
          <span className="ml-1 text-xs text-slate-400">天</span>
        </div>

        <div>
          <span className="text-2xl font-bold text-slate-900">
            {countdown.hours}
          </span>
          <span className="ml-1 text-xs text-slate-400">時</span>
        </div>

        <div>
          <span className="text-2xl font-bold text-slate-900">
            {countdown.minutes}
          </span>
          <span className="ml-1 text-xs text-slate-400">分</span>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="text-xs text-slate-400">
          ✈️ 2027/02/28 07:40 出發
        </p>
      </div>
    </div>
  );
}