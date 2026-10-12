"use client";

import Link from "next/link";

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
  useTripClock,
} from "../../hooks/useTripClock";

import {
  useExpenseData,
} from "../../hooks/useExpenseData";

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
      maximumFractionDigits: 2,
    }
  )}`;

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
          expense.amount /
            expense.splitBetween.length
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
  addExpense,
  deleteExpense,
  addMember,
  deleteMember,
  addCategory,
  deleteCategory,
  getMemberUsageCount,
  getCategoryUsageCount,
} = useExpenseData();


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
    !loaded
  ) {

    return (

      <main className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-md px-5 pt-5">

          <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />

          <div className="mt-7 h-72 animate-pulse rounded-3xl bg-slate-200" />

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


  const todayJPY =
    currentUser
      ? calculateMyShare(
          todayExpenses,
          currentUser.id,
          "JPY"
        )
      : 0;


  const todayTWD =
    currentUser
      ? calculateMyShare(
          todayExpenses,
          currentUser.id,
          "TWD"
        )
      : 0;


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

    <main className="min-h-screen bg-slate-50">


      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">


        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">


          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg"
          >
            ‹
          </Link>


          <div className="text-center">

            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400">
              EXPENSES
            </p>

            <h1 className="text-sm font-bold text-slate-900">
              共同記帳
            </h1>

          </div>


          <button
            type="button"
            onClick={() => {
              setExpenseInitialData(
                undefined
              );

              setAddExpenseOpen(
                true
              );
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xl font-light text-white"
          >
            +
          </button>


        </div>

      </header>


      {/* CONTENT */}

      <div className="mx-auto max-w-md px-5 pb-28 pt-5">


        {/* SETTLEMENT */}

        <Link
          href="/expenses/settlement"
          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
        >


          <div>

            <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
              SETTLEMENT
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              分帳結算
            </p>

          </div>


          <div className="flex items-center gap-2">

            <span className="text-xs font-semibold text-slate-400">
              查看最終結果
            </span>

            <span className="text-lg text-slate-300">
              ›
            </span>

          </div>


        </Link>


        {/* TODAY */}

        <div className="mb-3 mt-7 flex items-end justify-between">


          <div>

            <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
              TODAY
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">

              {formatDisplayDate(
                today
              )}

            </h2>

          </div>


          <div className="text-right">


            <p className="mb-1 text-[9px] font-bold tracking-[0.12em] text-slate-400">
              我的今日花費
            </p>


            <div className="flex items-center justify-end gap-2">


              {todayJPY >
                0 && (

                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white">

                  {formatMoney(
                    todayJPY,
                    "JPY"
                  )}

                </span>

              )}


              {todayTWD >
                0 && (

                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">

                  {formatMoney(
                    todayTWD,
                    "TWD"
                  )}

                </span>

              )}


            </div>


            <p className="mt-1 text-xs text-slate-400">

              {todayExpenses.length}
              {" "}筆支出

            </p>


          </div>


        </div>


        {/* EXPENSE LIST */}

        {todayExpenses.length >
        0 ? (

          <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">


            {todayExpenses.map(
              (
                expense,
                index
              ) => (

                <ExpenseRow
                  key={
                    expense.id
                  }
                  expense={
                    expense
                  }
                  members={
                    members
                  }
                  categories={
                    categories
                  }
                  isLast={
                    index ===
                    todayExpenses.length -
                      1
                  }
                  onClick={() =>
                    setSelectedExpense(
                      expense
                    )
                  }
                />

              )
            )}


          </section>

        ) : (

          <section className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center">

            <div className="text-3xl">
              💴
            </div>

            <p className="mt-3 text-sm font-bold text-slate-700">
              今天還守得住錢包 😎
            </p>

            <p className="mt-1 text-xs text-slate-400">
              點右上角 ＋ 花下去！
            </p>

          </section>

        )}

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

        onClose={() => {
          setAddExpenseOpen(
            false
          );

          setExpenseInitialData(
            undefined
          );
        }}

        onSave={addExpense}

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
          onClose={() => {

            setSelectedExpense(
              null
            );

            setDeleteConfirmOpen(
              false
            );

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
  isLast,
  onClick,
}: {
  expense: Expense;

  members:
    ExpenseMember[];

  categories:
    ExpenseCategory[];

  isLast: boolean;

  onClick: () => void;
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


  return (

    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex w-full items-center gap-3 px-4 py-4 text-left transition active:bg-slate-50 ${
        !isLast
          ? "border-b border-slate-100"
          : ""
      }`}
    >


      {/* ICON */}

      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg">

        {category?.icon ??
          "💴"}


        {isPrivate && (

          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[9px]">
            🔒
          </div>

        )}


      </div>


      {/* INFO */}

      <div className="min-w-0 flex-1">


        <div className="flex items-center gap-2">

          <p className="truncate text-sm font-bold text-slate-900">
            {expense.title}
          </p>


          {isPrivate ? (

            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
              私人
            </span>

          ) : (

            <span className="shrink-0 text-[9px] font-medium text-slate-400">

              {category?.name ??
                "未分類"}

            </span>

          )}


        </div>


        {isPrivate ? (

          <p className="mt-1 truncate text-[11px] text-slate-400">

            🔒 私人支出

            {expense.note &&
              ` · ${expense.note}`}

          </p>

        ) : (

          <p className="mt-1 truncate text-[11px] text-slate-400">

            {expense.note
              ? `${expense.note} · `
              : ""}

            {payer?.name ??
              "未知"}

            付款

          </p>

        )}


        <p className="mt-1 text-[10px] text-slate-400">

          {isPrivate
            ? "100% 計入我的花費"
            : `${expense.splitBetween.length} 人分攤`}

          {expense.time &&
            ` · ${expense.time}`}

        </p>


      </div>


      {/* MONEY */}

      <div className="shrink-0 text-right">

        <p className="text-sm font-bold text-slate-900">

          {formatMoney(
            expense.amount,
            expense.currency
          )}

        </p>

        <p className="mt-1 text-sm text-slate-300">
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
  onClose,
  onDelete,
}: {
  expense: Expense;

  members:
    ExpenseMember[];

  categories:
    ExpenseCategory[];

  onClose: () => void;

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


  return (

    <div className="fixed inset-0 z-50 flex items-end justify-center">


      {/* BACKDROP */}

      <button
        type="button"
        aria-label="關閉支出詳情"
        onClick={
          onClose
        }
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"
      />


      {/* SHEET */}

      <section className="relative z-10 w-full max-w-md rounded-t-[32px] bg-white px-5 pb-7 shadow-2xl">


        {/* HANDLE */}

        <div className="flex justify-center pt-3">

          <div className="h-1 w-10 rounded-full bg-slate-200" />

        </div>


        {/* HEADER */}

        <div className="mt-3 flex items-start justify-between">


          <div>

            <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
              EXPENSE DETAIL
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              支出詳情
            </h2>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500"
          >
            ×
          </button>


        </div>


        {/* MAIN */}

        <div className="mt-5 rounded-3xl bg-slate-900 px-5 py-5 text-white">


          <div className="flex items-start justify-between gap-4">


            <div className="flex min-w-0 items-center gap-3">


              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl">

                {category?.icon ??
                  "💴"}

              </div>


              <div className="min-w-0">

                <p className="truncate text-base font-bold">
                  {expense.title}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">

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

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">


          <DetailRow
            label="日期"
            value={
              formatDisplayDate(
                expense.date
              )
            }
          />


          {expense.time && (

            <DetailRow
              label="時間"
              value={
                expense.time
              }
            />

          )}


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
          ? "border-b border-slate-200/70"
          : ""
      }`}
    >

      <span className="shrink-0 text-xs font-medium text-slate-400">
        {label}
      </span>

      <span className="text-right text-xs font-bold text-slate-700">
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
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
      />


      {/* DIALOG */}

      <div className="relative z-10 w-full max-w-sm rounded-[28px] bg-white p-5 shadow-2xl">


        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl">
          🗑️
        </div>


        <h3 className="mt-4 text-lg font-bold text-slate-900">
          確定要刪除？
        </h3>


        <p className="mt-2 text-sm leading-6 text-slate-500">

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
            className="rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-600"
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