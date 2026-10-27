// ========================================
// MEMBER
// ========================================

export type ExpenseMember = {
  id: string;
  name: string;

  /**
   * 相容舊版程式。
   *
   * 新版不再把 current user 寫死在資料裡，
   * useExpenseData 會依照這台裝置選擇的使用者
   * 動態產生 isCurrentUser。
   */
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
      id: "1",
      name: "文",
    },

    {
      id: "2",
      name: "珠",
    },

    {
      id: "3",
      name: "儒",
    },
    
    {
      id: "4",
      name: "億",
    },
    
    {
      id: "5",
      name: "鈞",
    },
    
    {
      id: "6",
      name: "婕",
    },
    
    {
      id: "7",
      name: "廷",
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

export const initialSettlementPayments:
  SettlementPayment[] = [];