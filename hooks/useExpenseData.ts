"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Expense,
  ExpenseCategory,
  ExpenseMember,
  initialExpenseCategories,
  initialExpenseMembers,
  initialExpenses,
} from "../data/expenseData";


// ========================================
// STORAGE
// ========================================

const STORAGE_KEY =
  "our-travel-expense-data";


// ========================================
// STORAGE TYPE
// ========================================

type ExpenseStorageData = {
  expenses: Expense[];
  members: ExpenseMember[];
  categories: ExpenseCategory[];
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
    })
  );

}


// ========================================
// HOOK
// ========================================

export function useExpenseData() {

  const [
    expenses,
    setExpenses,
  ] = useState<Expense[]>(
    initialExpenses
  );


  const [
    members,
    setMembers,
  ] = useState<ExpenseMember[]>(
    initialExpenseMembers
  );


  const [
    categories,
    setCategories,
  ] = useState<ExpenseCategory[]>(
    initialExpenseCategories
  );


  const [
    loaded,
    setLoaded,
  ] = useState(false);


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

          setMembers(
            data.members
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
  // SAVE
  // ========================================

  useEffect(() => {

    if (!loaded) {
      return;
    }


    const data:
      ExpenseStorageData = {

      expenses,

      members,

      categories,

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
    members,
    categories,
  ]);


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
  // ADD MEMBER
  // ========================================

  function addMember(
    member: ExpenseMember
  ) {

    setMembers(
      (current) => [
        ...current,
        member,
      ]
    );

  }


  // ========================================
  // DELETE MEMBER
  // ========================================

  function deleteMember(
    memberId: string
  ) {

    // current user 不允許刪除

    const member =
      members.find(
        (item) =>
          item.id === memberId
      );


    if (
      !member ||
      member.isCurrentUser
    ) {
      return false;
    }


    // 有任何歷史支出使用這個人
    // 就不允許刪除

    const isUsed =
      expenses.some(
        (expense) =>
          expense.paidBy ===
            memberId ||
          expense.splitBetween.includes(
            memberId
          )
      );


    if (isUsed) {
      return false;
    }


    setMembers(
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

    return expenses.filter(
      (expense) =>
        expense.paidBy ===
          memberId ||
        expense.splitBetween.includes(
          memberId
        )
    ).length;

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

    addExpense,

    deleteExpense,

    addMember,

    deleteMember,

    addCategory,

    deleteCategory,

    getMemberUsageCount,

    getCategoryUsageCount,

  };

}