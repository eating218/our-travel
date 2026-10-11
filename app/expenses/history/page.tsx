"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Expense,
  ExpenseCategory,
  ExpenseCurrency,
  ExpenseMember,
} from "../../../data/expenseData";

import {
  useExpenseData,
} from "../../../hooks/useExpenseData";


// ========================================
// TYPE
// ========================================

type FilterType =
  | "all"
  | "shared"
  | "private";


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

  return `${symbol}${Math.round(
    amount
  ).toLocaleString()}`;
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
  ] = dateString.split("-");

  return `${Number(
    month
  )} 月 ${Number(
    day
  )} 日`;
}


// ========================================
// SORT
// ========================================

function getExpenseTimestamp(
  expense: Expense
) {
  const time =
    expense.time ??
    "00:00";

  return new Date(
    `${expense.date}T${time}:00`
  ).getTime();
}


// ========================================
// PAGE
// ========================================

export default function ExpenseHistoryPage() {

  const {
    loaded,
    expenses,
    members,
    categories,
    deleteExpense,
  } =
    useExpenseData();


  const [
    filter,
    setFilter,
  ] =
    useState<FilterType>(
      "all"
    );


  // 哪些日期目前是展開的
  const [
    expandedDates,
    setExpandedDates,
  ] =
    useState<Set<string>>(
      new Set()
    );


  // 第一次載入後
  // 自動展開最新一天
  const [
    initialized,
    setInitialized,
  ] =
    useState(false);


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
  // FILTER
  // ========================================

  const filteredExpenses =
    useMemo(() => {

      const result =
        expenses.filter(
          (expense) => {

            if (
              filter === "all"
            ) {
              return true;
            }

            return (
              expense.visibility ===
              filter
            );

          }
        );


      return [
        ...result,
      ].sort(
        (a, b) =>
          getExpenseTimestamp(b) -
          getExpenseTimestamp(a)
      );

    }, [
      expenses,
      filter,
    ]);


  // ========================================
  // GROUP BY DATE
  // ========================================

  const groupedExpenses =
    useMemo(() => {

      const groups =
        new Map<
          string,
          Expense[]
        >();


      filteredExpenses.forEach(
        (expense) => {

          const current =
            groups.get(
              expense.date
            ) ?? [];


          current.push(
            expense
          );


          groups.set(
            expense.date,
            current
          );

        }
      );


      return Array.from(
        groups.entries()
      );

    }, [
      filteredExpenses,
    ]);


  // ========================================
  // AUTO OPEN LATEST DAY
  // ========================================

  useEffect(() => {

    if (
      !loaded ||
      initialized
    ) {
      return;
    }


    if (
      groupedExpenses.length >
      0
    ) {

      setExpandedDates(
        new Set([
          groupedExpenses[0][0],
        ])
      );

    }


    setInitialized(true);

  }, [
    loaded,
    initialized,
    groupedExpenses,
  ]);


  // ========================================
  // FILTER CHANGE
  // ========================================

  function changeFilter(
    nextFilter: FilterType
  ) {

    setFilter(
      nextFilter
    );


    /*
      切換共同 / 私人時，
      重新決定要展開哪一天。

      因為 React state 更新後
      filteredExpenses 才會改，
      所以這裡先清空。

      下方 effect 會處理新的第一天。
    */

    setExpandedDates(
      new Set()
    );

  }


  // ========================================
  // WHEN FILTER CHANGES
  // OPEN FIRST AVAILABLE DATE
  // ========================================

  useEffect(() => {

    if (
      !loaded ||
      groupedExpenses.length ===
        0
    ) {
      return;
    }


    setExpandedDates(
      (current) => {

        // 已經有日期展開
        // 就不要干涉使用者
        if (
          current.size >
          0
        ) {
          return current;
        }


        return new Set([
          groupedExpenses[0][0],
        ]);

      }
    );

  }, [
    filter,
    loaded,
    groupedExpenses,
  ]);


  // ========================================
  // TOGGLE DATE
  // ========================================

  function toggleDate(
    date: string
  ) {

    setExpandedDates(
      (current) => {

        const next =
          new Set(current);


        if (
          next.has(date)
        ) {

          next.delete(date);

        } else {

          next.add(date);

        }


        return next;

      }
    );

  }


  // ========================================
  // DELETE
  // ========================================

  function handleDelete() {

    if (
      !selectedExpense
    ) {
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
  // LOADING
  // ========================================

  if (!loaded) {

    return (

      <main className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-md px-5 pt-5">

          <div className="h-16 animate-pulse rounded-2xl bg-slate-200" />

          <div className="mt-5 h-12 animate-pulse rounded-2xl bg-slate-200" />

          <div className="mt-5 h-72 animate-pulse rounded-3xl bg-slate-200" />

        </div>

      </main>

    );

  }


  // ========================================
  // UI
  // ========================================

  return (

    <main className="min-h-screen bg-slate-50">


      {/* =================================
          HEADER
      ================================= */}

      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">

          <Link
            href="/expenses"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600"
          >
            ‹
          </Link>


          <div className="text-center">

            <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
              HISTORY
            </p>

            <h1 className="text-sm font-bold text-slate-900">
              所有紀錄
            </h1>

          </div>


          <div className="h-9 w-9" />

        </div>

      </header>


      {/* =================================
          CONTENT
      ================================= */}

      <div className="mx-auto max-w-md px-5 pb-28 pt-5">


        {/* =================================
            FILTER
        ================================= */}

        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-200/60 p-1">

          <FilterButton
            active={
              filter === "all"
            }
            onClick={() =>
              changeFilter(
                "all"
              )
            }
          >
            全部
          </FilterButton>


          <FilterButton
            active={
              filter ===
              "shared"
            }
            onClick={() =>
              changeFilter(
                "shared"
              )
            }
          >
            👥 共同
          </FilterButton>


          <FilterButton
            active={
              filter ===
              "private"
            }
            onClick={() =>
              changeFilter(
                "private"
              )
            }
          >
            🔒 私人
          </FilterButton>

        </div>


        {/* =================================
            RESULT COUNT
        ================================= */}

        <div className="mt-5 flex items-end justify-between px-1">

          <div>

            <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
              EXPENSE RECORDS
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">

              {filter === "all"
                ? "全部支出"
                : filter ===
                    "shared"
                  ? "共同支出"
                  : "私人支出"}

            </h2>

          </div>


          <p className="text-[11px] font-bold text-slate-400">

            {
              filteredExpenses.length
            } 筆

          </p>

        </div>


        {/* =================================
            EMPTY
        ================================= */}

        {filteredExpenses.length ===
        0 ? (

          <section className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center">

            <div className="text-3xl">
              🧾
            </div>

            <p className="mt-3 text-sm font-bold text-slate-700">
              還沒有紀錄
            </p>

            <p className="mt-1 text-xs text-slate-400">

              {filter === "private"
                ? "目前沒有私人支出"
                : filter ===
                    "shared"
                  ? "目前沒有共同支出"
                  : "花錢之後就會出現在這裡 😎"}

            </p>

          </section>

        ) : (

          /* =================================
             DATE GROUPS
          ================================= */

          <div className="mt-4 space-y-3">

            {groupedExpenses.map(
              ([
                date,
                dateExpenses,
              ]) => {

                const expanded =
                  expandedDates.has(
                    date
                  );


                return (

                  <section
                    key={date}
                    className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
                  >


                    {/* =====================
                        DATE BUTTON
                    ===================== */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleDate(
                          date
                        )
                      }
                      className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-slate-50"
                    >


                      {/* ARROW */}

                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
                          expanded
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >

                        <span
                          className={`text-xs transition-transform duration-200 ${
                            expanded
                              ? "rotate-90"
                              : ""
                          }`}
                        >
                          ›
                        </span>

                      </div>


                      {/* DATE */}

                      <div className="min-w-0 flex-1">

                        <p className="text-[9px] font-bold tracking-[0.15em] text-slate-400">
                          DATE
                        </p>

                        <h3 className="mt-0.5 text-sm font-bold text-slate-900">

                          {formatDisplayDate(
                            date
                          )}

                        </h3>

                      </div>


                      {/* COUNT */}

                      <div className="shrink-0 text-right">

                        <p className="text-xs font-bold text-slate-600">

                          {
                            dateExpenses.length
                          }

                          <span className="ml-1 text-[10px] font-medium text-slate-400">
                            筆
                          </span>

                        </p>

                      </div>

                    </button>


                    {/* =====================
                        EXPENSES
                    ===================== */}

                    {expanded && (

                      <div className="border-t border-slate-100">

                        {dateExpenses.map(
                          (
                            expense,
                            index
                          ) => (

                            <HistoryExpenseRow
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
                                dateExpenses.length -
                                  1
                              }
                              onClick={() => {

                                setSelectedExpense(
                                  expense
                                );

                                setDeleteConfirmOpen(
                                  false
                                );

                              }}
                            />

                          )
                        )}

                      </div>

                    )}


                  </section>

                );

              }
            )}

          </div>

        )}

      </div>


      {/* =================================
          DETAIL
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
            handleDelete
          }
        />

      )}

    </main>

  );

}


// ========================================
// FILTER BUTTON
// ========================================

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;

  onClick: () => void;

  children:
    React.ReactNode;
}) {

  return (

    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500"
      }`}
    >
      {children}
    </button>

  );

}


// ========================================
// HISTORY ROW
// ========================================

function HistoryExpenseRow({
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
      onClick={onClick}
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


        <p className="mt-1 truncate text-[11px] text-slate-400">

          {isPrivate ? (
            <>
              🔒 私人支出
            </>
          ) : (
            <>
              {payer?.name ??
                "未知"}
              付款 ·{" "}
              {
                expense
                  .splitBetween
                  .length
              }{" "}
              人分攤
            </>
          )}

          {expense.note &&
            ` · ${expense.note}`}

        </p>


        {expense.time && (

          <p className="mt-1 text-[10px] text-slate-300">
            {expense.time}
          </p>

        )}

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
// DETAIL SHEET
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

      <button
        type="button"
        aria-label="關閉"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"
      />


      <section className="relative z-10 w-full max-w-md rounded-t-[32px] bg-white px-5 pb-7 shadow-2xl">

        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>


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
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500"
          >
            ×
          </button>

        </div>


        {/* MAIN CARD */}

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


        {/* INFO */}

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
            />

          )}

        </div>


        <button
          type="button"
          onClick={onDelete}
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
}: {
  label: string;
  value: string;
}) {

  return (

    <div className="flex items-start justify-between gap-5 border-b border-slate-200/70 px-4 py-3.5 last:border-b-0">

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
// DELETE DIALOG
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

      <button
        type="button"
        aria-label="取消"
        onClick={onCancel}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
      />


      <div className="relative z-10 w-full max-w-sm rounded-[28px] bg-white p-5 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl">
          🗑️
        </div>


        <h3 className="mt-4 text-lg font-bold text-slate-900">
          確定要刪除？
        </h3>


        <p className="mt-2 text-sm leading-6 text-slate-500">

          「{expense.title}」{" "}

          {formatMoney(
            expense.amount,
            expense.currency
          )}

          {" "}刪除後會重新計算花費與分帳結果。

        </p>


        <div className="mt-5 grid grid-cols-2 gap-2">

          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-600"
          >
            先不要
          </button>


          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-red-600 py-3.5 text-sm font-bold text-white active:scale-[0.99]"
          >
            確定刪除
          </button>

        </div>

      </div>

    </div>

  );

}