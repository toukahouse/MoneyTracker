"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Wallet, ShieldAlert, Trash2, PiggyBank, BarChart3 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { AddPocketDialog } from "@/components/modals/add-pocket-dialog";
import { EditPocketDialog } from "@/components/modals/edit-pocket-dialog";
import { SetBudgetDialog } from "@/components/modals/set-budget-dialog";
import { EditBudgetDialog } from "@/components/modals/edit-budget-dialog";
import { deletePocket } from "@/lib/actions/pockets";
import { deleteBudget } from "@/lib/actions/budgets";
import { useRouter } from "next/navigation";
import { MarqueeText } from "@/components/ui/marquee-text";

type Pocket = {
  id: string;
  name: string;
  pocketType: string;
  balance: string;
  targetAmount: string | null;
};

type BudgetSpending = {
  id: string;
  categoryId: string;
  category: { id: string; name: string; color: string | null };
  limit: number;
  spent: number;
  over: boolean;
  month: number;
  year: number;
};

const pocketTypeLabel: Record<string, { id: string; en: string }> = {
  CHECKING:   { id: "Rekening", en: "Checking" },
  SAVINGS:    { id: "Tabungan", en: "Savings" },
  CASH:       { id: "Tunai",    en: "Cash" },
  INVESTMENT: { id: "Investasi",en: "Investment" },
  OTHER:      { id: "Lainnya",  en: "Other" },
};

export function PocketsClient({
  initialPockets,
  initialBudgets,
  categories,
}: {
  initialPockets: Pocket[];
  initialBudgets: BudgetSpending[];
  categories: { id: string; name: string }[];
}) {
  const { t, formatCurrency, language } = useLanguage();
  const router = useRouter();

  const handleDeletePocket = async (id: string, name: string) => {
    if (confirm(language === "id" ? `Hapus dompet "${name}"?` : `Delete pocket "${name}"?`)) {
      await deletePocket(id);
      router.refresh();
    }
  };

  const handleDeleteBudget = async (id: string, categoryName: string) => {
    if (confirm(language === "id" ? `Hapus limit budget untuk "${categoryName}"?` : `Delete budget limit for "${categoryName}"?`)) {
      await deleteBudget(id);
      router.refresh();
    }
  };

  const totalBalance = initialPockets.reduce((s, p) => s + parseFloat(p.balance), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-primary/70" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              {language === "id" ? "Dompet & Budget" : "Pockets & Budget"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.budgets}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t.pocketsDesc}</p>
        </div>
        {/* Total balance summary */}
        <div className="px-5 py-3 rounded-2xl bg-primary/8 border border-primary/12 text-right">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">
            {language === "id" ? "Total Saldo" : "Total Balance"}
          </p>
          <p className="text-xl font-bold text-primary tabular-nums">{formatCurrency(totalBalance)}</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Pockets Section */}
        <Card>
          <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-4 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <PiggyBank className="w-4 h-4 text-primary/70" />
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t.myPockets}</CardTitle>
              </div>
              <CardDescription>
                {language === "id" ? "Rekening & kantong tabunganmu" : "Your accounts and savings"}
              </CardDescription>
            </div>
            <AddPocketDialog onSuccess={() => router.refresh()} />
          </CardHeader>
          <CardContent className="space-y-3">
            {initialPockets.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "id" ? "Belum ada dompet" : "No pockets yet"}
                </p>
              </div>
            ) : (
              initialPockets.map((pocket) => {
                const balNum = parseFloat(pocket.balance);
                const targetNum = pocket.targetAmount ? parseFloat(pocket.targetAmount) : null;
                const progress = targetNum ? Math.min(Math.round((balNum / targetNum) * 100), 100) : null;
                const typeLabel = pocketTypeLabel[pocket.pocketType];

                return (
                  <div
                    key={pocket.id}
                    className="p-4 border border-border/60 rounded-2xl bg-background hover:bg-accent/20 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 pr-2 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Wallet className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <MarqueeText text={pocket.name} className="font-semibold text-sm" />
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground mt-0.5">
                            {typeLabel ? (language === "id" ? typeLabel.id : typeLabel.en) : pocket.pocketType}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <p className="font-bold text-base tracking-tight tabular-nums mr-1">
                          {formatCurrency(balNum)}
                        </p>
                        <EditPocketDialog pocket={pocket} onSuccess={() => router.refresh()} />
                        {initialPockets.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeletePocket(pocket.id, pocket.name)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {targetNum && progress !== null && (
                      <div className="mt-3 space-y-1.5 pt-3 border-t border-border/60">
                        <div className="flex justify-between text-xs text-muted-foreground font-medium">
                          <span>{t.progress} — {progress}%</span>
                          <span className="tabular-nums">{language === "id" ? "Target" : "Goal"}: {formatCurrency(targetNum)}</span>
                        </div>
                        <Progress value={progress} className="h-1.5" indicatorColor="bg-primary" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Budgets Section */}
        <Card>
          <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-4 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-primary/70" />
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t.monthlyBudgets}</CardTitle>
              </div>
              <CardDescription>
                {language === "id" ? "Batas pengeluaran per kategori bulan ini" : "Spending limits for this month"}
              </CardDescription>
            </div>
            <SetBudgetDialog categories={categories} onSuccess={() => router.refresh()} />
          </CardHeader>
          <CardContent className="space-y-3">
            {initialBudgets.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "id" ? "Belum ada limit budget" : "No budget limits set"}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {language === "id" ? "Klik + untuk menambah" : "Click + to add one"}
                </p>
              </div>
            ) : (
              initialBudgets.map((b) => {
                const percent = Math.min(Math.round((b.spent / b.limit) * 100), 100);
                const isOver = b.over;
                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-2xl border transition-colors group ${
                      isOver
                        ? "bg-red-50/50 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/50"
                        : "bg-background border-border/60 hover:bg-accent/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold flex items-center gap-2 min-w-0 flex-1 pr-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: b.category?.color || "#3b82f6" }}
                        />
                        <MarqueeText text={b.category?.name || "Kategori"} className="text-sm font-semibold" />
                        {isOver && (
                          <span className="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded-md shrink-0">
                            {language === "id" ? "Melebihi!" : "Over!"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`font-bold text-xs tabular-nums ${isOver ? "text-red-500" : "text-muted-foreground"}`}>
                          {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
                        </span>
                        <EditBudgetDialog
                          budgetId={b.id}
                          categoryId={b.categoryId}
                          categoryName={b.category?.name || "Kategori"}
                          currentLimit={b.limit}
                          month={b.month}
                          year={b.year}
                          onSuccess={() => router.refresh()}
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteBudget(b.id, b.category?.name || "Kategori")}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Progress
                      value={percent}
                      className="h-1.5 bg-muted"
                      indicatorColor={isOver ? "bg-red-500" : "bg-primary"}
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[10px] text-muted-foreground">{percent}% {language === "id" ? "digunakan" : "used"}</p>
                      {isOver && (
                        <p className="text-[10px] text-red-500 flex items-center gap-1 font-semibold">
                          <ShieldAlert className="h-3 w-3" />
                          {language === "id" ? `Lebih ${formatCurrency(b.spent - b.limit)}` : `+${formatCurrency(b.spent - b.limit)} over`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
