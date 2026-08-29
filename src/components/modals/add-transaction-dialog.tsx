"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { createTransaction } from "@/lib/actions/transactions";
import { useLanguage } from "@/lib/i18n";
import { AddCategoryDialog } from "./add-category-dialog";
import { useRouter } from "next/navigation";

type AddTransactionDialogProps = {
  pockets: { id: string; name: string }[];
  categories: { id: string; name: string; type: string }[];
  triggerClassName?: string;
  triggerLabel?: string;
  onSuccess?: () => void;
};

export function AddTransactionDialog({
  pockets,
  categories,
  triggerClassName,
  triggerLabel,
  onSuccess,
}: AddTransactionDialogProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [pocketId, setPocketId] = useState(pockets[0]?.id || "");
  const [categoryId, setCategoryId] = useState("");
  const [notes, setNotes] = useState("");
  const [localCategories, setLocalCategories] = useState(categories);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const filteredCategories = localCategories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!amount || !pocketId || loading) return;

    setLoading(true);
    try {
      const numericAmount = parseFloat(amount);
      await createTransaction({
        type,
        amount: numericAmount,
        pocketId,
        categoryId: categoryId || undefined,
        notes,
      });
      setOpen(false);
      setAmount("");
      setNotes("");
      setCategoryId("");
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
        className={
          triggerClassName ||
          "inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-95 transition-all text-xs sm:text-sm"
        }
      >
        <Plus className="h-4 w-4" />
        {triggerLabel || t.addTransaction}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {language === "id" ? "Catat Transaksi Baru" : "Record New Transaction"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Type selector */}
            <div className="flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
              {(["EXPENSE", "INCOME", "TRANSFER"] as const).map((tOption) => (
                <button
                  key={tOption}
                  type="button"
                  onClick={() => {
                    setType(tOption);
                    setCategoryId("");
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    type === tOption
                      ? tOption === "INCOME"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : tOption === "EXPENSE"
                        ? "bg-red-500 text-white shadow-sm"
                        : "bg-blue-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tOption === "EXPENSE" ? "Pengeluaran" : tOption === "INCOME" ? "Pemasukan" : "Transfer"}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs font-semibold">
                {language === "id" ? "Nominal (Jumlah Uang)" : "Amount"}
              </Label>
              <Input
                id="amount"
                type="number"
                step="any"
                placeholder={language === "id" ? "contoh: 50000" : "e.g. 50.00"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="font-semibold text-lg"
              />
            </div>

            {/* Pocket */}
            <div className="space-y-1.5">
              <Label htmlFor="pocket" className="text-xs font-semibold">
                {language === "id" ? "Pilih Dompet / Akun" : "Select Pocket / Account"}
              </Label>
              <select
                id="pocket"
                value={pocketId}
                onChange={(e) => setPocketId(e.target.value)}
                className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {pockets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category (if not transfer) */}
            {type !== "TRANSFER" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category" className="text-xs font-semibold">
                    {language === "id" ? "Kategori" : "Category"}
                  </Label>
                  <AddCategoryDialog
                    defaultType={type}
                    onCategoryCreated={(newCat) => {
                      setLocalCategories((prev) => {
                        if (prev.some((c) => c.id === newCat.id)) return prev;
                        return [...prev, newCat];
                      });
                      setCategoryId(newCat.id);
                      router.refresh();
                    }}
                    triggerLabel={language === "id" ? "+ Buat Kategori" : "+ New Category"}
                    triggerClassName="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                  />
                </div>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{language === "id" ? "-- Pilih Kategori --" : "-- Select Category --"}</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold">
                {language === "id" ? "Catatan / Keterangan" : "Notes / Description"}
              </Label>
              <Input
                id="notes"
                placeholder={language === "id" ? "Makan siang, belanja bulanan, dll." : "Grocery, dinner, etc."}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Menyimpan..." : language === "id" ? "Simpan Transaksi" : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
