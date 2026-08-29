"use server";

import { db } from "@/db";
import { pockets, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Helper to get demo user id
export async function getDefaultUser() {
  const user = await db.query.users.findFirst({
    where: eq(users.email, "demo@moneytracker.com"),
  });
  if (!user) {
    const [newUser] = await db.insert(users).values({
      email: "demo@moneytracker.com",
      fullName: "Alex Rivera",
    }).returning();
    return newUser;
  }
  return user;
}

export async function getPockets() {
  const user = await getDefaultUser();
  return await db.query.pockets.findMany({
    where: eq(pockets.userId, user.id),
    orderBy: [desc(pockets.createdAt)],
  });
}

export async function createPocket(formData: {
  name: string;
  pocketType: "GENERAL" | "SAVINGS" | "EMERGENCY_FUND" | "WISHLIST";
  balance: number;
  targetAmount?: number;
}) {
  const user = await getDefaultUser();
  
  const [newPocket] = await db.insert(pockets).values({
    userId: user.id,
    name: formData.name,
    pocketType: formData.pocketType,
    balance: formData.balance.toString(),
    targetAmount: formData.targetAmount ? formData.targetAmount.toString() : null,
  }).returning();

  revalidatePath("/pockets");
  revalidatePath("/");
  return newPocket;
}

export async function updatePocket(
  id: string,
  formData: {
    name: string;
    pocketType: "GENERAL" | "SAVINGS" | "EMERGENCY_FUND" | "WISHLIST";
    balance: number;
    targetAmount?: number | null;
  }
) {
  const [updated] = await db
    .update(pockets)
    .set({
      name: formData.name,
      pocketType: formData.pocketType,
      balance: formData.balance.toString(),
      targetAmount: formData.targetAmount ? formData.targetAmount.toString() : null,
      updatedAt: new Date(),
    })
    .where(eq(pockets.id, id))
    .returning();

  revalidatePath("/pockets");
  revalidatePath("/");
  return updated;
}

export async function deletePocket(id: string) {
  await db.delete(pockets).where(eq(pockets.id, id));
  revalidatePath("/pockets");
  revalidatePath("/");
}
