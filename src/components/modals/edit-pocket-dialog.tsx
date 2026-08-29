"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { updatePocket } from "@/lib/actions/pockets";
import { useLanguage } from "@/lib/i18n";

type Pocket = {
  id: string;
  name: string;
  pocketType: string;
  balance: string;
  targetAmount: string | null;
};

export function EditPocketDialog({
  pocket,
  onSuccess,
}: {
  pocket: Pocket;
  onSuccess?: () => void;
}) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(pocket.name);
  const [pocketType, setPocketType] = useState<"GENERAL" | "SAVINGS" | "EMERGENCY_FUND" | "WISHLIST">(
    pocket.pocketType as any
  );
  const [balance, setBalance] = useState(parseFloat(pocket.balance).toString());
  const [targetAmount, setTargetAmount] = useState(
    pocket.targetAmount ? parseFloat(pocket.targetAmount).toString() : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      await updatePocket(pocket.id, {
        name,
        pocketType,
        balance: parseFloat(balance) || 0,
        targetAmount: targetAmount ? parseFloat(targetAmount) : null,
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
        title={language === "id" ? "Edit Dompet / Saldo" : "Edit Pocket / Balance"}
        className="text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 p-2 rounded-lg transition-all h-8 w-8 inline-flex items-center justify-center"
      >
        <Pencil className="h-4 w-4" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {language === "id" ? `Edit Dompet: ${pocket.name}` : `Edit Pocket: ${pocket.name}`}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="editPocketName" className="text-xs font-semibold">
                {language === "id" ? "Nama Dompet / Akun" : "Pocket Name"}
              </Label>
              <Input
                id="editPocketName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editPocketType" className="text-xs font-semibold">
                {language === "id" ? "Tipe Dompet" : "Pocket Type"}
              </Label>
              <select
                id="editPocketType"
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
              <Label htmlFor="editPocketBalance" className="text-xs font-semibold">
                {language === "id" ? "Sesuaikan Saldo Saat Ini" : "Adjust Current Balance"}
              </Label>
              <Input
                id="editPocketBalance"
                type="number"
                step="any"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
                className="font-bold text-base"
              />
              <p className="text-[11px] text-muted-foreground">
                {language === "id"
                  ? "Ubah angka ini untuk menyesuaikan saldo dengan uang asli Anda."
                  : "Change this number to match your actual bank balance."}
              </p>
            </div>

            {(pocketType === "SAVINGS" || pocketType === "EMERGENCY_FUND" || pocketType === "WISHLIST") && (
              <div className="space-y-1.5">
                <Label htmlFor="editPocketTarget" className="text-xs font-semibold">
                  {language === "id" ? "Target Nominal Tabungan (Opsional)" : "Target Goal Amount (Optional)"}
                </Label>
                <Input
                  id="editPocketTarget"
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
              {loading ? "Menyimpan..." : language === "id" ? "Simpan Perubahan" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
