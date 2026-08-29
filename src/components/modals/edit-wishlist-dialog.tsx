"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { updateWishlist } from "@/lib/actions/wishlists";
import { useLanguage } from "@/lib/i18n";

type EditWishlistDialogProps = {
  wishlist: {
    id: string;
    title: string;
    targetDate: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    pocketId?: string | null;
    items: { id: string; itemName: string; estimatedPrice: string; isPurchased?: boolean }[];
  };
  onSuccess?: () => void;
};

export function EditWishlistDialog({ wishlist, onSuccess }: EditWishlistDialogProps) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(wishlist.title);
  const [targetDate, setTargetDate] = useState(wishlist.targetDate || "");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">(wishlist.priority);
  const [status, setStatus] = useState<"PLANNING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED">(wishlist.status);

  const [items, setItems] = useState<{ itemName: string; estimatedPrice: string; isPurchased?: boolean }[]>(
    wishlist.items.length > 0
      ? wishlist.items.map((i) => ({
          itemName: i.itemName,
          estimatedPrice: i.estimatedPrice,
          isPurchased: i.isPurchased,
        }))
      : [{ itemName: "", estimatedPrice: "" }]
  );

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
    if (!title.trim() || totalCost <= 0) return;

    setLoading(true);
    try {
      await updateWishlist(wishlist.id, {
        title: title.trim(),
        totalEstimatedCost: totalCost,
        targetDate: targetDate || undefined,
        priority,
        status,
        items: items
          .filter((i) => i.itemName.trim() && parseFloat(i.estimatedPrice) > 0)
          .map((i) => ({
            itemName: i.itemName.trim(),
            estimatedPrice: parseFloat(i.estimatedPrice),
            isPurchased: i.isPurchased || false,
          })),
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
        className="inline-flex items-center justify-center rounded-xl p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
        aria-label="Edit Wishlist"
      >
        <Pencil className="h-3.5 w-3.5" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} className="max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {language === "id" ? "Edit Target Wishlist" : "Edit Wishlist Goal"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 py-3 overflow-y-auto pr-1">
            <div className="space-y-1">
              <Label htmlFor="editWlTitle" className="text-xs font-semibold">
                {language === "id" ? "Nama Target / Impian" : "Wishlist Title"}
              </Label>
              <Input
                id="editWlTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="editWlTargetDate" className="text-xs font-semibold">
                  {language === "id" ? "Target Tanggal" : "Target Date"}
                </Label>
                <Input
                  id="editWlTargetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="editWlPriority" className="text-xs font-semibold">
                  {language === "id" ? "Prioritas" : "Priority"}
                </Label>
                <select
                  id="editWlPriority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="LOW">{language === "id" ? "Rendah (Low)" : "Low"}</option>
                  <option value="MEDIUM">{language === "id" ? "Sedang (Medium)" : "Medium"}</option>
                  <option value="HIGH">{language === "id" ? "Tinggi (High)" : "High"}</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="editWlStatus" className="text-xs font-semibold">
                {language === "id" ? "Status Target" : "Goal Status"}
              </Label>
              <select
                id="editWlStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="PLANNING">{language === "id" ? "Perencanaan (Planning)" : "Planning"}</option>
                <option value="IN_PROGRESS">{language === "id" ? "Sedang Berjalan (In Progress)" : "In Progress"}</option>
                <option value="COMPLETED">{language === "id" ? "Sudah Tercapai (Completed)" : "Completed"}</option>
                <option value="CANCELLED">{language === "id" ? "Dibatalkan (Cancelled)" : "Cancelled"}</option>
              </select>
            </div>

            {/* Breakdown Items */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  {language === "id" ? "Rincian Barang / Komponen" : "Item Breakdown"}
                </Label>
                <span className="text-xs font-bold text-primary tabular-nums">
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
                    className="flex-1 text-xs"
                  />
                  <Input
                    type="number"
                    placeholder="Harga"
                    value={item.estimatedPrice}
                    onChange={(e) => handleItemChange(idx, "estimatedPrice", e.target.value)}
                    required
                    className="w-28 text-xs tabular-nums"
                  />
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="w-full text-xs border-dashed mt-1 rounded-xl"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {language === "id" ? "+ Tambah Komponen Barang" : "+ Add Item"}
              </Button>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (language === "id" ? "Menyimpan..." : "Saving...") : (language === "id" ? "Simpan Perubahan" : "Save Changes")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
