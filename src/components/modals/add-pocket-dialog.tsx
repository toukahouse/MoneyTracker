"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { createPocket } from "@/lib/actions/pockets";
import { useLanguage } from "@/lib/i18n";

export function AddPocketDialog({ onSuccess }: { onSuccess?: () => void }) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [pocketType, setPocketType] = useState<"GENERAL" | "SAVINGS" | "EMERGENCY_FUND" | "WISHLIST">("GENERAL");
  const [balance, setBalance] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      await createPocket({
        name,
        pocketType,
        balance: parseFloat(balance) || 0,
        targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
      });
      setOpen(false);
      setName("");
      setBalance("");
      setTargetAmount("");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-95 transition-all">
        <Plus className="h-3.5 w-3.5" />
        {t.newPocket}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {language === "id" ? "Buka Dompet Baru" : "Create New Pocket"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="pocketName" className="text-xs font-semibold">
                {language === "id" ? "Nama Dompet" : "Pocket Name"}
              </Label>
              <Input
                id="pocketName"
                placeholder={language === "id" ? "Tabungan Nikah, Rekening Bisnis, dll." : "Savings, Emergency, etc."}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pocketType" className="text-xs font-semibold">
                {language === "id" ? "Tipe Dompet" : "Pocket Type"}
              </Label>
              <select
                id="pocketType"
                value={pocketType}
                onChange={(e) => setPocketType(e.target.value as any)}
                className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GENERAL">{language === "id" ? "Umum / Rekening Utama" : "General"}</option>
                <option value="SAVINGS">{language === "id" ? "Tabungan" : "Savings"}</option>
                <option value="EMERGENCY_FUND">{language === "id" ? "Dana Darurat" : "Emergency Fund"}</option>
                <option value="WISHLIST">{language === "id" ? "Kantong Impian (Wishlist)" : "Wishlist"}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pocketBalance" className="text-xs font-semibold">
                {language === "id" ? "Saldo Awal" : "Initial Balance"}
              </Label>
              <Input
                id="pocketBalance"
                type="number"
                step="any"
                placeholder="0"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </div>

            {(pocketType === "SAVINGS" || pocketType === "EMERGENCY_FUND" || pocketType === "WISHLIST") && (
              <div className="space-y-1.5">
                <Label htmlFor="pocketTarget" className="text-xs font-semibold">
                  {language === "id" ? "Target Nominal Tabungan (Opsional)" : "Target Goal Amount (Optional)"}
                </Label>
                <Input
                  id="pocketTarget"
                  type="number"
                  step="any"
                  placeholder="e.g. 15000000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Menyimpan..." : language === "id" ? "Buat Dompet" : "Create Pocket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
