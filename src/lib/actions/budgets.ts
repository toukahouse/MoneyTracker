"use server";

import { db } from "@/db";
import { budgets, transactions } from "@/db/schema";
import { getDefaultUser } from "./pockets";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getBudgets(month?: number, year?: number) {
  const user = await getDefaultUser();
  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  const userBudgets = await db.query.budgets.findMany({
    where: and(
      eq(budgets.userId, user.id),
      eq(budgets.month, targetMonth),
      eq(budgets.year, targetYear)
    ),
    with: {
      category: true,
    },
  });

  // Calculate actual spending for each budget category this month
  const budgetsWithSpending = await Promise.all(
    userBudgets.map(async (b) => {
      const spendingResult = await db
        .select({
          totalSpent: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, user.id),
            eq(transactions.categoryId, b.categoryId),
            eq(transactions.type, "EXPENSE"),
            sql`EXTRACT(MONTH FROM ${transactions.transactionDate}) = ${targetMonth}`,
            sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${targetYear}`
          )
        );

      const spent = parseFloat(spendingResult[0]?.totalSpent || "0");
      const limit = parseFloat(b.monthlyLimit);

      return {
        id: b.id,
        categoryId: b.categoryId,
        category: b.category,
        limit,
        spent,
        over: spent > limit,
        month: b.month,
        year: b.year,
      };
    })
  );

  return budgetsWithSpending;
}

export async function setBudget(data: {
  categoryId: string;
  monthlyLimit: number;
  month?: number;
  year?: number;
}) {
  const user = await getDefaultUser();
  const now = new Date();
  const month = data.month || now.getMonth() + 1;
  const year = data.year || now.getFullYear();

  // Check if exists
  const existing = await db.query.budgets.findFirst({
    where: and(
      eq(budgets.userId, user.id),
      eq(budgets.categoryId, data.categoryId),
      eq(budgets.month, month),
      eq(budgets.year, year)
    ),
  });

  if (existing) {
    await db.update(budgets)
      .set({ monthlyLimit: data.monthlyLimit.toString() })
      .where(eq(budgets.id, existing.id));
  } else {
    await db.insert(budgets).values({
      userId: user.id,
      categoryId: data.categoryId,
      monthlyLimit: data.monthlyLimit.toString(),
      month,
      year,
    });
  }

  revalidatePath("/");
  revalidatePath("/pockets");
}

export async function deleteBudget(id: string) {
  await db.delete(budgets).where(eq(budgets.id, id));
  revalidatePath("/");
  revalidatePath("/pockets");
}
