"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { createWishlist } from "@/lib/actions/wishlists";
import { useLanguage } from "@/lib/i18n";

export function CreateWishlistDialog({
  pockets,
  onSuccess,
}: {
  pockets: { id: string; name: string }[];
  onSuccess?: () => void;
}) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [pocketId, setPocketId] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

  const [items, setItems] = useState<{ itemName: string; estimatedPrice: string }[]>([
    { itemName: "", estimatedPrice: "" },
  ]);

  const handleAddItem = () => {
    setItems([...items, { itemName: "", estimatedPrice: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: "itemName" | "estimatedPrice", value: string) => {
    const next = [...items];
    next[index][field] = value;
    setItems(next);
  };

  const totalCost = items.reduce((acc, i) => acc + (parseFloat(i.estimatedPrice) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || totalCost <= 0) return;

    setLoading(true);
    try {
      await createWishlist({
        title,
        totalEstimatedCost: totalCost,
        pocketId: pocketId || undefined,
        targetDate: targetDate || undefined,
        priority,
        items: items
          .filter((i) => i.itemName.trim() && parseFloat(i.estimatedPrice) > 0)
          .map((i) => ({
            itemName: i.itemName,
            estimatedPrice: parseFloat(i.estimatedPrice),
          })),
      });
      setOpen(false);
      setTitle("");
      setTargetDate("");
      setItems([{ itemName: "", estimatedPrice: "" }]);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold rounded-xl px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-95 transition-all w-full sm:w-auto">
        <Plus className="h-4 w-4" />
        {t.createWishlist}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} className="max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {language === "id" ? "Bikin Rencana Wishlist Baru" : "Create New Wishlist Goal"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 py-3 overflow-y-auto pr-1">
            <div className="space-y-1">
              <Label htmlFor="wlTitle" className="text-xs font-semibold">
                {language === "id" ? "Nama Target / Impian" : "Wishlist Title"}
              </Label>
              <Input
                id="wlTitle"
                placeholder={language === "id" ? "Setup PC Gaming, Liburan Jepang, dll." : "Gaming PC, Vacation, etc."}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="wlTargetDate" className="text-xs font-semibold">
                  {language === "id" ? "Target Tanggal Tercapai" : "Target Date"}
                </Label>
                <Input
                  id="wlTargetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="wlPriority" className="text-xs font-semibold">
                  {language === "id" ? "Prioritas" : "Priority"}
                </Label>
                <select
                  id="wlPriority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Rendah (Low)</option>
                  <option value="MEDIUM">Sedang (Medium)</option>
                  <option value="HIGH">Tinggi (High)</option>
                </select>
              </div>
            </div>

            {/* Breakdown Items */}
            <div className="space-y-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  {language === "id" ? "Rincian Barang / Komponen" : "Item Breakdown"}
                </Label>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  Total: {totalCost.toLocaleString()}
                </span>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder={language === "id" ? `Barang ${idx + 1}` : `Item ${idx + 1}`}
                    value={item.itemName}
                    onChange={(e) => handleItemChange(idx, "itemName", e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Harga"
                    value={item.estimatedPrice}
                    onChange={(e) => handleItemChange(idx, "estimatedPrice", e.target.value)}
                    required
                    className="w-28"
                  />
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0 h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="w-full text-xs border-dashed mt-1"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {language === "id" ? "+ Tambah Komponen Barang" : "+ Add Item Breakdown"}
              </Button>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Menyimpan..." : language === "id" ? "Simpan Target Wishlist" : "Save Wishlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
