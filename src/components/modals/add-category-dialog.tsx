"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Tag } from "lucide-react";
import { createCategory } from "@/lib/actions/categories";
import { useLanguage } from "@/lib/i18n";

const PRESET_COLORS = [
  "#f97316", // Orange
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#eab308", // Yellow
  "#ef4444", // Red
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
  "#64748b", // Slate
];

export function AddCategoryDialog({
  defaultType = "EXPENSE",
  triggerClassName,
  triggerLabel,
  onSuccess,
  onCategoryCreated,
}: {
  defaultType?: "EXPENSE" | "INCOME" | "TRANSFER";
  triggerClassName?: string;
  triggerLabel?: string;
  onSuccess?: () => void;
  onCategoryCreated?: (category: { id: string; name: string; type: string }) => void;
}) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">(defaultType);
  const [color, setColor] = useState("#3b82f6");

  const handleSave = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!name.trim() || loading) return;

    setLoading(true);
    try {
      const newCategory = await createCategory({
        name: name.trim(),
        type,
        color,
      });
      setOpen(false);
      setName("");
      if (onCategoryCreated && newCategory) {
        onCategoryCreated(newCategory);
      }
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
        type="button"
        onClick={(e) => e.stopPropagation()}
        className={
          triggerClassName ||
          "inline-flex items-center justify-center gap-1 text-xs font-semibold rounded-md px-2.5 py-1.5 border border-dashed border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        }
      >
        <Plus className="h-3.5 w-3.5" />
        {triggerLabel || (language === "id" ? "Kategori Baru" : "New Category")}
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[400px]"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            handleSave(e);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-600" />
            {language === "id" ? "Buat Kategori Kustom Baru" : "Create Custom Category"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4" onClick={(e) => e.stopPropagation()}>
          {/* Tipe Kategori */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {language === "id" ? "Tipe Kategori" : "Category Type"}
            </Label>
            <div className="flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
              {(["EXPENSE", "INCOME", "TRANSFER"] as const).map((tOption) => (
                <button
                  key={tOption}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setType(tOption);
                  }}
                  className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
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
          </div>

          {/* Nama Kategori */}
          <div className="space-y-1.5">
            <Label htmlFor="categoryName" className="text-xs font-semibold">
              {language === "id" ? "Nama Kategori" : "Category Name"}
            </Label>
            <Input
              id="categoryName"
              placeholder={language === "id" ? "contoh: Skincare, Game Steam, Laundry, dll." : "e.g. Pet Food, Streaming, etc."}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Pilih Warna Tag */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {language === "id" ? "Warna Label / Badge" : "Label Color"}
            </Label>
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setColor(c);
                  }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            disabled={loading}
            onClick={(e) => handleSave(e)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Menyimpan..." : language === "id" ? "Simpan Kategori" : "Save Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
