"use server";

import { db } from "@/db";
import { wishlists, wishlistItems, pockets, transactions } from "@/db/schema";
import { getDefaultUser } from "./pockets";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getWishlists() {
  const user = await getDefaultUser();
  return await db.query.wishlists.findMany({
    where: eq(wishlists.userId, user.id),
    with: {
      items: true,
      pocket: true,
    },
    orderBy: [desc(wishlists.createdAt)],
  });
}

export async function createWishlist(data: {
  title: string;
  totalEstimatedCost: number;
  pocketId?: string;
  targetDate?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  items?: { itemName: string; estimatedPrice: number }[];
}) {
  const user = await getDefaultUser();

  const [newWl] = await db.insert(wishlists).values({
    userId: user.id,
    title: data.title,
    totalEstimatedCost: data.totalEstimatedCost.toString(),
    pocketId: data.pocketId || null,
    targetDate: data.targetDate || null,
    priority: data.priority || "MEDIUM",
    status: "PLANNING",
  }).returning();

  if (data.items && data.items.length > 0) {
    await db.insert(wishlistItems).values(
      data.items.map((item) => ({
        wishlistId: newWl.id,
        itemName: item.itemName,
        estimatedPrice: item.estimatedPrice.toString(),
        isPurchased: false,
      }))
    );
  }

  revalidatePath("/wishlists");
  revalidatePath("/");
  return newWl;
}

export async function addWishlistItem(wishlistId: string, item: {
  itemName: string;
  estimatedPrice: number;
  storeUrl?: string;
}) {
  const [newItem] = await db.insert(wishlistItems).values({
    wishlistId,
    itemName: item.itemName,
    estimatedPrice: item.estimatedPrice.toString(),
    storeUrl: item.storeUrl || null,
  }).returning();

  // Recalculate total estimated cost
  const allItems = await db.query.wishlistItems.findMany({
    where: eq(wishlistItems.wishlistId, wishlistId),
  });
  const newTotal = allItems.reduce((acc, i) => acc + parseFloat(i.estimatedPrice), 0);

  await db.update(wishlists)
    .set({ totalEstimatedCost: newTotal.toFixed(2) })
    .where(eq(wishlists.id, wishlistId));

  revalidatePath("/wishlists");
  return newItem;
}

export async function toggleWishlistItem(itemId: string, wishlistId: string) {
  const item = await db.query.wishlistItems.findFirst({
    where: eq(wishlistItems.id, itemId),
  });

  if (item) {
    await db.update(wishlistItems)
      .set({
        isPurchased: !item.isPurchased,
        purchasedAt: !item.isPurchased ? new Date() : null,
      })
      .where(eq(wishlistItems.id, itemId));

    revalidatePath("/wishlists");
  }
}

export async function allocateFunds(wishlistId: string, pocketId: string, amount: number) {
  const user = await getDefaultUser();

  const wl = await db.query.wishlists.findFirst({
    where: eq(wishlists.id, wishlistId),
  });
  const sourcePocket = await db.query.pockets.findFirst({
    where: eq(pockets.id, pocketId),
  });

  if (!wl || !sourcePocket) return;

  const currentAllocated = parseFloat(wl.allocatedAmount);
  const newAllocated = currentAllocated + amount;
  const currentPocketBalance = parseFloat(sourcePocket.balance);

  if (currentPocketBalance < amount) {
    throw new Error("Insufficient pocket balance");
  }

  // Deduct from pocket
  await db.update(pockets)
    .set({ balance: (currentPocketBalance - amount).toFixed(2) })
    .where(eq(pockets.id, pocketId));

  // Update wishlist allocated amount
  await db.update(wishlists)
    .set({
      allocatedAmount: newAllocated.toFixed(2),
      status: newAllocated >= parseFloat(wl.totalEstimatedCost) ? "COMPLETED" : "IN_PROGRESS",
    })
    .where(eq(wishlists.id, wishlistId));

  revalidatePath("/wishlists");
  revalidatePath("/pockets");
  revalidatePath("/");
}

export async function deleteWishlist(id: string) {
  await db.delete(wishlists).where(eq(wishlists.id, id));
  revalidatePath("/wishlists");
  revalidatePath("/");
}
