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
    { value: "ALL",      label: language === "id" ? "Semua" : "All" },
    { value: "EXPENSE",  label: language === "id" ? "Pengeluaran" : "Expense" },
    { value: "INCOME",   label: language === "id" ? "Pemasukan" : "Income" },
    { value: "TRANSFER", label: "Transfer" },
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
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <AddCategoryDialog
            onSuccess={() => router.refresh()}
            triggerClassName="inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl px-3 py-2 border border-border text-xs sm:text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground active:scale-95 transition-all flex-1 sm:flex-initial"
          />
          <AddTransactionDialog
            pockets={pockets}
            categories={categories}
            triggerClassName="inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-95 transition-all text-xs sm:text-sm flex-1 sm:flex-initial"
            onSuccess={() => router.refresh()}
          />
        </div>
      </div>

      {/* Quick Summary Strip */}
      {filteredTransactions.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              +{formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
            <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400 tabular-nums">
              -{formatCurrency(totalExpense)}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted border border-border/60">
            <span className="text-xs font-medium text-muted-foreground">
              {filteredTransactions.length} {language === "id" ? "transaksi" : "transactions"}
            </span>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t.history}
              </CardTitle>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder={t.searchTransactions}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs w-full"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {typeFilterOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedType(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                      selectedType === opt.value
                        ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                        : "bg-muted text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:px-6 sm:pb-6 sm:pt-0">
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[620px] w-full">
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
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                          {language === "id" ? "Belum ada transaksi" : "No transactions found"}
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          {searchTerm
                            ? (language === "id" ? "Coba kata kunci lain" : "Try a different search")
                            : (language === "id" ? "Catat transaksi pertamamu" : "Record your first transaction")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => {
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
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-2.5">
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
                            <span className="font-semibold text-sm truncate max-w-[200px]">
                              {tx.notes || (language === "id" ? "Tanpa catatan" : "No description")}
                            </span>
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
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
