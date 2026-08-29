import { db } from "./index";
import { categories, users } from "./schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

async function seedCategories() {
  console.log("🇮🇩 Menambahkan kategori Bahasa Indonesia ke PostgreSQL VPS...");

  const user = await db.query.users.findFirst({
    where: eq(users.email, "demo@moneytracker.com"),
  });

  if (!user) {
    console.error("User demo tidak ditemukan.");
    process.exit(1);
  }

  const indonesianCategories = [
    // PENGELUARAN (EXPENSE)
    { name: "Makanan & Minuman", type: "EXPENSE" as const, color: "#f97316", icon: "Utensils" },
    { name: "Kopi & Nongkrong", type: "EXPENSE" as const, color: "#78350f", icon: "Coffee" },
    { name: "Belanja Kebutuhan Pokok", type: "EXPENSE" as const, color: "#06b6d4", icon: "ShoppingCart" },
    { name: "Transportasi & Bensin", type: "EXPENSE" as const, color: "#3b82f6", icon: "Car" },
    { name: "Tagihan, Listrik & Air", type: "EXPENSE" as const, color: "#eab308", icon: "Zap" },
    { name: "Pulsa & Paket Internet", type: "EXPENSE" as const, color: "#8b5cf6", icon: "Wifi" },
    { name: "Belanja & Pakaian", type: "EXPENSE" as const, color: "#ec4899", icon: "ShoppingBag" },
    { name: "Hiburan & Langganan", type: "EXPENSE" as const, color: "#a855f7", icon: "Film" },
    { name: "Kesehatan & Obat", type: "EXPENSE" as const, color: "#ef4444", icon: "HeartPulse" },
    { name: "Pendidikan & Kursus", type: "EXPENSE" as const, color: "#10b981", icon: "GraduationCap" },
    { name: "Sewa / Cicilan Rumah", type: "EXPENSE" as const, color: "#64748b", icon: "Home" },
    { name: "Hadiah, Zakat & Donasi", type: "EXPENSE" as const, color: "#f43f5e", icon: "Gift" },
    { name: "Cicilan & Pinjaman", type: "EXPENSE" as const, color: "#dc2626", icon: "CreditCard" },
    { name: "Perbaikan & Servis", type: "EXPENSE" as const, color: "#475569", icon: "Wrench" },
    { name: "Perawatan Diri & Skincare", type: "EXPENSE" as const, color: "#d946ef", icon: "Sparkles" },
    { name: "Olahraga & Gym", type: "EXPENSE" as const, color: "#14b8a6", icon: "Dumbbell" },
    { name: "Hewan Peliharaan", type: "EXPENSE" as const, color: "#d97706", icon: "Dog" },
    { name: "Pengeluaran Lain-lain", type: "EXPENSE" as const, color: "#94a3b8", icon: "MoreHorizontal" },

    // PEMASUKAN (INCOME)
    { name: "Gaji Pokok", type: "INCOME" as const, color: "#10b981", icon: "Banknote" },
    { name: "Bonus & THR", type: "INCOME" as const, color: "#14b8a6", icon: "Gift" },
    { name: "Freelance & Side Job", type: "INCOME" as const, color: "#059669", icon: "Laptop" },
    { name: "Bisnis & Penjualan", type: "INCOME" as const, color: "#0284c7", icon: "Store" },
    { name: "Investasi & Dividen", type: "INCOME" as const, color: "#6366f1", icon: "TrendingUp" },
    { name: "Transfer Masuk", type: "INCOME" as const, color: "#8b5cf6", icon: "ArrowDownLeft" },
    { name: "Cashback & Refund", type: "INCOME" as const, color: "#22c55e", icon: "RotateCcw" },
    { name: "Pemasukan Lain-lain", type: "INCOME" as const, color: "#84cc16", icon: "PlusCircle" },

    // TRANSFER
    { name: "Transfer Antar Dompet / Bank", type: "TRANSFER" as const, color: "#64748b", icon: "ArrowRightLeft" },
    { name: "Tarik Tunai", type: "TRANSFER" as const, color: "#475569", icon: "Coins" },
    { name: "Top Up E-Wallet", type: "TRANSFER" as const, color: "#0ea5e9", icon: "Smartphone" },
  ];

  for (const cat of indonesianCategories) {
    const existing = await db.query.categories.findFirst({
      where: (tbl, { and, eq }) => and(
        eq(tbl.userId, user.id),
        eq(tbl.name, cat.name)
      ),
    });

    if (!existing) {
      await db.insert(categories).values({
        userId: user.id,
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
      });
      console.log(`+ Ditambahkan: [${cat.type}] ${cat.name}`);
    }
  }

  console.log("✅ Semua kategori Bahasa Indonesia berhasil ditambahkan!");
  process.exit(0);
}

seedCategories().catch((err) => {
  console.error("Gagal menambahkan kategori:", err);
  process.exit(1);
});
