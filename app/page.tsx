"use client";

import Link from "next/link";
import TripStatusCard from "./components/TripStatusCard";
import { useChecklist } from "../hooks/useChecklist";

const quickTools = [
  {
    icon: "🗺️",
    name: "行程",
    href: "/itinerary",
  },
  {
    icon: "🚆",
    name: "交通",
    href: "#",
  },
  {
    icon: "💱",
    name: "匯率",
    href: "#",
  },
  {
    icon: "💬",
    name: "日語",
    href: "/japanese",
  },
];

export default function Home() {
  const {
    loaded: checklistLoaded,
    total,
    completed,
    percent,
  } = useChecklist();

  const checklistCompleted =
    checklistLoaded &&
    total > 0 &&
    completed === total;

  return (
    <main className="min-h-screen bg-slate-50 pb-24">

      <div className="mx-auto max-w-md px-5 pt-7">

        {/* ========================================
            HEADER
        ======================================== */}

        <header className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] text-blue-600">
              OUR TRAVEL
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              🇯🇵 京阪7日遊
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              2027/02/28 - 03/06
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm">
            ✈️
          </div>
        </header>

        {/* ========================================
            SMART TRIP CARD
        ======================================== */}

        <TripStatusCard />

        {/* ========================================
            TRAVEL TOOLS
        ======================================== */}

        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              旅遊工具
            </h2>

            <span className="text-xs text-slate-400">
              全部 →
            </span>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {quickTools.map((tool) =>
              tool.href === "#" ? (
                <div
                  key={tool.name}
                  className="rounded-2xl bg-white px-2 py-4 text-center shadow-sm"
                >
                  <div className="text-2xl">
                    {tool.icon}
                  </div>

                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    {tool.name}
                  </p>
                </div>
              ) : (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className="rounded-2xl bg-white px-2 py-4 text-center shadow-sm transition active:scale-[0.98]"
                >
                  <div className="text-2xl">
                    {tool.icon}
                  </div>

                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    {tool.name}
                  </p>
                </Link>
              )
            )}
          </div>
        </section>

        {/* ========================================
            INFORMATION CARDS
        ======================================== */}

        <section className="mt-5 grid grid-cols-2 gap-3">

          {/* ========================================
              CHECKLIST
          ======================================== */}

          <Link
            href="/checklist"
            className="rounded-3xl bg-white p-5 shadow-sm transition active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">
                {checklistCompleted ? "✅" : "🧳"}
              </span>

              <span
                className={`text-xs font-semibold ${
                  checklistCompleted
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              >
                {!checklistLoaded
                  ? "..."
                  : checklistCompleted
                    ? "✓ 完成"
                    : `${completed} / ${total}`}
              </span>
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              行前準備
            </h3>

            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Checklist
              </p>

              {checklistLoaded && (
                <p
                  className={`text-[10px] font-bold ${
                    checklistCompleted
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                >
                  {percent}%
                </p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  checklistCompleted
                    ? "bg-emerald-500"
                    : "bg-slate-900"
                }`}
                style={{
                  width: `${checklistLoaded ? percent : 0}%`,
                }}
              />
            </div>
          </Link>

          {/* ========================================
              EXPENSES
          ======================================== */}

          <Link
            href="/expenses"
            className="rounded-3xl bg-white p-5 shadow-sm transition active:scale-[0.98]"
          >
            <span className="text-xl">
              💰
            </span>

            <h3 className="mt-4 font-bold text-slate-900">
              共同記帳
            </h3>

            <p className="mt-2 text-xl font-bold text-slate-900">
              ¥ 24,580
            </p>

            <p className="mt-1 text-xs text-slate-400">
              目前旅費
            </p>
          </Link>

          {/* ========================================
              WEATHER
          ======================================== */}

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xl">
                ☀️
              </span>

              <span className="text-xs text-slate-400">
                京都
              </span>
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              天氣
            </h3>

            <p className="mt-2 text-xl font-bold text-slate-900">
              16°C
            </p>

            <p className="mt-1 text-xs text-slate-400">
              晴時多雲
            </p>
          </div>

          {/* ========================================
              COUPONS
          ======================================== */}

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <span className="text-xl">
              🛍️
            </span>

            <h3 className="mt-4 font-bold text-slate-900">
              免稅優惠
            </h3>

            <p className="mt-2 text-xl font-bold text-slate-900">
              6
            </p>

            <p className="mt-1 text-xs text-slate-400">
              張優惠券
            </p>
          </div>

        </section>

        {/* ========================================
            RECEIPT
        ======================================== */}

        <Link
          href="/receipt"
          className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">
              🧾
            </span>

            <div>
              <p className="text-sm font-bold text-slate-900">
                收據辨識
              </p>

              <p className="text-xs text-slate-400">
                拍照快速加入旅費
              </p>
            </div>
          </div>

          <span className="text-slate-300">
            ›
          </span>
        </Link>

      </div>

      {/* ========================================
          BOTTOM NAVIGATION
      ======================================== */}

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-4 px-4 pb-5 pt-3">

          {/* HOME */}
          <div className="text-center">
            <div>
              🏠
            </div>

            <p className="mt-1 text-[10px] font-bold text-slate-900">
              首頁
            </p>
          </div>

          {/* ITINERARY */}
          <Link
            href="/itinerary"
            className="text-center"
          >
            <div>
              🗺️
            </div>

            <p className="mt-1 text-[10px] text-slate-400">
              行程
            </p>
          </Link>

          {/* EXPENSES */}
          <Link
            href="/expenses"
            className="text-center"
          >
            <div>
              💰
            </div>

            <p className="mt-1 text-[10px] text-slate-400">
              分帳
            </p>
          </Link>

          {/* CHECKLIST */}
          <Link
            href="/checklist"
            className="text-center"
          >
            <div>
              🧳
            </div>

            <p className="mt-1 text-[10px] text-slate-400">
              準備
            </p>
          </Link>

        </div>
      </nav>

    </main>
  );
}