import type {
  ExchangeRateSnapshot,
} from "../lib/currencyEngine";

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

export type ExpensePaymentMethod =
  | "cash"
  | "card"
  | "other";

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

  /**
   * 付款方式只描述「這筆錢怎麼付」。
   * 不影響 visibility / paidBy / splitBetween / Settlement。
   */
  paymentMethod?: ExpensePaymentMethod;

  /**
   * 只有 paymentMethod === "card" 時使用。
   * 指向目前使用者自己的 MyTravelCard.id。
   */
  paymentCardId?: string;

  /**
   * JPY 信用卡消費儲存當下 JPY → TWD 參考匯率快照。
   * 之後即時匯率改變，也不回頭改歷史信用卡額度。
   */
  exchangeRateSnapshot?: ExchangeRateSnapshot;

  date: string;
  time?: string;
};

// ========================================
// SETTLEMENT PAYMENT
// ========================================

export type SettlementPayment = {
  id: string;
  from: string;
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
    { id: "1", name: "文" },
    { id: "2", name: "珠" },
    { id: "3", name: "儒" },
    { id: "4", name: "億" },
    { id: "5", name: "鈞" },
    { id: "6", name: "婕" },
    { id: "7", name: "廷" },
  ];

// ========================================
// INITIAL CATEGORIES
// ========================================

export const initialExpenseCategories:
  ExpenseCategory[] = [
    { id: "food", name: "餐飲", icon: "🍜" },
    { id: "transport", name: "交通", icon: "🚆" },
    { id: "shopping", name: "購物", icon: "🛍️" },
    { id: "ticket", name: "門票", icon: "🎫" },
    { id: "hotel", name: "住宿", icon: "🏨" },
  ];

// ========================================
// INITIAL EXPENSES
// ========================================

export const initialExpenses:
  Expense[] = [];

// ========================================
// INITIAL SETTLEMENT PAYMENTS
// ========================================

export const initialSettlementPayments:
  SettlementPayment[] = [];
