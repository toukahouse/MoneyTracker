"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { setBudget } from "@/lib/actions/budgets";
import { useLanguage } from "@/lib/i18n";

export function SetBudgetDialog({
  categories,
  onSuccess,
}: {
  categories: { id: string; name: string }[];
  onSuccess?: () => void;
}) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [monthlyLimit, setMonthlyLimit] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !monthlyLimit) return;

    setLoading(true);
    try {
      await setBudget({
        categoryId,
        monthlyLimit: parseFloat(monthlyLimit),
      });
      setOpen(false);
      setMonthlyLimit("");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl px-3 py-2 border border-border hover:bg-accent/60 hover:text-foreground active:scale-95 transition-all">
        <Plus className="h-3.5 w-3.5" />
        {t.setLimit}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {language === "id" ? "Atur Batas Budget Bulanan" : "Set Monthly Budget Limit"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="budgetCategory" className="text-xs font-semibold">
                {language === "id" ? "Kategori Pengeluaran" : "Expense Category"}
              </Label>
              <select
                id="budgetCategory"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="monthlyLimit" className="text-xs font-semibold">
                {language === "id" ? "Limit Pengeluaran / Bulan" : "Monthly Spending Limit"}
              </Label>
              <Input
                id="monthlyLimit"
                type="number"
                step="any"
                placeholder={language === "id" ? "contoh: 2000000" : "e.g. 500"}
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Menyimpan..." : language === "id" ? "Simpan Limit" : "Save Limit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
