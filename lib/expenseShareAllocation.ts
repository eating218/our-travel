import type { Expense } from "../data/expenseData";

export type MemberShare = { memberId: string; amount: number };

/**
 * Split whole currency units deterministically. The payer receives the
 * remainder when included; otherwise the first participant receives it.
 * Both JPY and TWD are displayed and settled in whole currency units.
 */
export function allocateExpenseShares(expense: Expense): MemberShare[] {
  const memberIds = Array.from(new Set(expense.splitBetween));
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
