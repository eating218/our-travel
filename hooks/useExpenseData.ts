"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Expense,
  ExpenseCategory,
  ExpenseMember,
  SettlementPayment,
  initialExpenseCategories,
  initialExpenseMembers,
  initialExpenses,
  initialSettlementPayments,
} from "../data/expenseData";


// ========================================
// STORAGE
// ========================================

const STORAGE_KEY =
  "our-travel-expense-data";

const CURRENT_MEMBER_STORAGE_KEY =
  "our-travel-current-member-id";


// ========================================
// STORAGE TYPE
// ========================================

type ExpenseStorageData = {
  expenses: Expense[];
  members: ExpenseMember[];
  categories: ExpenseCategory[];
  settlementPayments?: SettlementPayment[];
};


// ========================================
// MIGRATION
// ========================================

function migrateExpenses(
  expenses: Expense[]
): Expense[] {
  return expenses.map(
    (expense) => ({
      ...expense,

      visibility:
        expense.visibility ??
        "shared",

      // 舊資料沒有付款方式時，一律視為現金。
      paymentMethod:
        expense.paymentMethod ??
        "cash",
    })
  );
}


function migrateMembers(
  members: ExpenseMember[]
): ExpenseMember[] {
  return members.map(
    (member) => ({
      id: member.id,
      name: member.name,
    })
  );
}


// ========================================
// HOOK
// ========================================

export function useExpenseData() {
  const [
    storedMembers,
    setStoredMembers,
  ] = useState<ExpenseMember[]>(
    initialExpenseMembers
  );


  const [
    expenses,
    setExpenses,
  ] = useState<Expense[]>(
    initialExpenses
  );


  const [
    categories,
    setCategories,
  ] = useState<ExpenseCategory[]>(
    initialExpenseCategories
  );


  const [
    settlementPayments,
    setSettlementPayments,
  ] = useState<SettlementPayment[]>(
    initialSettlementPayments
  );


  const [
    currentMemberId,
    setCurrentMemberIdState,
  ] = useState<string | null>(
    null
  );


  const [
    loaded,
    setLoaded,
  ] = useState(false);


  // ========================================
  // MEMBERS WITH CURRENT USER
  // ========================================

  const members =
    useMemo(
      () =>
        storedMembers.map(
          (member) => ({
            ...member,

            isCurrentUser:
              currentMemberId ===
              member.id,
          })
        ),
      [
        storedMembers,
        currentMemberId,
      ]
    );


  const currentMember =
    useMemo(
      () =>
        members.find(
          (member) =>
            member.id ===
            currentMemberId
        ) ?? null,
      [
        members,
        currentMemberId,
      ]
    );


  const needsIdentitySetup =
    loaded &&
    !currentMember;


  // ========================================
  // LOAD
  // ========================================

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );


      if (saved) {
        const data =
          JSON.parse(
            saved
          ) as ExpenseStorageData;


        if (
          Array.isArray(
            data.expenses
          )
        ) {
          setExpenses(
            migrateExpenses(
              data.expenses
            )
          );
        }


        if (
          Array.isArray(
            data.members
          )
        ) {
          setStoredMembers(
            migrateMembers(
              data.members
            )
          );
        }


        if (
          Array.isArray(
            data.categories
          )
        ) {
          setCategories(
            data.categories
          );
        }


        if (
          Array.isArray(
            data.settlementPayments
          )
        ) {
          setSettlementPayments(
            data.settlementPayments
          );
        } else {
          setSettlementPayments(
            []
          );
        }
      }


      const savedCurrentMemberId =
        localStorage.getItem(
          CURRENT_MEMBER_STORAGE_KEY
        );


      if (
        savedCurrentMemberId
      ) {
        setCurrentMemberIdState(
          savedCurrentMemberId
        );
      }
    } catch (error) {
      console.error(
        "讀取記帳資料失敗：",
        error
      );
    }


    setLoaded(true);
  }, []);


  // ========================================
  // SAVE EXPENSE DATA
  // ========================================

  useEffect(() => {
    if (!loaded) {
      return;
    }


    const data:
      ExpenseStorageData = {
        expenses,

        members:
          migrateMembers(
            storedMembers
          ),

        categories,

        settlementPayments,
      };


    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          data
        )
      );
    } catch (error) {
      console.error(
        "儲存記帳資料失敗：",
        error
      );
    }
  }, [
    loaded,
    expenses,
    storedMembers,
    categories,
    settlementPayments,
  ]);


  // ========================================
  // CURRENT MEMBER
  // ========================================

  function setCurrentMember(
    memberId: string
  ) {
    const exists =
      storedMembers.some(
        (member) =>
          member.id ===
          memberId
      );


    if (!exists) {
      return false;
    }


    setCurrentMemberIdState(
      memberId
    );


    try {
      localStorage.setItem(
        CURRENT_MEMBER_STORAGE_KEY,
        memberId
      );
    } catch (error) {
      console.error(
        "儲存目前使用者失敗：",
        error
      );
    }


    return true;
  }


  function clearCurrentMember() {
    setCurrentMemberIdState(
      null
    );


    try {
      localStorage.removeItem(
        CURRENT_MEMBER_STORAGE_KEY
      );
    } catch (error) {
      console.error(
        "清除目前使用者失敗：",
        error
      );
    }
  }


  // ========================================
  // ADD + SELECT MEMBER
  // ========================================

  function addAndSelectMember(
    member: ExpenseMember
  ) {
    const cleanName =
      member.name.trim();


    if (!cleanName) {
      return false;
    }


    const exists =
      storedMembers.some(
        (item) =>
          item.id ===
          member.id
      );


    if (exists) {
      return false;
    }


    const cleanMember:
      ExpenseMember = {
      id: member.id,
      name: cleanName,
    };


    /**
     * 同一次操作完成：
     *
     * 1. 加入旅伴
     * 2. 設成這台裝置的 Identity
     */
    setStoredMembers(
      (current) => [
        ...current,
        cleanMember,
      ]
    );


    setCurrentMemberIdState(
      cleanMember.id
    );


    try {
      localStorage.setItem(
        CURRENT_MEMBER_STORAGE_KEY,
        cleanMember.id
      );
    } catch (error) {
      console.error(
        "儲存目前使用者失敗：",
        error
      );
    }


    return true;
  }


  // ========================================
  // UPDATE MEMBER NAME
  // ========================================

  function updateMemberName(
    memberId: string,
    name: string
  ) {
    const cleanName =
      name.trim();


    if (!cleanName) {
      return false;
    }


    const exists =
      storedMembers.some(
        (member) =>
          member.id ===
          memberId
      );


    if (!exists) {
      return false;
    }


    /**
     * 只改顯示名稱。
     *
     * member.id 不變，
     * 所以既有 Expense / SettlementPayment
     * 全部仍然指向同一個人。
     */
    setStoredMembers(
      (current) =>
        current.map(
          (member) =>
            member.id ===
            memberId
              ? {
                  ...member,
                  name: cleanName,
                }
              : member
        )
    );


    return true;
  }


  // ========================================
  // ADD EXPENSE
  // ========================================

  function addExpense(
    expense: Expense
  ) {
    setExpenses(
      (current) => [
        ...current,
        expense,
      ]
    );
  }


  // ========================================
  // DELETE EXPENSE
  // ========================================

  function deleteExpense(
    expenseId: string
  ) {
    setExpenses(
      (current) =>
        current.filter(
          (expense) =>
            expense.id !==
            expenseId
        )
    );
  }


  // ========================================
  // ADD SETTLEMENT PAYMENT
  // ========================================

  function addSettlementPayment(
    payment: SettlementPayment
  ) {
    setSettlementPayments(
      (current) => [
        ...current,
        payment,
      ]
    );
  }


  // ========================================
  // DELETE SETTLEMENT PAYMENT
  // ========================================

  function deleteSettlementPayment(
    paymentId: string
  ) {
    setSettlementPayments(
      (current) =>
        current.filter(
          (payment) =>
            payment.id !==
            paymentId
        )
    );
  }


  // ========================================
  // ADD MEMBER
  // ========================================

  function addMember(
    member: ExpenseMember
  ) {
    const cleanName =
      member.name.trim();


    if (!cleanName) {
      return false;
    }


    const exists =
      storedMembers.some(
        (item) =>
          item.id ===
          member.id
      );


    if (exists) {
      return false;
    }


    const cleanMember:
      ExpenseMember = {
      id: member.id,
      name: cleanName,
    };


    setStoredMembers(
      (current) => [
        ...current,
        cleanMember,
      ]
    );


    return true;
  }


  // ========================================
  // DELETE MEMBER
  // ========================================

  function deleteMember(
    memberId: string
  ) {
    const member =
      storedMembers.find(
        (item) =>
          item.id ===
          memberId
      );


    if (!member) {
      return false;
    }


    /**
     * 目前這台裝置的使用者
     * 不允許直接刪除。
     */
    if (
      memberId ===
      currentMemberId
    ) {
      return false;
    }


    const isUsedByExpense =
      expenses.some(
        (expense) =>
          expense.paidBy ===
            memberId ||
          expense.splitBetween.includes(
            memberId
          )
      );


    const isUsedByPayment =
      settlementPayments.some(
        (payment) =>
          payment.from ===
            memberId ||
          payment.to ===
            memberId
      );


    if (
      isUsedByExpense ||
      isUsedByPayment
    ) {
      return false;
    }


    setStoredMembers(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            memberId
        )
    );


    return true;
  }


  // ========================================
  // ADD CATEGORY
  // ========================================

  function addCategory(
    category: ExpenseCategory
  ) {
    setCategories(
      (current) => [
        ...current,
        category,
      ]
    );
  }


  // ========================================
  // DELETE CATEGORY
  // ========================================

  function deleteCategory(
    categoryId: string
  ) {
    const isUsed =
      expenses.some(
        (expense) =>
          expense.categoryId ===
          categoryId
      );


    if (isUsed) {
      return false;
    }


    setCategories(
      (current) =>
        current.filter(
          (category) =>
            category.id !==
            categoryId
        )
    );


    return true;
  }


  // ========================================
  // USAGE COUNT
  // ========================================

  function getMemberUsageCount(
    memberId: string
  ) {
    const expenseCount =
      expenses.filter(
        (expense) =>
          expense.paidBy ===
            memberId ||
          expense.splitBetween.includes(
            memberId
          )
      ).length;


    const paymentCount =
      settlementPayments.filter(
        (payment) =>
          payment.from ===
            memberId ||
          payment.to ===
            memberId
      ).length;


    return (
      expenseCount +
      paymentCount
    );
  }


  function getCategoryUsageCount(
    categoryId: string
  ) {
    return expenses.filter(
      (expense) =>
        expense.categoryId ===
        categoryId
    ).length;
  }


  // ========================================
  // RETURN
  // ========================================

  return {
    loaded,

    expenses,

    members,

    categories,

    settlementPayments,


    // Identity
    currentMemberId,

    currentMember,

    needsIdentitySetup,

    setCurrentMember,

    clearCurrentMember,

    addAndSelectMember,

    updateMemberName,


    // Expense
    addExpense,

    deleteExpense,


    // Settlement
    addSettlementPayment,

    deleteSettlementPayment,


    // Members
    addMember,

    deleteMember,


    // Categories
    addCategory,

    deleteCategory,


    // Usage
    getMemberUsageCount,

    getCategoryUsageCount,
  };
}