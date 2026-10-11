"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const tripDays = [
  {
    date: "2026-11-12",
    day: 1,
    title: "抵達日本・前往京都",
    subtitle: "關西機場 → 京都",
  },
  {
    date: "2026-11-13",
    day: 2,
    title: "京都・東山",
    subtitle: "清水寺・二年坂・祇園",
  },
  {
    date: "2026-11-14",
    day: 3,
    title: "京都・嵐山",
    subtitle: "竹林・天龍寺・渡月橋",
  },
  {
    date: "2026-11-15",
    day: 4,
    title: "宇治",
    subtitle: "平等院・宇治散策",
  },
  {
    date: "2026-11-16",
    day: 5,
    title: "大阪",
    subtitle: "大阪城・心齋橋・道頓堀",
  },
  {
    date: "2026-11-17",
    day: 6,
    title: "回程",
    subtitle: "大阪 → 關西機場 → 台灣",
  },
];

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function TodayTrip() {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    //setToday(getLocalDateString(new Date()));
    setToday("2026-11-13");
  }, []);

  if (!today) return null;

  const currentTrip = tripDays.find((trip) => trip.date === today);

  // 旅行當天
  if (currentTrip) {
    return (
      <div className="mt-4 rounded-3xl bg-blue-600 p-5 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            TODAY · DAY {currentTrip.day}
          </span>

          <span>🇯🇵</span>
        </div>

        <h2 className="mt-4 text-xl font-bold">
          {currentTrip.title}
        </h2>

        <p className="mt-1 text-sm text-blue-100">
          {currentTrip.subtitle}
        </p>

        <Link
          href={`/itinerary/day-${currentTrip.day}`}
          className="mt-5 block rounded-2xl bg-white px-4 py-3 text-center text-sm font-bold text-blue-600"
        >
          查看今天行程 →
        </Link>
      </div>
    );
  }

  // 還沒出發
  if (today < tripDays[0].date) {
    return (
      <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3">
        <p className="text-sm font-semibold text-amber-800">
          🧳 還沒出發
        </p>

        <p className="mt-1 text-xs text-amber-600">
          下一趟旅程正在等你。
        </p>
      </div>
    );
  }

  // 已經回國
  return (
    <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-3">
      <p className="text-sm font-semibold text-slate-700">
        🏠 Welcome Home
      </p>

      <p className="mt-1 text-xs text-slate-500">
        這趟旅行已經結束。
      </p>
    </div>
  );
}