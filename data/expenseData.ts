// ========================================
// MEMBER
// ========================================

export type ExpenseMember = {
  id: string;
  name: string;
  isCurrentUser?: boolean;
};


// ========================================
// CATEGORY
// ========================================

export type ExpenseCategory = {
  id: string;
  name: string;
  icon: string;
};


// ========================================
// EXPENSE
// ========================================

export type ExpenseVisibility =
  | "shared"
  | "private";


export type ExpenseCurrency =
  | "JPY"
  | "TWD";


export type Expense = {
  id: string;

  title: string;

  note?: string;

  amount: number;

  currency: ExpenseCurrency;

  categoryId: string;

  // shared = 共同支出
  // private = 私人支出
  visibility: ExpenseVisibility;

  paidBy: string;

  splitBetween: string[];

  date: string;

  time?: string;
};


// ========================================
// SETTLEMENT PAYMENT
// ========================================
//
// 這不是「消費」，而是旅伴之間實際發生的還款。
//
// 例如：
// 重谷原本欠芳誼 ¥8,679
// 重谷途中先還芳誼 ¥3,000
//
// 就新增：
// {
//   from: "chonggu",
//   to: "fangyi",
//   amount: 3000,
//   currency: "JPY"
// }
//
// 之後 Settlement 會用：
// 原始債務 - 已還款
// 算出目前真正還欠多少。
// ========================================

export type SettlementPayment = {
  id: string;

  // 付款的人
  from: string;

  // 收款的人
  to: string;

  amount: number;

  currency: ExpenseCurrency;

  date: string;

  time?: string;

  note?: string;
};


// ========================================
// INITIAL MEMBERS
// ========================================

export const initialExpenseMembers:
  ExpenseMember[] = [

  {
    id: "fangyi",
    name: "芳誼",
    isCurrentUser: true,
  },

  {
    id: "chonggu",
    name: "重谷",
  },

  {
    id: "mom",
    name: "媽媽",
  },

];


// ========================================
// INITIAL CATEGORIES
// ========================================

export const initialExpenseCategories:
  ExpenseCategory[] = [

  {
    id: "food",
    name: "餐飲",
    icon: "🍜",
  },

  {
    id: "transport",
    name: "交通",
    icon: "🚆",
  },

  {
    id: "shopping",
    name: "購物",
    icon: "🛍️",
  },

  {
    id: "ticket",
    name: "門票",
    icon: "🎫",
  },

  {
    id: "hotel",
    name: "住宿",
    icon: "🏨",
  },

];


// ========================================
// INITIAL EXPENSES
// ========================================

export const initialExpenses:
  Expense[] = [

  {
    id: "expense-1",

    title: "午餐",

    note: "祇園周邊",

    amount: 2400,

    currency: "JPY",

    categoryId: "food",

    visibility: "shared",

    paidBy: "fangyi",

    splitBetween: [
      "fangyi",
      "chonggu",
    ],

    date: "2027-03-01",

    time: "13:05",
  },


  {
    id: "expense-2",

    title: "京都市巴士",

    amount: 460,

    currency: "JPY",

    categoryId: "transport",

    visibility: "shared",

    paidBy: "chonggu",

    splitBetween: [
      "fangyi",
      "chonggu",
    ],

    date: "2027-03-01",

    time: "14:20",
  },


  {
    id: "expense-3",

    title: "咖啡",

    note: "% Arabica",

    amount: 1200,

    currency: "JPY",

    categoryId: "food",

    visibility: "shared",

    paidBy: "fangyi",

    splitBetween: [
      "fangyi",
      "chonggu",
    ],

    date: "2027-03-01",

    time: "16:40",
  },


  {
    id: "expense-4",

    title: "晚餐",

    note: "京都車站",

    amount: 6000,

    currency: "JPY",

    categoryId: "food",

    visibility: "shared",

    paidBy: "mom",

    splitBetween: [
      "fangyi",
      "chonggu",
      "mom",
    ],

    date: "2027-03-01",

    time: "19:00",
  },


  // 私人支出範例
  {
    id: "expense-private-1",

    title: "御守",

    note: "清水寺",

    amount: 1500,

    currency: "JPY",

    categoryId: "shopping",

    visibility: "private",

    paidBy: "fangyi",

    splitBetween: [
      "fangyi",
    ],

    date: "2027-03-01",

    time: "15:30",
  },

];


// ========================================
// INITIAL SETTLEMENT PAYMENTS
// ========================================
//
// 預設沒有任何還款。
// 使用者旅途中記錄的還款會存進 LocalStorage。
// ========================================

export const initialSettlementPayments:
  SettlementPayment[] = [];