"use client";

import Link from "next/link";
import { allocateExpenseShares } from "../../lib/expenseShareAllocation";

import {
  useEffect,
  useState,
} from "react";

import {
  Expense,
  ExpenseCategory,
  ExpenseCurrency,
  ExpenseMember,
} from "../../data/expenseData";

import {
  cardCatalog,
} from "../../data/cardCatalog";

import {
  MyTravelCard,
} from "../../data/cardData";

import {
  useTripClock,
} from "../../hooks/useTripClock";

import {
  useExpenseData,
} from "../../hooks/useExpenseData";

import {
  useCreditCards,
} from "../../hooks/useCreditCards";

import {
  getLocalDateString,
} from "../../lib/tripStatus";

import AddExpenseSheet, {
  ExpenseInitialData,
} from "../components/AddExpenseSheet";


// ========================================
// MONEY
// ========================================

function formatMoney(
  amount: number,
  currency: ExpenseCurrency
) {

  const symbol =
    currency === "JPY"
      ? "¥"
      : "NT$";


  return `${symbol}${amount.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 0,
    }
  )}`;

}


function getPaymentCardName(
  expense: Expense,
  cards: MyTravelCard[]
) {
  if (
    expense.paymentMethod !==
      "card" ||
    !expense.paymentCardId
  ) {
    return null;
  }

  const card = cards.find(
    (item) =>
      item.id ===
      expense.paymentCardId
  );

  if (!card) {
    return "信用卡";
  }

  const catalogCard =
    card.catalogCardId
      ? cardCatalog.find(
          (item) =>
            item.id ===
            card.catalogCardId
        )
      : undefined;

  return (
    catalogCard?.name ??
    card.customName ??
    "信用卡"
  );
}

function getEstimatedCardTWD(
  expense: Expense
) {
  if (
    expense.paymentMethod !==
    "card"
  ) {
    return null;
  }

  if (
    expense.currency === "TWD"
  ) {
    return Math.round(
      expense.amount
    );
  }

  if (
    !expense.exchangeRateSnapshot
  ) {
    return null;
  }

  return Math.round(
    expense.amount *
      expense.exchangeRateSnapshot
        .rate
  );
}

// ========================================
// DATE
// ========================================

function formatDisplayDate(
  dateString: string
) {

  const [
    ,
    month,
    day,
  ] =
    dateString.split("-");


  return `${Number(
    month
  )} 月 ${Number(
    day
  )} 日`;

}


// ========================================
// MY SHARE
// ========================================

function calculateMyShare(
  expenses: Expense[],
  currentUserId: string,
  currency: ExpenseCurrency
) {

  return expenses
    .filter(
      (expense) =>
        expense.currency ===
        currency
    )
    .reduce(
      (
        total,
        expense
      ) => {

        // PRIVATE

        if (
          expense.visibility ===
          "private"
        ) {

          if (
            expense.paidBy ===
            currentUserId
          ) {

            return (
              total +
              expense.amount
            );

          }


          return total;

        }


        // SHARED

        if (
          !expense.splitBetween.includes(
            currentUserId
          )
        ) {

          return total;

        }


        if (
          expense.splitBetween.length ===
          0
        ) {

          return total;

        }


        return (
          total +
          (allocateExpenseShares(expense).find(
              (share) => share.memberId === currentUserId
            )?.amount ?? 0)
        );

      },
      0
    );

}


// ========================================
// PAGE
// ========================================

export default function ExpensePage() {

  const now =
    useTripClock();


  const {
  loaded,
  expenses,
  members,
  categories,
  currentMember,
  addExpense,
  updateExpense,
  deleteExpense,
  addMember,
  deleteMember,
  addCategory,
  deleteCategory,
  getMemberUsageCount,
  getCategoryUsageCount,
} = useExpenseData();


  const {
    loaded: cardsLoaded,
    cards: travelCards,
  } = useCreditCards(
    currentMember?.id
  );


  const [
    addExpenseOpen,
    setAddExpenseOpen,
  ] = useState(false);

  const [
    expenseInitialData,
    setExpenseInitialData,
  ] =
    useState<ExpenseInitialData | undefined>(
      undefined
    );

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [
    selectedExpense,
    setSelectedExpense,
  ] =
    useState<Expense | null>(
      null
    );


  const [
    deleteConfirmOpen,
    setDeleteConfirmOpen,
  ] = useState(false);

// ========================================
// RECEIPT PREFILL
// ========================================

useEffect(() => {
  if (!loaded) {
    return;
  }

  const raw =
    sessionStorage.getItem(
      "our-travel-receipt-expense"
    );

  if (!raw) {
    return;
  }

  try {
    const receipt = JSON.parse(
      raw
    ) as {
      amount?: number;
      currency?: ExpenseCurrency;
      title?: string;
      note?: string;
      categoryName?: string;
      date?: string;
    };

    const matchedCategory =
      categories.find(
        (category) =>
          category.name ===
          receipt.categoryName
      );

    setExpenseInitialData({
      amount:
        receipt.amount ?? 0,

      currency:
        receipt.currency ??
        "JPY",

      title:
        receipt.title ?? "",

      note:
        receipt.note ?? "",

      categoryId:
        matchedCategory?.id ??
        categories[0]?.id ??
        "",

      date:
        receipt.date,
    });

    setAddExpenseOpen(true);

    sessionStorage.removeItem(
      "our-travel-receipt-expense"
    );
  } catch (error) {
    console.error(
      "Failed to load receipt expense:",
      error
    );

    sessionStorage.removeItem(
      "our-travel-receipt-expense"
    );
  }
}, [
  loaded,
  categories,
]);

  // ========================================
  // LOADING
  // ========================================

  if (
    !now ||
    !loaded ||
    !cardsLoaded
  ) {

    return (

      <main className="min-h-screen bg-[#FFFCF6]">

        <div className="mx-auto max-w-md px-5 pt-5">

          <div className="h-20 animate-pulse rounded-2xl bg-[#E8DFD1]" />

          <div className="mt-7 h-72 animate-pulse rounded-3xl bg-[#E8DFD1]" />

        </div>

      </main>

    );

  }


  // ========================================
  // CURRENT USER
  // ========================================

  const currentUser =
    members.find(
      (member) =>
        member.isCurrentUser
    );


  // ========================================
  // TODAY
  // ========================================

  const today =
    getLocalDateString(
      now
    );


  const todayExpenses =
    expenses.filter(
      (expense) =>
        expense.date ===
        today
    );


  // 總覽顯示「我的分攤花費」，不等同於所有人的支出總額。
  const totalJPY = currentUser ? calculateMyShare(expenses, currentUser.id, "JPY") : 0;
  const totalTWD = currentUser ? calculateMyShare(expenses, currentUser.id, "TWD") : 0;
  const recentExpenses = [...expenses].sort((a, b) =>
    `${b.date} ${b.time ?? ""}`.localeCompare(`${a.date} ${a.time ?? ""}`)
  ).slice(0, 8);

  function openNewExpense() {
    setEditingExpense(null);
    setExpenseInitialData(undefined);
    setAddExpenseOpen(true);
  }

  // ========================================
  // DELETE
  // ========================================

  function handleDeleteExpense() {

    if (!selectedExpense) {
      return;
    }


    deleteExpense(
      selectedExpense.id
    );


    setDeleteConfirmOpen(
      false
    );


    setSelectedExpense(
      null
    );

  }


  // ========================================
  // UI
  // ========================================

  return (

    <main className="min-h-screen bg-[#FFFCF6]">


      {/* 簡潔頁首：不重複首頁的旅行插畫 */}
      <header className="sticky top-0 z-30 border-b border-[#E8DFD1] bg-[#FFFCF6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          <Link href="/" aria-label="返回首頁" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F0E7] text-xl text-[#554A3D]">‹</Link>
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#A28D70]">TRAVEL JOURNAL</p>
            <h1 className="text-lg font-bold text-[#3E3A39]">共同記帳</h1>
          </div>
          <span aria-hidden="true" className="h-10 w-10 shrink-0" />
        </div>
      </header>

      <div className="mx-auto max-w-md px-5 pb-28 pt-5">
        {/* 收據辨識：保留原本 /receipt 頁面的 Gemini 與儲存流程 */}
        <Link href="/receipt" className="flex items-center gap-4 rounded-[24px] border border-[#E8DFD1] bg-white px-4 py-4 shadow-[0_3px_12px_rgba(62,58,57,0.05)] transition active:bg-[#FFF8E9]">
          <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF2D9] text-3xl">🧾</span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold text-[#3E3A39]">收據辨識</span>
            <span className="mt-1 block text-xs text-[#938674]">拍照快速加入旅費</span>
          </span>
          <span aria-hidden="true" className="text-2xl text-[#A9957A]">›</span>
        </Link>

        {/* 快捷功能 */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button type="button" onClick={openNewExpense} className="flex min-h-[46px] items-center justify-center rounded-[16px] border border-[#E8DFD1] bg-[#FFF8EA] px-3 py-2 text-sm font-bold text-[#554A3D] shadow-[0_2px_8px_rgba(62,58,57,0.03)]">
            新增支出
          </button>
          <Link href="/expenses/settlement" className="flex min-h-[46px] items-center justify-center rounded-[16px] border border-[#E8DFD1] bg-[#FFF8EA] px-3 py-2 text-sm font-bold text-[#554A3D] shadow-[0_2px_8px_rgba(62,58,57,0.03)]">
            分帳結算
          </Link>

        </div>

        {/* 旅費總覽：使用既有整數分攤函式，幣別分開 */}
        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#3E3A39]">💰 旅費總覽</h2>
            <Link
              href="/expenses/history"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#8C5D00] transition hover:bg-[#FFF2DD] active:bg-[#FFF2DD]"
              aria-label="查看所有支出紀錄"
            >
              查看所有支出 <span aria-hidden="true">›</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0 rounded-[19px] bg-[#FFF2DD] px-2.5 py-2.5">
              <div className="flex items-center justify-center gap-1.5 text-[#785E45]">
                <span aria-hidden="true" className="text-base leading-none"> </span>
                <p className="text-[11px] font-semibold sm:text-xs">日幣 JPY</p>
              </div>
              <p className="mt-1 whitespace-nowrap text-center text-[clamp(15px,3.7vw,21px)] font-extrabold tracking-tight tabular-nums text-[#493A2B]">
                {formatMoney(totalJPY, "JPY")}
              </p>
            </div>
            <div className="min-w-0 rounded-[19px] bg-[#FFF2DD] px-2.5 py-2.5">
              <div className="flex items-center justify-center gap-1.5 text-[#785E45]">
                <span aria-hidden="true" className="text-base leading-none"> </span>
                <p className="text-[11px] font-semibold sm:text-xs">台幣 TWD</p>
              </div>
              <p className="mt-1 whitespace-nowrap text-center text-[clamp(15px,3.7vw,21px)] font-extrabold tracking-tight tabular-nums text-[#493A2B]">
                {formatMoney(totalTWD, "TWD")}
              </p>
            </div>
          </div>
        </section>

        {/* 最近支出 */}
        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[#3E3A39]">📋 最近支出</h2>
          </div>
          {recentExpenses.length ? (
            <div className="overflow-hidden rounded-[24px] border border-[#E8DFD1] bg-white px-3 shadow-[0_2px_12px_rgba(62,58,57,0.04)]">
              {recentExpenses.map((expense, index) => (
                <div key={expense.id} className={index ? "border-t border-[#F0E9DE]" : ""}>
                  <ExpenseRow expense={expense} members={members} categories={categories} cards={travelCards} onClick={() => setSelectedExpense(expense)} compact />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#E8DFD1] bg-white px-5 py-9 text-center">
              <p className="text-3xl">🧾</p>
              <p className="mt-3 text-sm font-bold text-[#554A3C]">還沒有支出紀錄</p>
              <p className="mt-1 text-xs text-[#938674]">新增第一筆支出，開始記錄旅程吧</p>
            </div>
          )}
        </section>
      </div>

      {/* =================================
          ADD EXPENSE
      ================================= */}

      <AddExpenseSheet
        open={addExpenseOpen}
        members={members}
        categories={categories}
        defaultDate={today}
        initialData={
          expenseInitialData
        }
        editingExpense={editingExpense ?? undefined}

        onClose={() => {
          setAddExpenseOpen(
            false
          );

          setExpenseInitialData(
            undefined
          );
          setEditingExpense(null);
        }}

        onSave={(expense) => {
          if (editingExpense) {
            updateExpense(expense);
          } else {
            addExpense(expense);
          }
        }}

        onAddMember={addMember}

        onDeleteMember={
          deleteMember
        }

        onAddCategory={
          addCategory
        }

        onDeleteCategory={
          deleteCategory
        }

        getMemberUsageCount={
          getMemberUsageCount
        }

        getCategoryUsageCount={
          getCategoryUsageCount
        }
      />


      {/* =================================
          EXPENSE DETAIL
      ================================= */}

      {selectedExpense && (

        <ExpenseDetailSheet
          expense={
            selectedExpense
          }
          members={
            members
          }
          categories={
            categories
          }
          cards={
            travelCards
          }
          onClose={() => {

            setSelectedExpense(
              null
            );

            setDeleteConfirmOpen(
              false
            );

          }}
          onEdit={() => {
            setEditingExpense(selectedExpense);
            setSelectedExpense(null);
            setExpenseInitialData(undefined);
            setAddExpenseOpen(true);
          }}
          onDelete={() =>
            setDeleteConfirmOpen(
              true
            )
          }
        />

      )}


      {/* =================================
          DELETE CONFIRM
      ================================= */}

      {selectedExpense &&
        deleteConfirmOpen && (

        <DeleteConfirmDialog
          expense={
            selectedExpense
          }
          onCancel={() =>
            setDeleteConfirmOpen(
              false
            )
          }
          onConfirm={
            handleDeleteExpense
          }
        />

      )}


    </main>

  );

}


// ========================================
// EXPENSE ROW
// ========================================

function ExpenseRow({
  expense,
  members,
  categories,
  cards,
  onClick,
  compact = false,
}: {
  expense: Expense;

  members:
    ExpenseMember[];

  categories:
    ExpenseCategory[];

  cards:
    MyTravelCard[];

  onClick: () => void;
  compact?: boolean;
}) {

  const category =
    categories.find(
      (item) =>
        item.id ===
        expense.categoryId
    );


  const payer =
    members.find(
      (member) =>
        member.id ===
        expense.paidBy
    );


  const isPrivate =
    expense.visibility ===
    "private";

  // 柔和分類底色：僅改變圖示外觀，不影響分類資料或計算。
  const categoryColorIndex = Math.max(0, categories.findIndex((item) => item.id === expense.categoryId));
  const iconBackgrounds = ["bg-[#FBE9D9]", "bg-[#E5F0E6]", "bg-[#F3E8F1]", "bg-[#E8EDF8]", "bg-[#FFF1D0]"];
  const iconBackground = iconBackgrounds[categoryColorIndex % iconBackgrounds.length];

  const paymentCardName =
    getPaymentCardName(
      expense,
      cards
    );


  return (

    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex w-full items-center gap-3 bg-white text-left transition active:bg-[#FFF8E9] ${compact ? "px-2 py-3" : "rounded-[22px] border border-[#E8DFD1] px-4 py-3.5 shadow-[0_2px_12px_rgba(62,58,57,0.04)]"}`}
    >


      {/* ICON */}

      <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${iconBackground}`} >

        {category?.icon ??
          "💴"}


        {isPrivate && (

          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#3E3A39] text-[9px]">
            🔒
          </div>

        )}


      </div>


      {/* INFO */}

      <div className="min-w-0 flex-1">


        <div className="flex items-center gap-2">

          <p className="truncate text-sm font-bold text-[#3E3A39]">
            {expense.title}
          </p>


          {isPrivate ? (

            <span className="shrink-0 rounded-full bg-[#F5F0E7] px-2 py-0.5 text-[9px] font-bold text-[#857867]">
              私人
            </span>

          ) : (

            <span className="shrink-0 text-[9px] font-medium text-[#938674]">

              {category?.name ??
                "未分類"}

            </span>

          )}


        </div>


        {isPrivate ? (

          <p className="mt-1 truncate text-[11px] text-[#938674]">

            {formatDisplayDate(expense.date)} · 🔒 私人支出

            {expense.note &&
              ` · ${expense.note}`}

          </p>

        ) : (

          <p className="mt-1 truncate text-[11px] text-[#938674]">

            {formatDisplayDate(expense.date)} · {expense.note
              ? `${expense.note} · `
              : ""}

            {payer?.name ??
              "未知"}

            付款

          </p>

        )}


        {expense.paymentMethod ===
          "card" && (
          <p className="mt-1 truncate text-[10px] font-semibold text-[#8C5D00]">
            💳 {paymentCardName}
          </p>
        )}


        <p className="mt-1 text-[10px] text-[#938674]">

          {isPrivate
            ? "100% 計入我的花費"
            : `${expense.splitBetween.length} 人分攤`}

          {expense.time &&
            ` · ${expense.time}`}

        </p>


      </div>


      {/* MONEY */}

      <div className="shrink-0 text-right">

        <p className="text-sm font-bold text-[#3E3A39]">

          {formatMoney(
            expense.amount,
            expense.currency
          )}

        </p>

        <p className="mt-1 text-sm text-[#B6A997]">
          ›
        </p>

      </div>


    </button>

  );

}


// ========================================
// EXPENSE DETAIL
// ========================================

function ExpenseDetailSheet({
  expense,
  members,
  categories,
  cards,
  onClose,
  onEdit,
  onDelete,
}: {
  expense: Expense;

  members:
    ExpenseMember[];

  categories:
    ExpenseCategory[];

  cards:
    MyTravelCard[];

  onClose: () => void;

  onEdit: () => void;

  onDelete: () => void;
}) {

  const category =
    categories.find(
      (item) =>
        item.id ===
        expense.categoryId
    );


  const payer =
    members.find(
      (member) =>
        member.id ===
        expense.paidBy
    );


  const splitMembers =
    expense.splitBetween
      .map(
        (memberId) =>
          members.find(
            (member) =>
              member.id ===
              memberId
          )
      )
      .filter(
        (
          member
        ): member is ExpenseMember =>
          Boolean(member)
      );


  const isPrivate =
    expense.visibility ===
    "private";


  const paymentCardName =
    getPaymentCardName(
      expense,
      cards
    );


  const estimatedCardTWD =
    getEstimatedCardTWD(
      expense
    );


  return (

    <div className="fixed inset-0 z-50 flex items-end justify-center">


      {/* BACKDROP */}

      <button
        type="button"
        aria-label="關閉支出詳情"
        onClick={
          onClose
        }
        className="absolute inset-0 bg-[#2B2623]/40 backdrop-blur-[1px]"
      />


      {/* SHEET */}

      <section className="relative z-10 w-full max-w-md rounded-t-[32px] bg-white px-5 pb-7 shadow-2xl">


        {/* HANDLE */}

        <div className="flex justify-center pt-3">

          <div className="h-1 w-10 rounded-full bg-[#E8DFD1]" />

        </div>


        {/* HEADER */}

        <div className="mt-3 flex items-start justify-between">


          <div>

            <p className="text-[10px] font-bold tracking-[0.18em] text-[#938674]">
              EXPENSE DETAIL
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#3E3A39]">
              支出詳情
            </h2>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F0E7] text-lg text-[#857867]"
          >
            ×
          </button>


        </div>


        {/* MAIN */}

        <div className="mt-5 rounded-3xl bg-[#FFF3DC] px-5 py-5 text-[#3E3A39]">


          <div className="flex items-start justify-between gap-4">


            <div className="flex min-w-0 items-center gap-3">


              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-xl">

                {category?.icon ??
                  "💴"}

              </div>


              <div className="min-w-0">

                <p className="truncate text-base font-bold">
                  {expense.title}
                </p>

                <p className="mt-1 text-[11px] text-[#938674]">

                  {category?.name ??
                    "未分類"}

                  {" · "}

                  {isPrivate
                    ? "🔒 私人支出"
                    : "👥 共同支出"}

                </p>

              </div>


            </div>


            <p className="shrink-0 text-xl font-bold">

              {formatMoney(
                expense.amount,
                expense.currency
              )}

            </p>


          </div>


        </div>


        {/* DETAILS */}

        <div className="mt-5 overflow-hidden rounded-2xl border border-[#E8DFD1] bg-[#FFFCF6]">


          <DetailRow
            label="日期時間"
            value={`${formatDisplayDate(expense.date)}${expense.time ? ` · ${expense.time}` : ""}`}
          />


          {!isPrivate && (

            <DetailRow
              label="付款人"
              value={
                payer?.name ??
                "未知"
              }
            />

          )}


          {!isPrivate && (

            <DetailRow
              label="分攤"
              value={
                splitMembers
                  .map(
                    (member) =>
                      member.name
                  )
                  .join("、") ||
                "無"
              }
            />

          )}


          {isPrivate && (

            <DetailRow
              label="負擔"
              value="自己 100%"
            />

          )}


          <DetailRow
            label="付款方式"
            value={
              expense.paymentMethod ===
              "card"
                ? `💳 ${
                    paymentCardName ??
                    "信用卡"
                  }`
                : expense.paymentMethod ===
                    "other"
                  ? "其他"
                  : "💵 現金"
            }
          />


          {expense.paymentMethod ===
            "card" &&
            expense.currency ===
              "JPY" &&
            expense.exchangeRateSnapshot && (
            <DetailRow
              label="刷卡參考匯率"
              value={`¥1 ≈ NT$${expense.exchangeRateSnapshot.rate.toFixed(4)}`}
            />
          )}


          {expense.paymentMethod ===
            "card" &&
            estimatedCardTWD !==
              null && (
            <DetailRow
              label="估算刷卡台幣"
              value={`NT$${estimatedCardTWD.toLocaleString(
                "zh-TW"
              )}`}
            />
          )}


          {expense.note && (

            <DetailRow
              label="備註"
              value={
                expense.note
              }
              isLast
            />

          )}


        </div>


        <button
          type="button"
          onClick={onEdit}
          className="mt-4 w-full rounded-2xl bg-[#F6D27A] py-3.5 text-sm font-bold text-[#554018]"
        >
          編輯這筆支出
        </button>

        {/* DELETE */}

        <button
          type="button"
          onClick={
            onDelete
          }
          className="mt-5 w-full rounded-2xl bg-red-50 py-3.5 text-sm font-bold text-red-600 active:scale-[0.99]"
        >
          刪除這筆支出
        </button>


      </section>


    </div>

  );

}


// ========================================
// DETAIL ROW
// ========================================

function DetailRow({
  label,
  value,
  isLast = false,
}: {
  label: string;

  value: string;

  isLast?: boolean;
}) {

  return (

    <div
      className={`flex items-start justify-between gap-5 px-4 py-3.5 ${
        !isLast
          ? "border-b border-[#E8DFD1]"
          : ""
      }`}
    >

      <span className="shrink-0 text-xs font-medium text-[#938674]">
        {label}
      </span>

      <span className="text-right text-xs font-bold text-[#554A3C]">
        {value}
      </span>

    </div>

  );

}


// ========================================
// DELETE CONFIRM
// ========================================

function DeleteConfirmDialog({
  expense,
  onCancel,
  onConfirm,
}: {
  expense: Expense;

  onCancel: () => void;

  onConfirm: () => void;
}) {

  return (

    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">


      {/* BACKDROP */}

      <button
        type="button"
        aria-label="取消刪除"
        onClick={
          onCancel
        }
        className="absolute inset-0 bg-[#2B2623]/50 backdrop-blur-[2px]"
      />


      {/* DIALOG */}

      <div className="relative z-10 w-full max-w-sm rounded-[28px] bg-white p-5 shadow-2xl">


        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl">
          🗑️
        </div>


        <h3 className="mt-4 text-lg font-bold text-[#3E3A39]">
          確定要刪除？
        </h3>


        <p className="mt-2 text-sm leading-6 text-[#857867]">

          「{expense.title}」

          {" "}

          {formatMoney(
            expense.amount,
            expense.currency
          )}

          {" "}刪除後將重新計算花費與分帳結果。

        </p>


        <div className="mt-5 grid grid-cols-2 gap-2">


          <button
            type="button"
            onClick={
              onCancel
            }
            className="rounded-2xl bg-[#F5F0E7] py-3.5 text-sm font-bold text-[#6F6253]"
          >
            先不要
          </button>


          <button
            type="button"
            onClick={
              onConfirm
            }
            className="rounded-2xl bg-red-600 py-3.5 text-sm font-bold text-white active:scale-[0.99]"
          >
            確定刪除
          </button>


        </div>


      </div>


    </div>

  );

}