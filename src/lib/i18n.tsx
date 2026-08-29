"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "id";

type Dictionary = {
  dashboard: string;
  transactions: string;
  budgets: string;
  wishlists: string;
  totalBalance: string;
  netCashflow: string;
  monthlyExpenses: string;
  activeWishlists: string;
  cashflowChart: string;
  spendingLimit: string;
  recentTransactions: string;
  wishlistProgress: string;
  history: string;
  addTransaction: string;
  searchTransactions: string;
  myPockets: string;
  monthlyBudgets: string;
  newPocket: string;
  setLimit: string;
  createWishlist: string;
  allocateFunds: string;
  progress: string;
  itemsBreakdown: string;
  fromLastMonth: string;
  goalReachingSoon: string;
  overviewDesc: string;
  txDesc: string;
  pocketsDesc: string;
  wishlistsDesc: string;
};

const dictionaries: Record<Language, Dictionary> = {
  en: {
    dashboard: "Dashboard",
    transactions: "Transactions",
    budgets: "Budgets",
    wishlists: "Wishlists",
    totalBalance: "Total Balance",
    netCashflow: "Net Cashflow",
    monthlyExpenses: "Monthly Expenses",
    activeWishlists: "Active Wishlists",
    cashflowChart: "Cashflow (Last 6 Months)",
    spendingLimit: "Spending Limit Watch",
    recentTransactions: "Recent Transactions",
    wishlistProgress: "Wishlist Progress",
    history: "History",
    addTransaction: "Add Transaction",
    searchTransactions: "Search transactions...",
    myPockets: "My Pockets",
    monthlyBudgets: "Monthly Budgets",
    newPocket: "New Pocket",
    setLimit: "Set Limit",
    createWishlist: "Create Wishlist",
    allocateFunds: "Allocate Funds",
    progress: "Progress",
    itemsBreakdown: "Items Breakdown",
    fromLastMonth: "from last month",
    goalReachingSoon: "goal reaching target soon!",
    overviewDesc: "Welcome back! Here's what's happening with your finances today.",
    txDesc: "Manage and track all your income and expenses.",
    pocketsDesc: "Manage your accounts and monthly spending limits.",
    wishlistsDesc: "Plan, allocate, and simulate your financial goals.",
  },
  id: {
    dashboard: "Dashboard",
    transactions: "Transaksi",
    budgets: "Dompet & Budget",
    wishlists: "Wishlist",
    totalBalance: "Total Saldo",
    netCashflow: "Sisa Uang",
    monthlyExpenses: "Pengeluaran Bulan Ini",
    activeWishlists: "Wishlist Aktif",
    cashflowChart: "Cashflow (6 Bulan Terakhir)",
    spendingLimit: "Limit Pengeluaran",
    recentTransactions: "Transaksi Terakhir",
    wishlistProgress: "Progres Wishlist",
    history: "Riwayat Transaksi",
    addTransaction: "Tambah Transaksi",
    searchTransactions: "Cari transaksi...",
    myPockets: "Dompet Saya",
    monthlyBudgets: "Budget Bulanan",
    newPocket: "Dompet Baru",
    setLimit: "Atur Limit",
    createWishlist: "Bikin Wishlist",
    allocateFunds: "Isi Dana",
    progress: "Progres",
    itemsBreakdown: "Detail Barang",
    fromLastMonth: "dibanding bulan lalu",
    goalReachingSoon: "dikit lagi kekumpul!",
    overviewDesc: "Halo! Ini ringkasan uangmu hari ini.",
    txDesc: "Catat dan pantau semua pemasukan serta pengeluaranmu.",
    pocketsDesc: "Atur saldo akun dan limit pengeluaran bulananmu.",
    wishlistsDesc: "Rencanakan dan kumpulkan uang untuk barang impianmu.",
  }
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Dictionary;
  formatCurrency: (amount: number) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("id");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedLang = localStorage.getItem("app_lang") as Language;
    if (storedLang && (storedLang === "en" || storedLang === "id")) {
      setLanguage(storedLang);
    }
    setIsMounted(true);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("app_lang", lang);
  };

  const formatCurrency = (amount: number) => {
    const validAmount = isNaN(amount) ? 0 : amount;
    if (language === 'id') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(validAmount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(validAmount);
  };

  if (!isMounted) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: dictionaries[language], formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
