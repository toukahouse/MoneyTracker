"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { getDefaultUser } from "./pockets";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  const user = await getDefaultUser();
  return await db.query.categories.findMany({
    where: eq(categories.userId, user.id),
  });
}

export async function createCategory(data: {
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  color?: string;
  icon?: string;
}) {
  const user = await getDefaultUser();

  const [newCat] = await db.insert(categories).values({
    userId: user.id,
    name: data.name,
    type: data.type,
    color: data.color || "#3b82f6",
    icon: data.icon || "Tag",
  }).returning();

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/pockets");
  return newCat;
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/pockets");
}
