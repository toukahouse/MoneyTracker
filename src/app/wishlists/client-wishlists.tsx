"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, CheckCircle2, Circle, Trash2, Gift, CalendarDays } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { CreateWishlistDialog } from "@/components/modals/create-wishlist-dialog";
import { AllocateFundsDialog } from "@/components/modals/allocate-funds-dialog";
import { EditWishlistDialog } from "@/components/modals/edit-wishlist-dialog";
import { toggleWishlistItem, deleteWishlist } from "@/lib/actions/wishlists";
import { useRouter } from "next/navigation";
import { MarqueeText } from "@/components/ui/marquee-text";

type WishlistItem = {
  id: string;
  itemName: string;
  estimatedPrice: string;
  isPurchased: boolean;
};

type Wishlist = {
  id: string;
  title: string;
  totalEstimatedCost: string;
  allocatedAmount: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  targetDate: string | null;
  items: WishlistItem[];
};

const statusConfig = {
  PLANNING:    { id: "Perencanaan", en: "Planning",    class: "bg-muted text-muted-foreground" },
  IN_PROGRESS: { id: "Berjalan",    en: "In Progress", class: "bg-primary/10 text-primary" },
  COMPLETED:   { id: "Tercapai",    en: "Completed",   class: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" },
  CANCELLED:   { id: "Dibatalkan",  en: "Cancelled",   class: "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400" },
};

const priorityConfig = {
  LOW:    { id: "Rendah", en: "Low",    class: "bg-slate-100 dark:bg-slate-800 text-slate-500" },
  MEDIUM: { id: "Sedang", en: "Medium", class: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400" },
  HIGH:   { id: "Tinggi", en: "High",   class: "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400" },
};

export function WishlistsClient({
  initialWishlists,
  pockets,
}: {
  initialWishlists: Wishlist[];
  pockets: { id: string; name: string; balance: string }[];
}) {
  const { t, formatCurrency, language } = useLanguage();
  const router = useRouter();

  const handleToggleItem = async (itemId: string, wishlistId: string) => {
    await toggleWishlistItem(itemId, wishlistId);
    router.refresh();
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(language === "id" ? `Hapus target wishlist "${title}"?` : `Delete wishlist "${title}"?`)) {
      await deleteWishlist(id);
      router.refresh();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-4 h-4 text-primary/70" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              {language === "id" ? "Target Impian" : "Dream Goals"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.wishlists}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t.wishlistsDesc}</p>
        </div>
        <CreateWishlistDialog pockets={pockets} onSuccess={() => router.refresh()} />
      </div>

      <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
        {initialWishlists.length === 0 ? (
          <div className="col-span-full">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 border border-primary/10">
                <Gift className="w-7 h-7 text-primary/60" />
              </div>
              <p className="font-semibold text-base mb-1">
                {language === "id" ? "Belum ada wishlist impian" : "No wishlists yet"}
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                {language === "id"
                  ? "Buat wishlist pertamamu dan mulai menabung untuk impianmu!"
                  : "Create your first wishlist and start saving for your dreams!"}
              </p>
            </div>
          </div>
        ) : (
          initialWishlists.map((wl) => {
            const totalCost = parseFloat(wl.totalEstimatedCost);
            const allocated = parseFloat(wl.allocatedAmount);
            const progress = totalCost > 0 ? Math.min(Math.round((allocated / totalCost) * 100), 100) : 0;
            const remaining = Math.max(totalCost - allocated, 0);
            const statusCfg = statusConfig[wl.status] || statusConfig.PLANNING;
            const priorityCfg = priorityConfig[wl.priority] || priorityConfig.MEDIUM;
            const isCompleted = progress >= 100;

            return (
              <Card key={wl.id} className="flex flex-col hover:-translate-y-1 transition-transform duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? "bg-emerald-100 dark:bg-emerald-950/40"
                          : "bg-gradient-to-br from-primary/15 to-primary/8"
                      }`}>
                        <Target className={`h-5 w-5 ${isCompleted ? "text-emerald-500" : "text-primary"}`} />
                      </div>
                      <div className="min-w-0 pt-0.5 flex-1 pr-2">
                        <MarqueeText text={wl.title} className="text-base font-bold leading-tight mb-1.5" />
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${statusCfg.class}`}>
                            {language === "id" ? statusCfg.id : statusCfg.en}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${priorityCfg.class}`}>
                            {language === "id" ? priorityCfg.id : priorityCfg.en}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <EditWishlistDialog wishlist={wl} onSuccess={() => router.refresh()} />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(wl.id, wl.title)}
                        className="text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {wl.targetDate && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>{language === "id" ? "Target tanggal:" : "Target date:"} {wl.targetDate}</span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4 flex-1 pt-0">
                  {/* Progress Section */}
                  <div className="p-4 bg-muted/40 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t.progress}
                      </span>
                      <span className={`text-sm font-bold tabular-nums ${isCompleted ? "text-emerald-500" : "text-foreground"}`}>
                        {progress}%
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-2 bg-border/60"
                      indicatorColor={isCompleted ? "bg-emerald-500" : "bg-primary"}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
                      <span className="font-semibold text-foreground">{formatCurrency(allocated)}</span>
                      <span>/ {formatCurrency(totalCost)}</span>
                    </div>
                  </div>

                  {/* Items Breakdown */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border/60">
                      {t.itemsBreakdown}
                    </h4>
                    <div className="space-y-0.5 max-h-44 overflow-y-auto">
                      {wl.items.length === 0 ? (
                        <p className="text-xs text-muted-foreground/60 py-3 text-center italic">
                          {language === "id" ? "Belum ada rincian item" : "No item breakdown yet"}
                        </p>
                      ) : (
                        wl.items.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleToggleItem(item.id, wl.id)}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-accent/40 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2 flex-1">
                              {item.isPurchased ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" />
                              )}
                              <div className="min-w-0 flex-1">
                                <MarqueeText
                                  text={item.itemName}
                                  className={`text-sm ${
                                    item.isPurchased
                                      ? "text-muted-foreground/50 line-through"
                                      : "font-medium"
                                  }`}
                                />
                              </div>
                            </div>
                            <span className={`text-xs font-semibold shrink-0 tabular-nums ${
                              item.isPurchased ? "text-muted-foreground/50" : ""
                            }`}>
                              {formatCurrency(parseFloat(item.estimatedPrice))}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-border/60 bg-muted/20 mt-auto rounded-b-2xl p-4">
                  {isCompleted ? (
                    <div className="w-full text-center py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
                      🎉 {language === "id" ? "Dana sudah terkumpul penuh!" : "Fully funded!"}
                    </div>
                  ) : (
                    <AllocateFundsDialog
                      wishlistId={wl.id}
                      wishlistTitle={wl.title}
                      remainingAmount={remaining}
                      pockets={pockets}
                      onSuccess={() => router.refresh()}
                    />
                  )}
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
