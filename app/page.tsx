"use client";

import { useState } from "react";
import Link from "next/link";

import TripStatusCard from "./components/TripStatusCard";
import TripInfoSheet from "./components/TripInfoSheet";
import WeatherAdviceBar from "./components/WeatherAdviceBar";

import { useChecklist } from "../hooks/useChecklist";
import { useExpenseData } from "../hooks/useExpenseData";

import { tripData } from "../data/tripData";

import { useTripSettings } from "../hooks/useTripSettings";

// ========================================
// QUICK TOOLS
// ========================================

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


// ========================================
// DATE
// ========================================

function formatDateRange(
  startDate: string,
  endDate: string
) {
  const start =
    startDate.split("-");

  const end =
    endDate.split("-");

  return `${start[0]}/${start[1]}/${start[2]} - ${end[1]}/${end[2]}`;
}


// ========================================
// HOME
// ========================================

export default function Home() {
  const [
    isTripInfoOpen,
    setIsTripInfoOpen,
  ] = useState(false);


  const [
    isIdentityOpen,
    setIsIdentityOpen,
  ] = useState(false);


  const [
    identityMode,
    setIdentityMode,
  ] = useState<
    "select" |
    "add" |
    "edit"
  >("select");


  const [
    memberNameInput,
    setMemberNameInput,
  ] = useState("");


  const [
    identityError,
    setIdentityError,
  ] = useState("");


  // ========================================
  // CHECKLIST
  // ========================================

  const {
    loaded: checklistLoaded,

    total,

    completed,

    percent,
  } = useChecklist();


  // ========================================
  // EXPENSE / IDENTITY
  // ========================================

  const {
    loaded: expenseLoaded,

    members,

    currentMember,

    needsIdentitySetup,

    setCurrentMember,

    addAndSelectMember,

    updateMemberName,
  } = useExpenseData();

  const {
    loaded: tripSettingsLoaded,
    settings: tripSettings,
  } = useTripSettings();

  // ========================================
  // CHECKLIST STATUS
  // ========================================

  const checklistCompleted =
    checklistLoaded &&
    total > 0 &&
    completed === total;


  // ========================================
  // IDENTITY MODAL
  // ========================================

  const showIdentityModal =
    expenseLoaded &&
    (
      needsIdentitySetup ||
      isIdentityOpen
    );


  // ========================================
  // SELECT MEMBER
  // ========================================

  function handleSelectMember(
    memberId: string
  ) {
    const success =
      setCurrentMember(
        memberId
      );


    if (!success) {
      return;
    }


    setIdentityMode(
      "select"
    );

    setMemberNameInput(
      ""
    );

    setIdentityError(
      ""
    );

    setIsIdentityOpen(
      false
    );
  }


  // ========================================
  // OPEN IDENTITY
  // ========================================

  function handleOpenIdentity() {
    setIdentityMode(
      "select"
    );

    setMemberNameInput(
      ""
    );

    setIdentityError(
      ""
    );

    setIsIdentityOpen(
      true
    );
  }


  // ========================================
  // CLOSE IDENTITY
  // ========================================

  function handleCloseIdentity() {
    /**
     * 第一次尚未選擇身份時
     * 不允許跳過。
     */
    if (!currentMember) {
      return;
    }


    setIdentityMode(
      "select"
    );

    setMemberNameInput(
      ""
    );

    setIdentityError(
      ""
    );

    setIsIdentityOpen(
      false
    );
  }


  // ========================================
  // OPEN ADD
  // ========================================

  function handleOpenAdd() {
    setMemberNameInput(
      ""
    );

    setIdentityError(
      ""
    );

    setIdentityMode(
      "add"
    );
  }


  // ========================================
  // ADD MYSELF
  // ========================================

  function handleAddMyself() {
    const cleanName =
      memberNameInput.trim();


    if (!cleanName) {
      setIdentityError(
        "請輸入你的名稱"
      );

      return;
    }


    const memberId =
      typeof crypto !==
        "undefined" &&
      typeof crypto.randomUUID ===
        "function"
        ? crypto.randomUUID()
        : `member-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;


    const success =
      addAndSelectMember({
        id: memberId,
        name: cleanName,
      });


    if (!success) {
      setIdentityError(
        "新增失敗，請再試一次"
      );

      return;
    }


    setMemberNameInput(
      ""
    );

    setIdentityError(
      ""
    );

    setIdentityMode(
      "select"
    );

    setIsIdentityOpen(
      false
    );
  }


  // ========================================
  // OPEN EDIT
  // ========================================

  function handleOpenEdit() {
    if (!currentMember) {
      return;
    }


    setMemberNameInput(
      currentMember.name
    );

    setIdentityError(
      ""
    );

    setIdentityMode(
      "edit"
    );
  }


  // ========================================
  // SAVE MEMBER NAME
  // ========================================

  function handleSaveMemberName() {
    if (!currentMember) {
      return;
    }


    const cleanName =
      memberNameInput.trim();


    if (!cleanName) {
      setIdentityError(
        "名稱不能是空白"
      );

      return;
    }


    const success =
      updateMemberName(
        currentMember.id,
        cleanName
      );


    if (!success) {
      setIdentityError(
        "名稱更新失敗"
      );

      return;
    }


    setMemberNameInput(
      ""
    );

    setIdentityError(
      ""
    );

    setIdentityMode(
      "select"
    );
  }


  // ========================================
  // BACK TO SELECT
  // ========================================

  function handleBackToSelect() {
    setIdentityMode(
      "select"
    );

    setMemberNameInput(
      ""
    );

    setIdentityError(
      ""
    );
  }


  // ========================================
  // RENDER
  // ========================================

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
              🇯🇵{" "}
              {tripSettingsLoaded
                ? tripSettings.name
                : tripData.name}
            </h1>


            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs text-slate-400">
                {formatDateRange(
                  tripSettingsLoaded
                    ? tripSettings.startDate
                    : tripData.startDate,

                  tripSettingsLoaded
                    ? tripSettings.endDate
                    : tripData.endDate
                )}
              </p>


              {currentMember && (
                <>
                  <span className="text-[10px] text-slate-300">
                    ·
                  </span>


                  <button
                    type="button"
                    onClick={
                      handleOpenIdentity
                    }
                    className="text-[10px] font-semibold text-slate-400 transition active:scale-95"
                  >
                    👤{" "}
                    {
                      currentMember.name
                    }
                  </button>
                </>
              )}
            </div>
          </div>


          <button
            type="button"
            onClick={() =>
              setIsTripInfoOpen(
                true
              )
            }
            aria-label="查看旅程資訊"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm transition active:scale-95"
          >
            ✈️
          </button>
        </header>


        {/* ========================================
            SMART TRIP CARD
        ======================================== */}

        <TripStatusCard />


        {/* ========================================
            WEATHER
        ======================================== */}

        <WeatherAdviceBar />


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
            {quickTools.map(
              (tool) =>
                tool.href ===
                "#" ? (
                  <div
                    key={
                      tool.name
                    }
                    className="rounded-2xl bg-white px-2 py-4 text-center shadow-sm"
                  >
                    <div className="text-2xl">
                      {
                        tool.icon
                      }
                    </div>

                    <p className="mt-2 text-xs font-semibold text-slate-700">
                      {
                        tool.name
                      }
                    </p>
                  </div>
                ) : (
                  <Link
                    key={
                      tool.name
                    }
                    href={
                      tool.href
                    }
                    className="rounded-2xl bg-white px-2 py-4 text-center shadow-sm transition active:scale-[0.98]"
                  >
                    <div className="text-2xl">
                      {
                        tool.icon
                      }
                    </div>

                    <p className="mt-2 text-xs font-semibold text-slate-700">
                      {
                        tool.name
                      }
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

          {/* CHECKLIST */}

          <Link
            href="/checklist"
            className="rounded-3xl bg-white p-5 shadow-sm transition active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">
                {checklistCompleted
                  ? "✅"
                  : "🧳"}
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


            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  checklistCompleted
                    ? "bg-emerald-500"
                    : "bg-slate-900"
                }`}
                style={{
                  width: `${
                    checklistLoaded
                      ? percent
                      : 0
                  }%`,
                }}
              />
            </div>
          </Link>


          {/* EXPENSES */}

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


          {/* COUPONS */}

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

          <div className="text-center">
            <div>
              🏠
            </div>

            <p className="mt-1 text-[10px] font-bold text-slate-900">
              首頁
            </p>
          </div>


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


      {/* ========================================
          TRIP INFO
      ======================================== */}

      <TripInfoSheet
        isOpen={
          isTripInfoOpen
        }
        onClose={() =>
          setIsTripInfoOpen(
            false
          )
        }
      />


      {/* ========================================
          IDENTITY MODAL
      ======================================== */}

      {showIdentityModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">

          {/* BACKDROP */}

          <button
            type="button"
            aria-label="關閉"
            onClick={
              handleCloseIdentity
            }
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
          />


          {/* MODAL */}

          <section className="relative z-10 w-full max-w-sm rounded-[28px] bg-white p-5 shadow-2xl">

            {/* ========================================
                SELECT MODE
            ======================================== */}

            {identityMode ===
            "select" && (
              <>

                {/* HEADER */}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.24em] text-blue-600">
                      YOUR IDENTITY
                    </p>


                    <h2 className="mt-1.5 text-xl font-bold text-slate-900">
                      這趟旅行，你是誰？
                    </h2>


                    <p className="mt-1 text-xs text-slate-400">
                      選擇後會記住這台裝置
                    </p>
                  </div>


                  {currentMember && (
                    <button
                      type="button"
                      onClick={
                        handleCloseIdentity
                      }
                      aria-label="關閉"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-400 transition active:scale-95"
                    >
                      ×
                    </button>
                  )}
                </div>


                {/* ========================================
                    MEMBER GRID
                ======================================== */}

                <div className="mt-5 grid grid-cols-2 gap-2.5">

                  {members.map(
                    (member) => {
                      const selected =
                        currentMember?.id ===
                        member.id;


                      return (
                        <button
                          key={
                            member.id
                          }
                          type="button"
                          onClick={() =>
                            handleSelectMember(
                              member.id
                            )
                          }
                          className={`relative flex h-[58px] items-center justify-center rounded-2xl border px-3 transition active:scale-[0.98] ${
                            selected
                              ? "border-blue-500 bg-blue-50 shadow-sm"
                              : "border-slate-200 bg-white active:bg-slate-50"
                          }`}
                        >

                          {selected && (
                            <span className="absolute left-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                              ✓
                            </span>
                          )}


                          <span
                            className={`truncate text-sm ${
                              selected
                                ? "font-bold text-blue-700"
                                : "font-semibold text-slate-700"
                            }`}
                          >
                            {
                              member.name
                            }
                          </span>
                        </button>
                      );
                    }
                  )}


                  {/* ADD MEMBER */}

                  <button
                    type="button"
                    onClick={
                      handleOpenAdd
                    }
                    className="flex h-[58px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-3 text-xs font-bold text-slate-500 transition active:scale-[0.98] active:bg-slate-100"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-base font-normal text-blue-600">
                        ＋
                      </span>

                      新增
                    </span>
                  </button>
                </div>


                {/* ========================================
                    EDIT CURRENT MEMBER
                ======================================== */}

                {currentMember && (
                  <button
                    type="button"
                    onClick={
                      handleOpenEdit
                    }
                    className="mt-4 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-slate-400 transition active:bg-slate-50 active:text-slate-600"
                  >
                    <span>
                      ✏️
                    </span>

                    編輯我的名稱
                  </button>
                )}
              </>
            )}


            {/* ========================================
                ADD MODE
            ======================================== */}

            {identityMode ===
            "add" && (
              <>
                <button
                  type="button"
                  onClick={
                    handleBackToSelect
                  }
                  className="text-xs font-bold text-slate-400 transition active:text-slate-600"
                >
                  ‹ 返回
                </button>


                <div className="mt-4">
                  <p className="text-[9px] font-bold tracking-[0.24em] text-blue-600">
                    ADD TRAVELER
                  </p>


                  <h2 className="mt-1.5 text-xl font-bold text-slate-900">
                    新增自己
                  </h2>


                  <p className="mt-1 text-xs text-slate-400">
                    加入後會成為這台裝置的使用者
                  </p>
                </div>


                <div className="mt-5">
                  <label
                    htmlFor="new-member-name"
                    className="text-[10px] font-bold tracking-wide text-slate-500"
                  >
                    名稱
                  </label>


                  <input
                    id="new-member-name"
                    type="text"
                    value={
                      memberNameInput
                    }
                    onChange={(
                      event
                    ) => {
                      setMemberNameInput(
                        event.target.value
                      );

                      setIdentityError(
                        ""
                      );
                    }}
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        handleAddMyself();
                      }
                    }}
                    autoFocus
                    maxLength={20}
                    placeholder="例如：ㄆㄆ"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />


                  {identityError && (
                    <p className="mt-2 text-xs font-medium text-rose-500">
                      {
                        identityError
                      }
                    </p>
                  )}
                </div>


                <button
                  type="button"
                  onClick={
                    handleAddMyself
                  }
                  disabled={
                    !memberNameInput.trim()
                  }
                  className="mt-5 h-11 w-full rounded-xl bg-slate-900 text-sm font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  加入旅行
                </button>
              </>
            )}


            {/* ========================================
                EDIT MODE
            ======================================== */}

            {identityMode ===
            "edit" && (
              <>
                <button
                  type="button"
                  onClick={
                    handleBackToSelect
                  }
                  className="text-xs font-bold text-slate-400 transition active:text-slate-600"
                >
                  ‹ 返回
                </button>


                <div className="mt-4">
                  <p className="text-[9px] font-bold tracking-[0.24em] text-blue-600">
                    EDIT IDENTITY
                  </p>


                  <h2 className="mt-1.5 text-xl font-bold text-slate-900">
                    編輯我的名稱
                  </h2>


                  <p className="mt-1 text-xs text-slate-400">
                    不會影響既有記帳與分帳紀錄
                  </p>
                </div>


                <div className="mt-5">
                  <label
                    htmlFor="edit-member-name"
                    className="text-[10px] font-bold tracking-wide text-slate-500"
                  >
                    名稱
                  </label>


                  <input
                    id="edit-member-name"
                    type="text"
                    value={
                      memberNameInput
                    }
                    onChange={(
                      event
                    ) => {
                      setMemberNameInput(
                        event.target.value
                      );

                      setIdentityError(
                        ""
                      );
                    }}
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        handleSaveMemberName();
                      }
                    }}
                    autoFocus
                    maxLength={20}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />


                  {identityError && (
                    <p className="mt-2 text-xs font-medium text-rose-500">
                      {
                        identityError
                      }
                    </p>
                  )}
                </div>


                <button
                  type="button"
                  onClick={
                    handleSaveMemberName
                  }
                  disabled={
                    !memberNameInput.trim()
                  }
                  className="mt-5 h-11 w-full rounded-xl bg-slate-900 text-sm font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  儲存名稱
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}