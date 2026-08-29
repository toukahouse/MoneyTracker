"use server";

import { db } from "@/db";
import { pockets, transactions, wishlists, categories } from "@/db/schema";
import { getDefaultUser } from "./pockets";
import { eq, and, sql, desc } from "drizzle-orm";
import { getBudgets } from "./budgets";

export async function getDashboardData(month?: number, year?: number) {
  const user = await getDefaultUser();
  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  // 1. Total Balance across all pockets
  const userPockets = await db.query.pockets.findMany({
    where: eq(pockets.userId, user.id),
  });
  const totalBalance = userPockets.reduce((acc, p) => acc + parseFloat(p.balance), 0);

  // 2. Monthly Income and Expenses
  const monthlyTx = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, user.id),
      sql`EXTRACT(MONTH FROM ${transactions.transactionDate}) = ${targetMonth}`,
      sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${targetYear}`
    ),
  });

  const monthlyIncome = monthlyTx
    .filter((tx) => tx.type === "INCOME")
    .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

  const monthlyExpenses = monthlyTx
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

  const netCashflow = monthlyIncome - monthlyExpenses;

  // 3. Active wishlists count & intelligent prioritization
  const userWishlists = await db.query.wishlists.findMany({
    where: eq(wishlists.userId, user.id),
    orderBy: [desc(wishlists.updatedAt), desc(wishlists.createdAt)],
  });

  const sortedWishlists = [...userWishlists].sort((a, b) => {
    const statusScore = (s: string) => (s === "IN_PROGRESS" ? 3 : s === "PLANNING" ? 2 : 1);
    const scoreDiff = statusScore(b.status) - statusScore(a.status);
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const activeWishlists = sortedWishlists.filter((w) => w.status !== "COMPLETED");
  const primaryWishlist = activeWishlists[0] || sortedWishlists[0] || null;
  const recentWishlists = activeWishlists.slice(0, 2);

  // 4. Daily Chart Data (Days 1 to 31 for the target month)
  const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
  const dailyChanges: { date: string; change: number }[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayTx = monthlyTx.filter((tx) => {
      const txDay = new Date(tx.transactionDate).getDate();
      return txDay === d;
    });

    const dayIncome = dayTx
      .filter((t) => t.type === "INCOME")
      .reduce((a, b) => a + parseFloat(b.amount), 0);
    const dayExpense = dayTx
      .filter((t) => t.type === "EXPENSE")
      .reduce((a, b) => a + parseFloat(b.amount), 0);

    dailyChanges.push({
      date: d.toString(),
      change: dayIncome - dayExpense,
    });
  }

  // 5. Recent 4 Transactions
  const recentTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, user.id),
    with: {
      category: true,
      pocket: true,
    },
    orderBy: [desc(transactions.transactionDate)],
    limit: 4,
  });

  // 6. Spending limits
  const spendingLimits = await getBudgets(targetMonth, targetYear);

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    netCashflow,
    activeWishlistsCount: activeWishlists.length,
    dailyChartData: dailyChanges,
    recentTransactions,
    spendingLimits,
    primaryWishlist,
    recentWishlists,
    currentMonth: targetMonth,
    currentYear: targetYear,
  };
}
