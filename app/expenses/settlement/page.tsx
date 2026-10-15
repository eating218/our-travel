"use client";



import Link from "next/link";

import {

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

// TYPES

// ========================================



type Balance = {

  memberId: string;

  amount: number;

};

type MemberShare = {
  memberId: string;
  amount: number;
};

type Settlement = {

  from: string;

  to: string;

  amount: number;

};



type MyExpenseSummary = {

  shared: number;

  private: number;

  total: number;

};



type RecordFilter =

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

  const [, month, day] =

    dateString.split("-");



  return `${Number(month)} 月 ${Number(day)} 日`;

}





function getExpenseTimestamp(

  expense: Expense

) {

  const time =

    expense.time ?? "00:00";



  return new Date(

    `${expense.date}T${time}:00`

  ).getTime();

}





// ========================================
// EXACT MONEY SPLIT
// ========================================

function allocateExpenseShares(expense: Expense): MemberShare[] {
  const memberIds = expense.splitBetween;
  if (memberIds.length === 0) return [];

  const total = Math.round(expense.amount);
  const base = Math.floor(total / memberIds.length);
  const remainder = total - base * memberIds.length;
  const remainderReceiver = memberIds.includes(expense.paidBy)
    ? expense.paidBy
    : memberIds[0];

  return memberIds.map((memberId) => ({
    memberId,
    amount: base + (memberId === remainderReceiver ? remainder : 0),
  }));
}


// ========================================

// BALANCE

// ========================================



function calculateBalances(

  expenses: Expense[],

  members: ExpenseMember[],

  currency: ExpenseCurrency

) {

  const balanceMap =

    new Map<string, number>();



  members.forEach(

    (member) => {

      balanceMap.set(

        member.id,

        0

      );

    }

  );



  expenses

    .filter(

      (expense) =>

        expense.currency ===

          currency &&

        expense.visibility ===

          "shared"

    )

    .forEach(

      (expense) => {

        if (

          expense.splitBetween.length ===

          0

        ) {

          return;

        }



        balanceMap.set(

          expense.paidBy,

          (

            balanceMap.get(

              expense.paidBy

            ) ?? 0

          ) + expense.amount

        );



        const allocations = allocateExpenseShares(expense);

        allocations.forEach(({ memberId, amount }) => {
          balanceMap.set(
            memberId,
            (balanceMap.get(memberId) ?? 0) - amount
          );
        });

      }

    );



  return Array.from(

    balanceMap.entries()

  ).map(

    ([memberId, amount]) => ({

      memberId,

      amount,

    })

  );

}





// ========================================

// SETTLEMENT

// ========================================



function createSettlements(

  balances: Balance[]

): Settlement[] {

  const EPSILON = 0.01;



  const creditors =

    balances

      .filter(

        (balance) =>

          balance.amount >

          EPSILON

      )

      .map(

        (balance) => ({

          ...balance,

        })

      )

      .sort(

        (a, b) =>

          b.amount -

          a.amount

      );



  const debtors =

    balances

      .filter(

        (balance) =>

          balance.amount <

          -EPSILON

      )

      .map(

        (balance) => ({

          memberId:

            balance.memberId,



          amount:

            Math.abs(

              balance.amount

            ),

        })

      )

      .sort(

        (a, b) =>

          b.amount -

          a.amount

      );



  const settlements:

    Settlement[] = [];



  let creditorIndex = 0;

  let debtorIndex = 0;



  while (

    creditorIndex <

      creditors.length &&

    debtorIndex <

      debtors.length

  ) {

    const creditor =

      creditors[

        creditorIndex

      ];



    const debtor =

      debtors[

        debtorIndex

      ];



    const amount =

      Math.min(

        creditor.amount,

        debtor.amount

      );



    if (

      amount >

      EPSILON

    ) {

      settlements.push({

        from:

          debtor.memberId,



        to:

          creditor.memberId,



        amount,

      });

    }



    creditor.amount -=

      amount;



    debtor.amount -=

      amount;



    if (

      creditor.amount <=

      EPSILON

    ) {

      creditorIndex += 1;

    }



    if (

      debtor.amount <=

      EPSILON

    ) {

      debtorIndex += 1;

    }

  }



  return settlements;

}





// ========================================

// MY EXPENSE

// ========================================



function calculateMyExpense(

  expenses: Expense[],

  currentUserId: string,

  currency: ExpenseCurrency

): MyExpenseSummary {

  let shared = 0;

  let privateAmount = 0;



  expenses

    .filter(

      (expense) =>

        expense.currency ===

        currency

    )

    .forEach(

      (expense) => {

        if (

          expense.visibility ===

          "private"

        ) {

          if (

            expense.paidBy ===

            currentUserId

          ) {

            privateAmount +=

              expense.amount;

          }



          return;

        }



        if (

          !expense.splitBetween.includes(

            currentUserId

          )

        ) {

          return;

        }



        if (

          expense.splitBetween.length ===

          0

        ) {

          return;

        }



        const allocation = allocateExpenseShares(expense).find(
          (share) => share.memberId === currentUserId
        );

        shared += allocation?.amount ?? 0;

      }

    );



  return {

    shared,

    private: privateAmount,

    total:

      shared +

      privateAmount,

  };

}





// ========================================

// MEMBER

// ========================================



function getMemberName(

  memberId: string,

  members: ExpenseMember[]

) {

  const member =

    members.find(

      (item) =>

        item.id ===

        memberId

    );



  if (!member) {

    return "未知旅伴";

  }



  return member.isCurrentUser

    ? `${member.name}（我）`

    : member.name;

}





// ========================================

// PAGE

// ========================================



export default function SettlementPage() {

  const {

    loaded,

    expenses,

    members,

    categories,

    deleteExpense,

  } =

    useExpenseData();





  const [

    recordFilter,

    setRecordFilter,

  ] =

    useState<RecordFilter>(

      "all"

    );





  const [

    expandedDates,

    setExpandedDates,

  ] =

    useState<Set<string>>(

      new Set()

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

  ] =

    useState(false);





  // ========================================

  // RECORDS

  // ========================================



  const filteredRecords =

    useMemo(() => {

      return [

        ...expenses.filter(

          (expense) => {

            if (

              recordFilter ===

              "all"

            ) {

              return true;

            }



            return (

              expense.visibility ===

              recordFilter

            );

          }

        ),

      ].sort(

        (a, b) =>

          getExpenseTimestamp(b) -

          getExpenseTimestamp(a)

      );

    }, [

      expenses,

      recordFilter,

    ]);





  const groupedRecords =

    useMemo(() => {

      const groups =

        new Map<

          string,

          Expense[]

        >();



      filteredRecords.forEach(

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

      filteredRecords,

    ]);





  // ========================================

  // LOADING

  // ========================================



  if (!loaded) {

    return (

      <main className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-md px-5 pt-5">



          <div className="h-16 animate-pulse rounded-2xl bg-slate-200" />



          <div className="mt-5 h-52 animate-pulse rounded-3xl bg-slate-200" />



          <div className="mt-5 h-72 animate-pulse rounded-3xl bg-slate-200" />



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





  if (!currentUser) {

    return (

      <main className="min-h-screen bg-slate-50">



        <div className="mx-auto max-w-md px-5 pt-20 text-center">



          <p className="text-sm font-bold text-slate-700">

            找不到目前使用者

          </p>



          <Link

            href="/expenses"

            className="mt-4 inline-block text-sm font-bold text-blue-600"

          >

            返回共同記帳

          </Link>



        </div>



      </main>

    );

  }





  // ========================================

  // SUMMARY

  // ========================================



  const myJPY =

    calculateMyExpense(

      expenses,

      currentUser.id,

      "JPY"

    );



  const myTWD =

    calculateMyExpense(

      expenses,

      currentUser.id,

      "TWD"

    );





  // ========================================

  // SETTLEMENTS

  // ========================================



  const jpySettlements =

    createSettlements(

      calculateBalances(

        expenses,

        members,

        "JPY"

      )

    );



  const twdSettlements =

    createSettlements(

      calculateBalances(

        expenses,

        members,

        "TWD"

      )

    );





  // ========================================

  // RECORD ACTIONS

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





  function changeRecordFilter(

    filter: RecordFilter

  ) {

    setRecordFilter(

      filter

    );



    // 切換分類後全部收起

    setExpandedDates(

      new Set()

    );

  }





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

  // UI

  // ========================================



  return (

    <main className="min-h-screen bg-slate-50">





      {/* HEADER */}



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

              SETTLEMENT

            </p>



            <h1 className="text-sm font-bold text-slate-900">

              分帳結算

            </h1>



          </div>





          <div className="h-9 w-9" />



        </div>



      </header>





      <div className="mx-auto max-w-md px-5 pb-28 pt-5">



    {/* =================================

        MY EXPENSE

    ================================= */}



    <section className="rounded-[28px] bg-slate-900 px-5 py-5 text-white">



    {/* TITLE */}



    <div>

        <p className="text-xs font-bold tracking-[0.18em] text-blue-300">

        MY TRIP EXPENSE

        </p>



        <h2 className="mt-1.5 text-xl font-bold">

        我的旅行花費

        </h2>



        <p className="mt-1.5 text-sm text-slate-400">

        共同分攤 ＋ 私人支出

        </p>

    </div>





    {/* CURRENCY SUMMARY */}



    <div className="mt-6">



        {/* JPY */}



        <div>



        <div className="flex items-end justify-between gap-4">



            <p className="text-sm font-bold text-slate-400">

            🇯🇵 日幣

            </p>



            <p className="text-3xl font-bold tracking-tight">

            {formatMoney(

                myJPY.total,

                "JPY"

            )}

            </p>



        </div>





        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">



            <span className="text-slate-400">

            共同{" "}

            <span className="text-slate-200">

                {formatMoney(

                myJPY.shared,

                "JPY"

                )}

            </span>

            </span>



            <span className="text-slate-600">

            ·

            </span>



            <span className="text-slate-400">

            🔒 私人{" "}

            <span className="text-slate-200">

                {formatMoney(

                myJPY.private,

                "JPY"

                )}

            </span>

            </span>



        </div>



        </div>





        {/* DIVIDER */}



        <div className="my-5 border-t border-white/10" />





        {/* TWD */}



        <div>



        <div className="flex items-end justify-between gap-4">



            <p className="text-sm font-bold text-slate-400">

            🇹🇼 台幣

            </p>



            <p className="text-3xl font-bold tracking-tight">

            {formatMoney(

                myTWD.total,

                "TWD"

            )}

            </p>



        </div>





        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">



            <span className="text-slate-400">

            共同{" "}

            <span className="text-slate-200">

                {formatMoney(

                myTWD.shared,

                "TWD"

                )}

            </span>

            </span>



            <span className="text-slate-600">

            ·

            </span>



            <span className="text-slate-400">

            🔒 私人{" "}

            <span className="text-slate-200">

                {formatMoney(

                myTWD.private,

                "TWD"

                )}

            </span>

            </span>



        </div>



        </div>



    </div>



    </section>





        {/* =================================

            WHO PAYS WHO

        ================================= */}



        <div className="mb-3 mt-7">



          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400">

            FINAL SETTLEMENT

          </p>



          <h2 className="mt-1 text-lg font-bold text-slate-900">

            誰要給誰？

          </h2>



          <p className="mt-1 text-[11px] leading-5 text-slate-400">

            已自動抵銷彼此代墊，只留下最後需要轉帳的金額。

          </p>



        </div>





        <SettlementSection

          title="🇯🇵 日幣"

          currency="JPY"

          settlements={

            jpySettlements

          }

          members={

            members

          }

        />





        <div className="mt-4">



          <SettlementSection

            title="🇹🇼 台幣"

            currency="TWD"

            settlements={

              twdSettlements

            }

            members={

              members

            }

          />



        </div>





        {/* =================================

            RECORDS

        ================================= */}



        <section className="mt-9">





          {/* TITLE */}



          <div>



            <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400">

              EXPENSE RECORDS

            </p>



            <div className="mt-1 flex items-end justify-between">



              <h2 className="text-lg font-bold text-slate-900">

                支出紀錄

              </h2>



              <p className="text-[10px] font-bold text-slate-400">

                {filteredRecords.length} 筆

              </p>



            </div>



          </div>





          {/* FILTER */}



          <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-slate-200/60 p-1">



            <RecordFilterButton

              active={

                recordFilter ===

                "all"

              }

              onClick={() =>

                changeRecordFilter(

                  "all"

                )

              }

            >

              全部

            </RecordFilterButton>





            <RecordFilterButton

              active={

                recordFilter ===

                "shared"

              }

              onClick={() =>

                changeRecordFilter(

                  "shared"

                )

              }

            >

              👥 共同

            </RecordFilterButton>





            <RecordFilterButton

              active={

                recordFilter ===

                "private"

              }

              onClick={() =>

                changeRecordFilter(

                  "private"

                )

              }

            >

              🔒 私人

            </RecordFilterButton>



          </div>





          {/* EMPTY */}



          {filteredRecords.length ===

          0 ? (



            <div className="mt-3 rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-9 text-center">



              <div className="text-2xl">

                🧾

              </div>



              <p className="mt-2 text-sm font-bold text-slate-700">

                還沒有紀錄

              </p>



            </div>



          ) : (



            /* DATE ACCORDION */



            <div className="mt-3 space-y-3">



              {groupedRecords.map(

                ([

                  date,

                  dateExpenses,

                ]) => {



                  const expanded =

                    expandedDates.has(

                      date

                    );



                  return (

                    <div

                      key={date}

                      className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"

                    >



                      {/* DATE HEADER */}



                      <button

                        type="button"

                        onClick={() =>

                          toggleDate(

                            date

                          )

                        }

                        className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-slate-50"

                      >



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





                        <div className="min-w-0 flex-1">



                          <p className="text-[9px] font-bold tracking-[0.14em] text-slate-400">

                            DATE

                          </p>



                          <p className="mt-0.5 text-sm font-bold text-slate-900">

                            {formatDisplayDate(

                              date

                            )}

                          </p>



                        </div>





                        <p className="shrink-0 text-xs font-bold text-slate-500">



                          {dateExpenses.length}



                          <span className="ml-1 text-[10px] font-medium text-slate-400">

                            筆

                          </span>



                        </p>



                      </button>





                      {/* RECORD LIST */}



                      {expanded && (



                        <div className="border-t border-slate-100">



                          {dateExpenses.map(

                            (

                              expense,

                              index

                            ) => (



                              <ExpenseRecordRow

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



                    </div>

                  );

                }

              )}



            </div>



          )}



        </section>





        {/* INFO */}



        <section className="mt-7 rounded-3xl bg-blue-50 px-5 py-4">



          <div className="flex gap-3">



            <div className="mt-0.5 text-base">

              💡

            </div>



            <div>



              <p className="text-xs font-bold text-blue-900">

                結算怎麼算？

              </p>



              <p className="mt-1 text-[11px] leading-5 text-blue-700/70">

                共同支出會依照每筆設定的分攤人數計算每個人的實際負擔，再扣除已經代墊的金額。私人支出只計入你的旅行花費，不會影響其他人的結算。

              </p>



            </div>



          </div>



        </section>



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

// SUMMARY MINI CARD

// ========================================



function SummaryMiniCard({

  label,

  value,

}: {

  label: string;

  value: string;

}) {

  return (

    <div className="rounded-2xl bg-white/[0.06] px-3 py-3">



      <p className="text-[9px] font-bold text-slate-500">

        {label}

      </p>



      <p className="mt-1 text-sm font-bold">

        {value}

      </p>



    </div>

  );

}





// ========================================

// SETTLEMENT SECTION

// ========================================



function SettlementSection({

  title,

  currency,

  settlements,

  members,

}: {

  title: string;

  currency: ExpenseCurrency;

  settlements: Settlement[];

  members: ExpenseMember[];

}) {



  const [

    expanded,

    setExpanded,

  ] = useState(

    settlements.length > 0

  );





  return (



    <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">





      {/* =================================

          HEADER

      ================================= */}



      <button

        type="button"

        onClick={() =>

          setExpanded(

            (current) =>

              !current

          )

        }

        className="flex w-full items-center gap-3 px-5 py-4 text-left active:bg-slate-50"

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





        {/* CURRENCY */}



        <p className="min-w-0 flex-1 text-sm font-bold text-slate-900">

          {title}

        </p>





        {/* COUNT */}



        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-500">



          {settlements.length}



          {" "}筆轉帳



        </span>





      </button>





      {/* =================================

          CONTENT

      ================================= */}



      {expanded && (



        <div className="border-t border-slate-100">





          {/* EMPTY */}



          {settlements.length ===

          0 ? (



            <div className="px-5 py-6 text-center">



              <div className="text-xl">

                ✨

              </div>



              <p className="mt-2 text-sm font-bold text-slate-700">

                已經扯平啦

              </p>



              <p className="mt-1 text-[11px] text-slate-400">

                目前沒有需要互相轉帳的金額

              </p>



            </div>



          ) : (



            /* SETTLEMENTS */



            <div>



              {settlements.map(

                (

                  settlement,

                  index

                ) => (



                  <SettlementRow

                    key={

                      `${currency}-${settlement.from}-${settlement.to}-${index}`

                    }

                    settlement={

                      settlement

                    }

                    currency={

                      currency

                    }

                    members={

                      members

                    }

                    isLast={

                      index ===

                      settlements.length -

                        1

                    }

                  />



                )

              )}



            </div>



          )}





        </div>



      )}





    </section>



  );



}





// ========================================

// SETTLEMENT ROW

// ========================================



function SettlementRow({

  settlement,

  currency,

  members,

  isLast,

}: {

  settlement: Settlement;

  currency: ExpenseCurrency;

  members: ExpenseMember[];

  isLast: boolean;

}) {

  const fromName =

    getMemberName(

      settlement.from,

      members

    );



  const toName =

    getMemberName(

      settlement.to,

      members

    );



  return (

    <div

      className={`px-5 py-4 ${

        !isLast

          ? "border-b border-slate-100"

          : ""

      }`}

    >



      <div className="flex items-center gap-3">



        <div className="min-w-0 flex-1">



          <p className="text-[9px] font-bold tracking-[0.1em] text-slate-400">

            FROM

          </p>



          <p className="mt-1 truncate text-sm font-bold text-slate-900">

            {fromName}

          </p>



        </div>





        <div className="flex shrink-0 flex-col items-center">



          <p className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white">

            {formatMoney(

              settlement.amount,

              currency

            )}

          </p>



          <div className="mt-1 text-sm text-slate-300">

            →

          </div>



        </div>





        <div className="min-w-0 flex-1 text-right">



          <p className="text-[9px] font-bold tracking-[0.1em] text-slate-400">

            TO

          </p>



          <p className="mt-1 truncate text-sm font-bold text-slate-900">

            {toName}

          </p>



        </div>



      </div>



    </div>

  );

}





// ========================================

// RECORD FILTER

// ========================================



function RecordFilterButton({

  active,

  onClick,

  children,

}: {

  active: boolean;

  onClick: () => void;

  children: React.ReactNode;

}) {

  return (

    <button

      type="button"

      onClick={onClick}

      className={`rounded-xl px-2 py-2.5 text-xs font-bold transition ${

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

// RECORD ROW

// ========================================



function ExpenseRecordRow({

  expense,

  members,

  categories,

  isLast,

  onClick,

}: {

  expense: Expense;

  members: ExpenseMember[];

  categories: ExpenseCategory[];

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

      className={`flex w-full items-center gap-3 px-4 py-4 text-left active:bg-slate-50 ${

        !isLast

          ? "border-b border-slate-100"

          : ""

      }`}

    >



      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg">



        {category?.icon ??

          "💴"}



        {isPrivate && (

          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[9px]">

            🔒

          </div>

        )}



      </div>





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



          {isPrivate

            ? "🔒 私人支出"

            : `${payer?.name ?? "未知"}付款 · ${expense.splitBetween.length} 人分攤`}



          {expense.note &&

            ` · ${expense.note}`}



        </p>





        {expense.time && (

          <p className="mt-1 text-[10px] text-slate-300">

            {expense.time}

          </p>

        )}



      </div>





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

  members: ExpenseMember[];

  categories: ExpenseCategory[];

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