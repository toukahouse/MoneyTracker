"use server";

import { db } from "@/db";
import { transactions, pockets } from "@/db/schema";
import { getDefaultUser } from "./pockets";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTransactions() {
  const user = await getDefaultUser();
  return await db.query.transactions.findMany({
    where: eq(transactions.userId, user.id),
    with: {
      category: true,
      pocket: true,
    },
    orderBy: [desc(transactions.transactionDate)],
  });
}

export async function createTransaction(data: {
  pocketId: string;
  categoryId?: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  transactionDate?: Date;
  notes?: string;
}) {
  const user = await getDefaultUser();

  // 1. Insert transaction
  const [newTx] = await db.insert(transactions).values({
    userId: user.id,
    pocketId: data.pocketId,
    categoryId: data.categoryId || null,
    type: data.type,
    amount: data.amount.toString(),
    transactionDate: data.transactionDate || new Date(),
    notes: data.notes || null,
  }).returning();

  // 2. Adjust Pocket balance
  const targetPocket = await db.query.pockets.findFirst({
    where: eq(pockets.id, data.pocketId),
  });

  if (targetPocket) {
    const currentBalance = parseFloat(targetPocket.balance);
    const newBalance = data.type === "INCOME"
      ? currentBalance + data.amount
      : currentBalance - data.amount;

    await db.update(pockets)
      .set({ balance: newBalance.toFixed(2) })
      .where(eq(pockets.id, data.pocketId));
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/pockets");
  return newTx;
}

export async function deleteTransaction(id: string) {
  const tx = await db.query.transactions.findFirst({
    where: eq(transactions.id, id),
  });

  if (tx) {
    // Revert pocket balance
    const targetPocket = await db.query.pockets.findFirst({
      where: eq(pockets.id, tx.pocketId),
    });

    if (targetPocket) {
      const currentBalance = parseFloat(targetPocket.balance);
      const amount = parseFloat(tx.amount);
      const newBalance = tx.type === "INCOME"
        ? currentBalance - amount
        : currentBalance + amount;

      await db.update(pockets)
        .set({ balance: newBalance.toFixed(2) })
        .where(eq(pockets.id, tx.pocketId));
    }

    await db.delete(transactions).where(eq(transactions.id, id));
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/pockets");
}
