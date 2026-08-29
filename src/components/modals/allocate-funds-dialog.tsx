"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { allocateFunds } from "@/lib/actions/wishlists";
import { useLanguage } from "@/lib/i18n";

export function AllocateFundsDialog({
  wishlistId,
  wishlistTitle,
  remainingAmount,
  pockets,
  onSuccess,
}: {
  wishlistId: string;
  wishlistTitle: string;
  remainingAmount: number;
  pockets: { id: string; name: string; balance: string }[];
  onSuccess?: () => void;
}) {
  const { t, language, formatCurrency } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pocketId, setPocketId] = useState(pockets[0]?.id || "");
  const [amount, setAmount] = useState("");

  const selectedPocket = pockets.find((p) => p.id === pocketId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const numAmount = parseFloat(amount);
    if (!numAmount || !pocketId) return;

    if (selectedPocket && parseFloat(selectedPocket.balance) < numAmount) {
      setError(language === "id" ? "Saldo dompet tidak mencukupi!" : "Insufficient pocket balance!");
      return;
    }

    setLoading(true);
    try {
      await allocateFunds(wishlistId, pocketId, numAmount);
      setOpen(false);
      setAmount("");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || "Failed to allocate funds");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-xl text-xs sm:text-sm shadow-sm active:scale-95 transition-all">
        {t.allocateFunds}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {language === "id" ? `Isi Dana: ${wishlistTitle}` : `Allocate Funds: ${wishlistTitle}`}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-xs space-y-1 border border-neutral-200/50 dark:border-neutral-800">
              <span className="text-muted-foreground">
                {language === "id" ? "Sisa dana yang dibutuhkan:" : "Remaining target needed:"}
              </span>
              <p className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                {formatCurrency(remainingAmount)}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sourcePocket" className="text-xs font-semibold">
                {language === "id" ? "Ambil dari Dompet" : "Source Pocket"}
              </Label>
              <select
                id="sourcePocket"
                value={pocketId}
                onChange={(e) => setPocketId(e.target.value)}
                className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {pockets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Saldo: {formatCurrency(parseFloat(p.balance))})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="allocAmount" className="text-xs font-semibold">
                {language === "id" ? "Nominal yang Dialokasikan" : "Amount to Allocate"}
              </Label>
              <Input
                id="allocAmount"
                type="number"
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/40 p-2 rounded border border-red-200 dark:border-red-900">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Memproses..." : language === "id" ? "Konfirmasi Isi Dana" : "Confirm Allocation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
