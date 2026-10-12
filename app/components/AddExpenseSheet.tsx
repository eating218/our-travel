"use client";

import { useEffect, useRef, useState } from "react";

import {
  Expense,
  ExpenseCategory,
  ExpenseMember,
  ExpenseVisibility,
} from "../../data/expenseData";

import ExpenseCalculator, {
  ExpenseCurrency,
} from "./ExpenseCalculator";

export type ExpenseInitialData = {
  amount?: number;
  currency?: ExpenseCurrency;
  title?: string;
  note?: string;
  categoryId?: string;
  date?: string;
};

type Props = {
  open: boolean;
  members: ExpenseMember[];
  categories: ExpenseCategory[];
  defaultDate: string;
  initialData?: ExpenseInitialData;

  onClose: () => void;

  onSave: (expense: Expense) => void;

  onAddMember: (member: ExpenseMember) => void;

  onAddCategory: (category: ExpenseCategory) => void;

  onDeleteMember: (memberId: string) => boolean;

  onDeleteCategory: (categoryId: string) => boolean;

  getMemberUsageCount: (memberId: string) => number;

  getCategoryUsageCount: (categoryId: string) => number;
};

type ManageTarget =
  | {
      type: "member";
      item: ExpenseMember;
    }
  | {
      type: "category";
      item: ExpenseCategory;
    }
  | null;

export default function AddExpenseSheet({
  open,
  members,
  categories,
  defaultDate,
  initialData,
  onClose,
  onSave,
  onAddMember,
  onAddCategory,
  onDeleteMember,
  onDeleteCategory,
  getMemberUsageCount,
  getCategoryUsageCount,
}: Props) {
  // ========================================
  // FORM
  // ========================================

  const [amount, setAmount] = useState(0);

  const [currency, setCurrency] =
    useState<ExpenseCurrency>("JPY");

  const [title, setTitle] = useState("");

  const [note, setNote] = useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [visibility, setVisibility] =
    useState<ExpenseVisibility>("shared");

  const [paidBy, setPaidBy] =
    useState("");

  const [splitBetween, setSplitBetween] =
    useState<string[]>([]);

  const [date, setDate] =
    useState(defaultDate);

  // ========================================
  // UI
  // ========================================

  const [calculatorOpen, setCalculatorOpen] =
    useState(false);

  const [showAddMember, setShowAddMember] =
    useState(false);

  const [showAddCategory, setShowAddCategory] =
    useState(false);

  const [manageTarget, setManageTarget] =
    useState<ManageTarget>(null);

  // ========================================
  // LONG PRESS
  // ========================================

  const longPressTimer = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const longPressTriggered =
    useRef(false);

  function startLongPress(
    target: ManageTarget
  ) {
    longPressTriggered.current = false;

    if (longPressTimer.current) {
      clearTimeout(
        longPressTimer.current
      );
    }

    longPressTimer.current =
      setTimeout(() => {
        longPressTriggered.current =
          true;

        setManageTarget(target);
      }, 550);
  }

  function stopLongPress() {
    if (longPressTimer.current) {
      clearTimeout(
        longPressTimer.current
      );

      longPressTimer.current = null;
    }
  }

  // ========================================
  // NEW MEMBER
  // ========================================

  const [
    newMemberName,
    setNewMemberName,
  ] = useState("");

  // ========================================
  // NEW CATEGORY
  // ========================================

  const [
    newCategoryName,
    setNewCategoryName,
  ] = useState("");

  const [
    newCategoryIcon,
    setNewCategoryIcon,
  ] = useState("✨");

  // ========================================
  // OPEN
  // ========================================

  const wasOpenRef = useRef(false);

  // ========================================
  // CURRENT USER
  // ========================================

  const currentUser =
    members.find(
      (member) =>
        member.isCurrentUser
    );

  // ========================================
  // INITIALIZE
  // ========================================

  useEffect(() => {
    if (
      open &&
      !wasOpenRef.current
    ) {
      const initialCurrentUser =
        members.find(
          (member) =>
            member.isCurrentUser
        );

      setAmount(
        initialData?.amount ?? 0
      );

      setCurrency(
        initialData?.currency ??
          "JPY"
      );

      setTitle(
        initialData?.title ?? ""
      );

      setNote(
        initialData?.note ?? ""
      );

      setCategoryId(
        initialData?.categoryId ??
          categories[0]?.id ??
          ""
      );

      // 預設為共同支出
      setVisibility("shared");

      setPaidBy(
        initialCurrentUser?.id ??
          members[0]?.id ??
          ""
      );

      // 共同支出預設全部旅伴一起分攤
      setSplitBetween(
        members.map(
          (member) =>
            member.id
        )
      );

      setDate(
        initialData?.date ??
          defaultDate
      );

      setCalculatorOpen(false);
      setShowAddMember(false);
      setShowAddCategory(false);
      setManageTarget(null);

      setNewMemberName("");
      setNewCategoryName("");
      setNewCategoryIcon("✨");
    }

    wasOpenRef.current = open;
  }, [
    open,
    defaultDate,
    initialData,
    members,
    categories,
  ]);

  // ========================================
  // CLEAN LONG PRESS TIMER
  // ========================================

  useEffect(() => {
    return () => {
      if (
        longPressTimer.current
      ) {
        clearTimeout(
          longPressTimer.current
        );
      }
    };
  }, []);

  // ========================================
  // SPLIT
  // ========================================

  function toggleSplitMember(
    memberId: string
  ) {
    setSplitBetween(
      (current) => {
        if (
          current.includes(
            memberId
          )
        ) {
          return current.filter(
            (id) =>
              id !== memberId
          );
        }

        return [
          ...current,
          memberId,
        ];
      }
    );
  }

  // ========================================
  // VISIBILITY
  // ========================================

  function selectShared() {
    setVisibility("shared");

    // 如果先前從私人切回共同，
    // 但目前沒有分攤人，就恢復全部旅伴。
    if (
      splitBetween.length === 0
    ) {
      setSplitBetween(
        members.map(
          (member) =>
            member.id
        )
      );
    }

    // 沒有付款人時預設自己
    if (!paidBy) {
      setPaidBy(
        currentUser?.id ??
          members[0]?.id ??
          ""
      );
    }
  }

  function selectPrivate() {
    setVisibility("private");
  }

  // ========================================
  // ADD MEMBER
  // ========================================

  function handleAddMember() {
    const name =
      newMemberName.trim();

    if (!name) {
      return;
    }

    const member:
      ExpenseMember = {
      id: `member-${Date.now()}`,
      name,
    };

    onAddMember(member);

    // 只有共同支出才自動把新旅伴加入分攤
    if (
      visibility === "shared"
    ) {
      setSplitBetween(
        (current) => [
          ...current,
          member.id,
        ]
      );
    }

    setNewMemberName("");

    setShowAddMember(false);
  }

  // ========================================
  // ADD CATEGORY
  // ========================================

  function handleAddCategory() {
    const name =
      newCategoryName.trim();

    const icon =
      newCategoryIcon.trim() ||
      "✨";

    if (!name) {
      return;
    }

    const category:
      ExpenseCategory = {
      id: `category-${Date.now()}`,
      name,
      icon,
    };

    onAddCategory(category);

    setCategoryId(
      category.id
    );

    setNewCategoryName("");
    setNewCategoryIcon("✨");
    setShowAddCategory(false);
  }

  // ========================================
  // DELETE MANAGED ITEM
  // ========================================

  function handleDeleteManagedItem() {
    if (!manageTarget) {
      return;
    }

    if (
      manageTarget.type ===
      "category"
    ) {
      const targetId =
        manageTarget.item.id;

      const deleted =
        onDeleteCategory(
          targetId
        );

      if (!deleted) {
        return;
      }

      if (
        categoryId === targetId
      ) {
        const nextCategory =
          categories.find(
            (category) =>
              category.id !==
              targetId
          );

        setCategoryId(
          nextCategory?.id ??
            ""
        );
      }

      setManageTarget(null);

      return;
    }

    // MEMBER

    const targetId =
      manageTarget.item.id;

    const deleted =
      onDeleteMember(
        targetId
      );

    if (!deleted) {
      return;
    }

    if (
      paidBy === targetId
    ) {
      setPaidBy(
        currentUser?.id ??
          members.find(
            (member) =>
              member.id !==
              targetId
          )?.id ??
          ""
      );
    }

    setSplitBetween(
      (current) =>
        current.filter(
          (id) =>
            id !== targetId
        )
    );

    setManageTarget(null);
  }

  // ========================================
  // SAVE
  // ========================================

  function handleSave() {
    if (
      amount <= 0 ||
      title.trim() === "" ||
      categoryId === ""
    ) {
      return;
    }

    // 共同支出必須有付款人與至少一位負擔人
    if (
      visibility === "shared" &&
      (
        paidBy === "" ||
        splitBetween.length === 0
      )
    ) {
      return;
    }

    // 私人支出必須知道目前使用者
    if (
      visibility === "private" &&
      !currentUser
    ) {
      return;
    }

    const realNow =
      new Date();

    const time =
      `${String(
        realNow.getHours()
      ).padStart(
        2,
        "0"
      )}:${String(
        realNow.getMinutes()
      ).padStart(
        2,
        "0"
      )}`;

    const expense:
      Expense = {
      id: `expense-${Date.now()}`,

      title:
        title.trim(),

      note:
        note.trim() ||
        undefined,

      amount,

      currency,

      categoryId,

      // visibility 現在代表「可見性」
      visibility,

      // 私人支出固定視為本人付款
      paidBy:
        visibility === "private"
          ? currentUser!.id
          : paidBy,

      // 私人支出固定由本人負擔
      splitBetween:
        visibility === "private"
          ? [currentUser!.id]
          : splitBetween,

      date,

      time,
    };

    onSave(expense);

    onClose();
  }

  // ========================================
  // CAN SAVE
  // ========================================

  const canSave =
    amount > 0 &&
    title.trim() !== "" &&
    categoryId !== "" &&
    (
      visibility === "private"
        ? Boolean(currentUser)
        : paidBy !== "" &&
          splitBetween.length > 0
    );

  const currencySymbol =
    currency === "JPY"
      ? "¥"
      : "NT$";

  // ========================================
  // MANAGE INFO
  // ========================================

  let manageUsageCount = 0;

  let manageCannotDelete =
    false;

  if (
    manageTarget?.type ===
    "category"
  ) {
    manageUsageCount =
      getCategoryUsageCount(
        manageTarget.item.id
      );

    manageCannotDelete =
      manageUsageCount > 0;
  }

  if (
    manageTarget?.type ===
    "member"
  ) {
    manageUsageCount =
      getMemberUsageCount(
        manageTarget.item.id
      );

    manageCannotDelete =
      Boolean(
        manageTarget.item
          .isCurrentUser
      ) ||
      manageUsageCount > 0;
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="關閉"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"
      />

      {/* MAIN SHEET */}

      <section className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col rounded-t-[32px] bg-white shadow-2xl">
        {/* HANDLE */}

        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* HEADER */}

        <div className="flex items-center justify-between px-5 pb-4 pt-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
              NEW EXPENSE
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              新增支出
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

        {/* CONTENT */}

        <div className="overflow-y-auto px-5 pb-6">
          {/* =================================
              AMOUNT
          ================================= */}

          <div className="rounded-3xl bg-slate-900 px-5 py-5 text-white">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold tracking-[0.16em] text-blue-300">
                AMOUNT
              </p>

              <div className="flex rounded-full bg-white/10 p-1">
                <button
                  type="button"
                  onClick={() =>
                    setCurrency(
                      "JPY"
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                    currency ===
                    "JPY"
                      ? "bg-white text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  ¥ 日幣
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCurrency(
                      "TWD"
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                    currency ===
                    "TWD"
                      ? "bg-white text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  NT$ 台幣
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setCalculatorOpen(
                  true
                )
              }
              className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-4 text-left active:scale-[0.99]"
            >
              <div>
                <p className="text-[10px] font-medium text-slate-500">
                  點擊輸入金額
                </p>

                <div className="mt-1 flex items-end gap-2">
                  <span className="pb-1 text-xl font-bold text-slate-500">
                    {
                      currencySymbol
                    }
                  </span>

                  <span className="text-4xl font-bold tracking-tight">
                    {amount.toLocaleString(
                      undefined,
                      {
                        maximumFractionDigits:
                          2,
                      }
                    )}
                  </span>
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl">
                ⌨
              </div>
            </button>
          </div>

          {/* =================================
              TITLE
          ================================= */}

          <div className="mt-5">
            <label className="text-xs font-bold text-slate-700">
              項目
            </label>

            <input
              type="text"
              placeholder="例如：午餐"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          {/* =================================
              CATEGORY
          ================================= */}

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700">
                  分類
                </p>

                <p className="mt-0.5 text-[9px] text-slate-400">
                  長按可以管理
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddCategory(
                    true
                  )
                }
                className="text-[11px] font-bold text-blue-600"
              >
                ＋ 新增分類
              </button>
            </div>

            <div className="mt-2 grid grid-cols-4 gap-2">
              {categories.map(
                (category) => {
                  const active =
                    categoryId ===
                    category.id;

                  return (
                    <button
                      key={
                        category.id
                      }
                      type="button"
                      onPointerDown={() =>
                        startLongPress(
                          {
                            type: "category",
                            item: category,
                          }
                        )
                      }
                      onPointerUp={
                        stopLongPress
                      }
                      onPointerCancel={
                        stopLongPress
                      }
                      onPointerLeave={
                        stopLongPress
                      }
                      onClick={() => {
                        if (
                          longPressTriggered.current
                        ) {
                          longPressTriggered.current =
                            false;

                          return;
                        }

                        setCategoryId(
                          category.id
                        );
                      }}
                      className={`select-none rounded-2xl px-2 py-3 ${
                        active
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <div className="text-lg">
                        {
                          category.icon
                        }
                      </div>

                      <p className="mt-1 truncate text-[10px] font-bold">
                        {
                          category.name
                        }
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* =================================
              VISIBILITY
          ================================= */}

          <div className="mt-5">
            <div>
              <p className="text-xs font-bold text-slate-700">
                可見性
              </p>

              <p className="mt-0.5 text-[9px] text-slate-400">
                決定這筆支出是否讓同行旅伴看到
              </p>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={
                  selectShared
                }
                className={`rounded-2xl border px-3 py-3.5 text-center transition ${
                  visibility ===
                  "shared"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                <div className="text-lg">
                  👥
                </div>

                <p className="mt-1 text-xs font-bold">
                  共同
                </p>

                <p
                  className={`mt-1 text-[9px] ${
                    visibility ===
                    "shared"
                      ? "text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  同行旅伴可見
                </p>
              </button>

              <button
                type="button"
                onClick={
                  selectPrivate
                }
                className={`rounded-2xl border px-3 py-3.5 text-center transition ${
                  visibility ===
                  "private"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                <div className="text-lg">
                  🔒
                </div>

                <p className="mt-1 text-xs font-bold">
                  私人
                </p>

                <p
                  className={`mt-1 text-[9px] ${
                    visibility ===
                    "private"
                      ? "text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  只有自己可見
                </p>
              </button>
            </div>
          </div>

          {/* =================================
              PRIVATE INFO
          ================================= */}

          {visibility ===
            "private" && (
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg">
                  🔒
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-700">
                    私人支出
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-slate-400">
                    這筆支出只屬於你自己，不需要選擇付款人或分攤對象。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =================================
              SHARED ONLY
          ================================= */}

          {visibility ===
            "shared" && (
            <>
              {/* =================================
                  PAYER
              ================================= */}

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      誰付款？
                    </p>

                    <p className="mt-0.5 text-[9px] text-slate-400">
                      長按可以管理旅伴
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowAddMember(
                        true
                      )
                    }
                    className="text-[11px] font-bold text-blue-600"
                  >
                    ＋ 新增旅伴
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {members.map(
                    (member) => {
                      const active =
                        paidBy ===
                        member.id;

                      return (
                        <button
                          key={
                            member.id
                          }
                          type="button"
                          onPointerDown={() =>
                            startLongPress(
                              {
                                type: "member",
                                item: member,
                              }
                            )
                          }
                          onPointerUp={
                            stopLongPress
                          }
                          onPointerCancel={
                            stopLongPress
                          }
                          onPointerLeave={
                            stopLongPress
                          }
                          onClick={() => {
                            if (
                              longPressTriggered.current
                            ) {
                              longPressTriggered.current =
                                false;

                              return;
                            }

                            setPaidBy(
                              member.id
                            );
                          }}
                          className={`select-none rounded-full px-4 py-2.5 text-xs font-bold ${
                            active
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {
                            member.name
                          }

                          {member.isCurrentUser &&
                            "（我）"}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* =================================
                  SPLIT
              ================================= */}

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700">
                    誰要分攤？
                  </p>

                  {amount > 0 &&
                    splitBetween.length >
                      0 && (
                      <p className="text-[10px] font-semibold text-slate-400">
                        約{" "}
                        {
                          currencySymbol
                        }
                        {(
                          amount /
                          splitBetween.length
                        ).toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits:
                              2,
                          }
                        )}{" "}
                        / 人
                      </p>
                    )}
                </div>

                <div className="mt-2 space-y-2">
                  {members.map(
                    (member) => {
                      const checked =
                        splitBetween.includes(
                          member.id
                        );

                      return (
                        <button
                          key={
                            member.id
                          }
                          type="button"
                          onClick={() =>
                            toggleSplitMember(
                              member.id
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                            checked
                              ? "border-slate-900 bg-slate-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <p className="text-sm font-bold text-slate-900">
                            {
                              member.name
                            }

                            {member.isCurrentUser &&
                              "（我）"}
                          </p>

                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold ${
                              checked
                                ? "bg-slate-900 text-white"
                                : "border border-slate-200 text-transparent"
                            }`}
                          >
                            ✓
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>

                {splitBetween.length ===
                  0 && (
                  <p className="mt-2 text-[10px] font-semibold text-amber-600">
                    至少選擇一位負擔人
                  </p>
                )}
              </div>
            </>
          )}

          {/* =================================
              DATE
          ================================= */}

          <div className="mt-5">
            <label className="text-xs font-bold text-slate-700">
              日期
            </label>

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          {/* =================================
              NOTE
          ================================= */}

          <div className="mt-5">
            <label className="text-xs font-bold text-slate-700">
              備註

              <span className="ml-1 font-normal text-slate-400">
                選填
              </span>
            </label>

            <input
              type="text"
              placeholder="例如：祇園周邊"
              value={note}
              onChange={(event) =>
                setNote(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>
        </div>

        {/* =================================
            SAVE
        ================================= */}

        <div className="border-t border-slate-100 bg-white px-5 pb-5 pt-4">
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className={`w-full rounded-2xl py-3.5 text-sm font-bold ${
              canSave
                ? "bg-slate-900 text-white active:scale-[0.99]"
                : "bg-slate-100 text-slate-300"
            }`}
          >
            {visibility ===
            "private"
              ? "🔒 記下來"
              : "花下去！"}
          </button>
        </div>

        {/* =================================
            CALCULATOR
        ================================= */}

        <ExpenseCalculator
          open={
            calculatorOpen
          }
          currency={currency}
          initialAmount={
            amount
          }
          onClose={() =>
            setCalculatorOpen(
              false
            )
          }
          onConfirm={
            setAmount
          }
        />
      </section>

      {/* =====================================
          ADD MEMBER
      ===================================== */}

      {showAddMember && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-slate-950/30">
          <div className="w-full max-w-md rounded-t-[28px] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
                  NEW MEMBER
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  新增旅伴
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddMember(
                    false
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"
              >
                ×
              </button>
            </div>

            <input
              autoFocus
              type="text"
              placeholder="例如：爸爸"
              value={
                newMemberName
              }
              onChange={(event) =>
                setNewMemberName(
                  event.target.value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  handleAddMember();
                }
              }}
              className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />

            <p className="mt-3 text-[11px] leading-5 text-slate-400">
              對方不需要使用 App，也可以由其他旅伴代為記帳與分帳。
            </p>

            <button
              type="button"
              disabled={
                !newMemberName.trim()
              }
              onClick={
                handleAddMember
              }
              className={`mt-5 w-full rounded-2xl py-3.5 text-sm font-bold ${
                newMemberName.trim()
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-300"
              }`}
            >
              新增旅伴
            </button>
          </div>
        </div>
      )}

      {/* =====================================
          ADD CATEGORY
      ===================================== */}

      {showAddCategory && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-slate-950/30">
          <div className="w-full max-w-md rounded-t-[28px] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
                  NEW CATEGORY
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  新增分類
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddCategory(
                    false
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="mt-5 flex gap-3">
              <input
                type="text"
                value={
                  newCategoryIcon
                }
                onChange={(
                  event
                ) =>
                  setNewCategoryIcon(
                    event.target.value
                  )
                }
                maxLength={4}
                className="w-16 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xl outline-none"
              />

              <input
                autoFocus
                type="text"
                placeholder="例如：娛樂"
                value={
                  newCategoryName
                }
                onChange={(
                  event
                ) =>
                  setNewCategoryName(
                    event.target.value
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    handleAddCategory();
                  }
                }}
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              左邊可以輸入 Emoji，例如 🎮、♨️、💊、🎁。
            </p>

            <button
              type="button"
              disabled={
                !newCategoryName.trim()
              }
              onClick={
                handleAddCategory
              }
              className={`mt-5 w-full rounded-2xl py-3.5 text-sm font-bold ${
                newCategoryName.trim()
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-300"
              }`}
            >
              新增分類
            </button>
          </div>
        </div>
      )}

      {/* =====================================
          MANAGE ITEM
      ===================================== */}

      {manageTarget && (
        <div className="absolute inset-0 z-30 flex items-end justify-center bg-slate-950/40">
          <button
            type="button"
            aria-label="關閉管理"
            onClick={() =>
              setManageTarget(
                null
              )
            }
            className="absolute inset-0"
          />

          <div className="relative z-10 w-full max-w-md rounded-t-[28px] bg-white p-5">
            {/* CATEGORY */}

            {manageTarget.type ===
              "category" && (
              <>
                <div className="text-center">
                  <div className="text-3xl">
                    {
                      manageTarget.item
                        .icon
                    }
                  </div>

                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    {
                      manageTarget.item
                        .name
                    }
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-400">
                    分類管理
                  </p>
                </div>

                {manageCannotDelete ? (
                  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-center">
                    <p className="text-sm font-bold text-slate-700">
                      這個分類目前不能刪除
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      目前有{" "}
                      <strong className="text-slate-600">
                        {
                          manageUsageCount
                        }
                      </strong>{" "}
                      筆支出正在使用這個分類。
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={
                      handleDeleteManagedItem
                    }
                    className="mt-5 w-full rounded-2xl bg-red-50 py-3.5 text-sm font-bold text-red-600 active:scale-[0.99]"
                  >
                    刪除這個分類
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setManageTarget(
                      null
                    )
                  }
                  className="mt-2 w-full rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-600"
                >
                  {manageCannotDelete
                    ? "知道了"
                    : "取消"}
                </button>
              </>
            )}

            {/* MEMBER */}

            {manageTarget.type ===
              "member" && (
              <>
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {manageTarget.item.name.slice(
                      0,
                      1
                    )}
                  </div>

                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    {
                      manageTarget.item
                        .name
                    }

                    {manageTarget.item
                      .isCurrentUser &&
                      "（我）"}
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-400">
                    旅伴管理
                  </p>
                </div>

                {manageTarget.item
                  .isCurrentUser ? (
                  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-center">
                    <p className="text-sm font-bold text-slate-700">
                      這是你自己 😎
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      目前帳本的本人不能刪除。
                    </p>
                  </div>
                ) : manageUsageCount >
                  0 ? (
                  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-center">
                    <p className="text-sm font-bold text-slate-700">
                      這位旅伴目前不能刪除
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      目前有{" "}
                      <strong className="text-slate-600">
                        {
                          manageUsageCount
                        }
                      </strong>{" "}
                      筆支出與這位旅伴有關。
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={
                      handleDeleteManagedItem
                    }
                    className="mt-5 w-full rounded-2xl bg-red-50 py-3.5 text-sm font-bold text-red-600 active:scale-[0.99]"
                  >
                    刪除這位旅伴
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setManageTarget(
                      null
                    )
                  }
                  className="mt-2 w-full rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-600"
                >
                  {manageCannotDelete
                    ? "知道了"
                    : "取消"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}