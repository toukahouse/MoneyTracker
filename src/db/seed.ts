import { db } from "./index";
import { users, pockets, categories, budgets, transactions, wishlists, wishlistItems } from "./schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

async function seed() {
  console.log("🌱 Seeding database on VPS PostgreSQL...");

  // 1. Create Default User
  let user = await db.query.users.findFirst({
    where: eq(users.email, "demo@moneytracker.com"),
  });

  if (!user) {
    const [newUser] = await db.insert(users).values({
      email: "demo@moneytracker.com",
      fullName: "Alex Rivera",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    }).returning();
    user = newUser;
    console.log("✅ User created:", user.fullName);
  } else {
    console.log("ℹ️ User already exists:", user.fullName);
  }

  // 2. Create Default Categories
  const defaultCategories = [
    { name: "Food & Dining", type: "EXPENSE" as const, color: "#f97316", icon: "Utensils" },
    { name: "Transportation", type: "EXPENSE" as const, color: "#3b82f6", icon: "Car" },
    { name: "Entertainment", type: "EXPENSE" as const, color: "#a855f7", icon: "Film" },
    { name: "Shopping", type: "EXPENSE" as const, color: "#ec4899", icon: "ShoppingBag" },
    { name: "Bills & Utilities", type: "EXPENSE" as const, color: "#14b8a6", icon: "Receipt" },
    { name: "Salary", type: "INCOME" as const, color: "#10b981", icon: "Banknote" },
    { name: "Investment", type: "INCOME" as const, color: "#6366f1", icon: "TrendingUp" },
    { name: "Transfer", type: "TRANSFER" as const, color: "#64748b", icon: "ArrowRightLeft" },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of defaultCategories) {
    let existing = await db.query.categories.findFirst({
      where: eq(categories.name, cat.name),
    });

    if (!existing) {
      const [inserted] = await db.insert(categories).values({
        userId: user.id,
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
      }).returning();
      categoryMap[cat.name] = inserted.id;
    } else {
      categoryMap[cat.name] = existing.id;
    }
  }
  console.log("✅ Default categories prepared.");

  // 3. Create Default Pockets
  const defaultPockets = [
    { name: "Main Account", pocketType: "GENERAL" as const, balance: "4250.00", targetAmount: null },
    { name: "Emergency Fund", pocketType: "EMERGENCY_FUND" as const, balance: "10000.00", targetAmount: "15000.00" },
    { name: "Vacation Savings", pocketType: "SAVINGS" as const, balance: "3500.00", targetAmount: "5000.00" },
  ];

  const pocketMap: Record<string, string> = {};

  for (const p of defaultPockets) {
    let existing = await db.query.pockets.findFirst({
      where: eq(pockets.name, p.name),
    });

    if (!existing) {
      const [inserted] = await db.insert(pockets).values({
        userId: user.id,
        name: p.name,
        pocketType: p.pocketType,
        balance: p.balance,
        targetAmount: p.targetAmount,
      }).returning();
      pocketMap[p.name] = inserted.id;
    } else {
      pocketMap[p.name] = existing.id;
    }
  }
  console.log("✅ Default pockets prepared.");

  // 4. Create Default Budgets (Current Month & Year)
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const defaultBudgets = [
    { categoryName: "Food & Dining", limit: "500.00" },
    { categoryName: "Transportation", limit: "200.00" },
    { categoryName: "Entertainment", limit: "150.00" },
    { categoryName: "Bills & Utilities", limit: "300.00" },
  ];

  for (const b of defaultBudgets) {
    const catId = categoryMap[b.categoryName];
    if (catId) {
      const existing = await db.query.budgets.findFirst({
        where: (tbl, { and, eq }) => and(
          eq(tbl.userId, user!.id),
          eq(tbl.categoryId, catId),
          eq(tbl.month, currentMonth),
          eq(tbl.year, currentYear)
        ),
      });

      if (!existing) {
        await db.insert(budgets).values({
          userId: user.id,
          categoryId: catId,
          monthlyLimit: b.limit,
          month: currentMonth,
          year: currentYear,
        });
      }
    }
  }
  console.log("✅ Default budgets prepared.");

  // 5. Create Default Transactions (if none exist)
  const existingTx = await db.query.transactions.findFirst({
    where: eq(transactions.userId, user.id),
  });

  if (!existingTx && pocketMap["Main Account"]) {
    const mainPocketId = pocketMap["Main Account"];
    await db.insert(transactions).values([
      {
        userId: user.id,
        pocketId: mainPocketId,
        categoryId: categoryMap["Food & Dining"],
        type: "EXPENSE",
        amount: "120.50",
        transactionDate: new Date(),
        notes: "Weekly grocery shopping",
      },
      {
        userId: user.id,
        pocketId: mainPocketId,
        categoryId: categoryMap["Salary"],
        type: "INCOME",
        amount: "3500.00",
        transactionDate: new Date(Date.now() - 86400000 * 2),
        notes: "Monthly salary",
      },
      {
        userId: user.id,
        pocketId: mainPocketId,
        categoryId: categoryMap["Entertainment"],
        type: "EXPENSE",
        amount: "15.99",
        transactionDate: new Date(Date.now() - 86400000 * 4),
        notes: "Netflix subscription",
      },
      {
        userId: user.id,
        pocketId: mainPocketId,
        categoryId: categoryMap["Transfer"],
        type: "TRANSFER",
        amount: "500.00",
        transactionDate: new Date(Date.now() - 86400000 * 6),
        notes: "Transferred to Savings",
      },
    ]);
    console.log("✅ Initial transactions created.");
  }

  // 6. Create Default Wishlists
  const existingWishlist = await db.query.wishlists.findFirst({
    where: eq(wishlists.userId, user.id),
  });

  if (!existingWishlist) {
    const [wl1] = await db.insert(wishlists).values({
      userId: user.id,
      pocketId: pocketMap["Vacation Savings"],
      title: "New Gaming PC",
      totalEstimatedCost: "2000.00",
      allocatedAmount: "1200.00",
      priority: "HIGH",
      status: "IN_PROGRESS",
      targetDate: "2024-12-25",
    }).returning();

    await db.insert(wishlistItems).values([
      { wishlistId: wl1.id, itemName: "CPU & Motherboard", estimatedPrice: "600.00", isPurchased: true },
      { wishlistId: wl1.id, itemName: "GPU RTX 4070", estimatedPrice: "800.00", isPurchased: false },
      { wishlistId: wl1.id, itemName: "32GB RAM & 1TB NVMe", estimatedPrice: "300.00", isPurchased: false },
      { wishlistId: wl1.id, itemName: "Case & 750W PSU", estimatedPrice: "300.00", isPurchased: true },
    ]);

    const [wl2] = await db.insert(wishlists).values({
      userId: user.id,
      title: "Japan Trip 2025",
      totalEstimatedCost: "5000.00",
      allocatedAmount: "1500.00",
      priority: "MEDIUM",
      status: "PLANNING",
      targetDate: "2025-04-10",
    }).returning();

    await db.insert(wishlistItems).values([
      { wishlistId: wl2.id, itemName: "Flight Tickets (Return)", estimatedPrice: "1500.00", isPurchased: true },
      { wishlistId: wl2.id, itemName: "Hotels in Tokyo & Osaka", estimatedPrice: "2000.00", isPurchased: false },
      { wishlistId: wl2.id, itemName: "7-Day JR Pass", estimatedPrice: "500.00", isPurchased: false },
      { wishlistId: wl2.id, itemName: "Food & Souvenirs", estimatedPrice: "1000.00", isPurchased: false },
    ]);
    console.log("✅ Initial wishlists & items created.");
  }

  console.log("✨ Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
