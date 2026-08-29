"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Receipt, Plus, FolderPlus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { AddTransactionDialog } from "@/components/modals/add-transaction-dialog";
import { AddCategoryDialog } from "@/components/modals/add-category-dialog";
import { deleteTransaction } from "@/lib/actions/transactions";
import { useRouter } from "next/navigation";
import { MarqueeText } from "@/components/ui/marquee-text";

type TransactionWithRelations = {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: string;
  transactionDate: Date | string;
  notes: string | null;
  category: { id: string; name: string; color: string | null; icon: string | null } | null;
  pocket: { id: string; name: string };
};

const typeConfig = {
  INCOME:   { label: "Pemasukan",  labelEn: "Income",   icon: ArrowDownLeft,  classes: "text-emerald-500", badgeClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-0" },
  EXPENSE:  { label: "Pengeluaran",labelEn: "Expense",  icon: ArrowUpRight,   classes: "text-foreground",  badgeClass: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-0" },
  TRANSFER: { label: "Transfer",   labelEn: "Transfer", icon: ArrowLeftRight, classes: "text-primary",     badgeClass: "bg-primary/8 text-primary border-0" },
};

export function TransactionsClient({
  initialTransactions,
  pockets,
  categories,
}: {
  initialTransactions: TransactionWithRelations[];
  pockets: { id: string; name: string }[];
  categories: { id: string; name: string; type: string }[];
}) {
  const { t, formatCurrency, language } = useLanguage();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const filteredTransactions = initialTransactions.filter((tx) => {
    const matchesSearch =
      (tx.notes || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.category?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.pocket.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "ALL" || tx.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    if (confirm(language === "id" ? "Hapus transaksi ini?" : "Delete this transaction?")) {
      await deleteTransaction(id);
      router.refresh();
    }
  };

  const typeFilterOptions = [
    { value: "ALL",      label: language === "id" ? "Semua" : "All",             shortLabel: language === "id" ? "Semua" : "All" },
    { value: "EXPENSE",  label: language === "id" ? "Pengeluaran" : "Expense",   shortLabel: language === "id" ? "Keluar" : "Expense" },
    { value: "INCOME",   label: language === "id" ? "Pemasukan" : "Income",      shortLabel: language === "id" ? "Masuk" : "Income" },
    { value: "TRANSFER", label: "Transfer",                                      shortLabel: "Transfer" },
  ];

  // Summary counts
  const totalIncome   = filteredTransactions.filter(t => t.type === "INCOME").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalExpense  = filteredTransactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + parseFloat(t.amount), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-primary/70" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              {language === "id" ? "Riwayat Keuangan" : "Financial History"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.transactions}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t.txDesc}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
          <AddCategoryDialog
            onSuccess={() => router.refresh()}
            triggerClassName="inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl px-3.5 py-2.5 border border-border text-xs sm:text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground active:scale-95 transition-all w-full sm:w-auto"
          />
          <AddTransactionDialog
            pockets={pockets}
            categories={categories}
            triggerClassName="inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl px-3.5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-95 transition-all text-xs sm:text-sm w-full sm:w-auto"
            onSuccess={() => router.refresh()}
          />
        </div>
      </div>

      {/* Quick Summary Strip */}
      {filteredTransactions.length > 0 && (
        <div className="flex gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              +{formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
            <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400 tabular-nums">
              -{formatCurrency(totalExpense)}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-muted border border-border/60">
            <span className="text-xs font-medium text-muted-foreground">
              {filteredTransactions.length} {language === "id" ? "transaksi" : "transactions"}
            </span>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t.history}
              </CardTitle>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder={t.searchTransactions}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 text-xs sm:text-sm w-full rounded-xl"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-1 rounded-md"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Segmented Filter Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-muted/60 rounded-xl w-full sm:w-auto border border-border/40">
                {typeFilterOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedType(opt.value)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${
                      selectedType === opt.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                    }`}
                  >
                    <span className="hidden sm:inline">{opt.label}</span>
                    <span className="sm:hidden">{opt.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:px-6 sm:pb-6 sm:pt-0">
          {filteredTransactions.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="flex flex-col items-center justify-center gap-2 max-w-xs mx-auto">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground font-semibold">
                  {language === "id" ? "Belum ada transaksi" : "No transactions found"}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  {searchTerm
                    ? (language === "id" ? "Coba kata kunci pencarian lain" : "Try a different search query")
                    : (language === "id" ? "Catat transaksi pertamamu sekarang" : "Record your first transaction")}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile View: Clean Card List */}
              <div className="divide-y divide-border/40 sm:hidden">
                {filteredTransactions.map((tx) => {
                  const cfg = typeConfig[tx.type];
                  const TypeIcon = cfg.icon;
                  const formattedDate = new Date(tx.transactionDate).toLocaleDateString(
                    language === "id" ? "id-ID" : "en-US",
                    { day: "numeric", month: "short", year: "numeric" }
                  );
                  const amountNum = parseFloat(tx.amount);

                  return (
                    <div key={tx.id} className="p-4 space-y-2 hover:bg-accent/20 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              tx.type === "INCOME"
                                ? "bg-emerald-50 dark:bg-emerald-950/40"
                                : tx.type === "EXPENSE"
                                ? "bg-red-50 dark:bg-red-950/40"
                                : "bg-primary/8"
                            }`}
                          >
                            <TypeIcon
                              className={`w-4 h-4 ${
                                tx.type === "INCOME"
                                  ? "text-emerald-500"
                                  : tx.type === "EXPENSE"
                                  ? "text-red-500"
                                  : "text-primary"
                              }`}
                            />
                          </div>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <MarqueeText
                              text={tx.notes || (language === "id" ? "Tanpa catatan" : "No description")}
                              className="font-bold text-sm text-foreground"
                            />
                            <p className="text-[11px] text-muted-foreground">{formattedDate}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className={`font-bold text-sm tabular-nums ${cfg.classes}`}>
                            {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                            {formatCurrency(amountNum)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/30 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
                          {tx.category ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0"
                              style={{
                                backgroundColor: `${tx.category.color || "#3b82f6"}18`,
                                color: tx.category.color || "#3b82f6",
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: tx.category.color || "#3b82f6" }}
                              />
                              {tx.category.name}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                          <span className="truncate text-[11px]">· {tx.pocket.name}</span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(tx.id)}
                          className="text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View: Full Data Table */}
              <div className="hidden sm:block overflow-x-auto w-full">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/60">
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{language === "id" ? "Tanggal" : "Date"}</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{language === "id" ? "Deskripsi" : "Description"}</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{language === "id" ? "Kategori" : "Category"}</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{language === "id" ? "Dompet" : "Pocket"}</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">{language === "id" ? "Nominal" : "Amount"}</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => {
                      const cfg = typeConfig[tx.type];
                      const TypeIcon = cfg.icon;
                      const formattedDate = new Date(tx.transactionDate).toLocaleDateString(
                        language === "id" ? "id-ID" : "en-US",
                        { day: "numeric", month: "short", year: "numeric" }
                      );
                      const amountNum = parseFloat(tx.amount);

                      return (
                        <TableRow
                          key={tx.id}
                          className="group hover:bg-accent/30 border-border/40 transition-colors"
                        >
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground py-3.5">
                            {formattedDate}
                          </TableCell>
                          <TableCell className="py-3.5 max-w-[220px]">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                tx.type === "INCOME" ? "bg-emerald-50 dark:bg-emerald-950/40"
                                : tx.type === "EXPENSE" ? "bg-red-50 dark:bg-red-950/40"
                                : "bg-primary/8"
                              }`}>
                                <TypeIcon className={`w-3.5 h-3.5 ${
                                  tx.type === "INCOME" ? "text-emerald-500"
                                  : tx.type === "EXPENSE" ? "text-red-500"
                                  : "text-primary"
                                }`} />
                              </div>
                              <div className="min-w-0 flex-1 overflow-hidden">
                                <MarqueeText
                                  text={tx.notes || (language === "id" ? "Tanpa catatan" : "No description")}
                                  className="font-semibold text-sm"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5">
                            {tx.category ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold" style={{
                                backgroundColor: `${tx.category.color || "#3b82f6"}18`,
                                color: tx.category.color || "#3b82f6",
                              }}>
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tx.category.color || "#3b82f6" }} />
                                {tx.category.name}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap py-3.5 font-medium">
                            {tx.pocket.name}
                          </TableCell>
                          <TableCell className={`text-right font-bold whitespace-nowrap tabular-nums py-3.5 ${cfg.classes}`}>
                            {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                            {formatCurrency(amountNum)}
                          </TableCell>
                          <TableCell className="py-3.5">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(tx.id)}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
