"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { setBudget } from "@/lib/actions/budgets";
import { useLanguage } from "@/lib/i18n";

export function EditBudgetDialog({
  budgetId,
  categoryId,
  categoryName,
  currentLimit,
  month,
  year,
  onSuccess,
}: {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  currentLimit: number;
  month: number;
  year: number;
  onSuccess?: () => void;
}) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [monthlyLimit, setMonthlyLimit] = useState(currentLimit.toString());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthlyLimit) return;

    setLoading(true);
    try {
      await setBudget({
        categoryId,
        monthlyLimit: parseFloat(monthlyLimit),
        month,
        year,
      });
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        title={language === "id" ? "Edit Limit Budget" : "Edit Budget Limit"}
        className="text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 p-1.5 rounded-lg transition-all h-7 w-7 inline-flex items-center justify-center"
      >
        <Pencil className="h-3.5 w-3.5" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {language === "id" ? `Edit Limit: ${categoryName}` : `Edit Limit: ${categoryName}`}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="editMonthlyLimit" className="text-xs font-semibold">
                {language === "id" ? "Batas Pengeluaran Bulanan" : "Monthly Spending Limit"}
              </Label>
              <Input
                id="editMonthlyLimit"
                type="number"
                step="any"
                placeholder="contoh: 1500000"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                required
                className="font-bold text-base"
              />
              <p className="text-[11px] text-muted-foreground">
                {language === "id"
                  ? "Tentukan batas maksimal uang yang boleh dikeluarkan untuk kategori ini."
                  : "Set maximum spending limit for this category."}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Menyimpan..." : language === "id" ? "Simpan Perubahan" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
