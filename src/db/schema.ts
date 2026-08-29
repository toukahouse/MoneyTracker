import { pgTable, uuid, text, timestamp, decimal, integer, pgEnum, date, boolean, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pocketTypeEnum = pgEnum("pocket_type", ["GENERAL", "SAVINGS", "EMERGENCY_FUND", "WISHLIST"]);

export const pockets = pgTable("pockets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  pocketType: pocketTypeEnum("pocket_type").notNull().default("GENERAL"),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categoryTypeEnum = pgEnum("category_type", ["INCOME", "EXPENSE", "TRANSFER"]);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }), // Nullable for default global categories
  name: text("name").notNull(),
  type: categoryTypeEnum("type").notNull(),
  icon: text("icon"),
  color: text("color"),
});

export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: 'cascade' }),
  monthlyLimit: decimal("monthly_limit", { precision: 12, scale: 2 }).notNull(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
}, (t) => [
  unique().on(t.userId, t.categoryId, t.month, t.year),
]);

export const wishlistPriorityEnum = pgEnum("wishlist_priority", ["LOW", "MEDIUM", "HIGH"]);
export const wishlistStatusEnum = pgEnum("wishlist_status", ["PLANNING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);

export const wishlists = pgTable("wishlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  pocketId: uuid("pocket_id").references(() => pockets.id, { onDelete: 'set null' }), // Link to a savings pocket
  title: text("title").notNull(),
  totalEstimatedCost: decimal("total_estimated_cost", { precision: 12, scale: 2 }).notNull().default("0"),
  allocatedAmount: decimal("allocated_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  targetDate: date("target_date"),
  priority: wishlistPriorityEnum("priority").notNull().default("MEDIUM"),
  status: wishlistStatusEnum("status").notNull().default("PLANNING"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const wishlistItems = pgTable("wishlist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  wishlistId: uuid("wishlist_id").notNull().references(() => wishlists.id, { onDelete: 'cascade' }),
  itemName: text("item_name").notNull(),
  estimatedPrice: decimal("estimated_price", { precision: 12, scale: 2 }).notNull(),
  storeUrl: text("store_url"),
  isPurchased: boolean("is_purchased").default(false).notNull(),
  purchasedAt: timestamp("purchased_at"),
});

export const transactionTypeEnum = pgEnum("transaction_type", ["INCOME", "EXPENSE", "TRANSFER"]);

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: 'set null' }), 
  pocketId: uuid("pocket_id").notNull().references(() => pockets.id, { onDelete: 'cascade' }),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Setup relations
export const usersRelations = relations(users, ({ many }) => ({
  pockets: many(pockets),
  categories: many(categories),
  budgets: many(budgets),
  wishlists: many(wishlists),
  transactions: many(transactions),
}));

export const pocketsRelations = relations(pockets, ({ one, many }) => ({
  user: one(users, {
    fields: [pockets.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  wishlists: many(wishlists),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  pocket: one(pockets, {
    fields: [wishlists.pocketId],
    references: [pockets.id],
  }),
  items: many(wishlistItems),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistItems.wishlistId],
    references: [wishlists.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  pocket: one(pockets, {
    fields: [transactions.pocketId],
    references: [pockets.id],
  }),
}));
