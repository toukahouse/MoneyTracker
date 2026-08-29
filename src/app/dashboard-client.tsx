"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowDownIcon, CreditCard, DollarSign, Target, ChevronDown, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, Cell, ReferenceLine } from "recharts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddTransactionDialog } from "@/components/modals/add-transaction-dialog";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MarqueeText } from "@/components/ui/marquee-text";

const CustomTooltip = ({ active, payload, label, selectedMonthName, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0]?.value ?? 0;
    const isUp = val >= 0;
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border/60 p-3 rounded-xl shadow-xl text-sm min-w-[160px]">
        <p className="font-semibold text-xs text-muted-foreground mb-2">
          {selectedMonthName} · {label}
        </p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground text-xs">Net harian</span>
          <span className={`font-bold text-sm tabular-nums ${isUp ? "text-emerald-500" : "text-red-500"}`}>
            {val > 0 ? "+" : ""}{formatCurrency(val)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Stat card data config
const statColors = {
  blue:   { icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",   value: "" },
  green:  { icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", value: "" },
  red:    { icon: "bg-red-500/10 text-red-500", value: "" },
  purple: { icon: "bg-purple-500/10 text-purple-600 dark:text-purple-400", value: "" },
};

function StatCard({
  title, value, sub, icon: Icon, color, valueClass = "",
}: {
  title: string; value: string; sub: string;
  icon: React.ElementType; color: keyof typeof statColors; valueClass?: string;
}) {
  const c = statColors[color];
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/3 pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className={`p-2 rounded-xl ${c.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold tracking-tight ${valueClass}`}>{value}</div>
        <p className="text-xs font-medium text-muted-foreground mt-1.5">{sub}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardClient({
  initialData,
  pockets,
  categories,
}: {
  initialData: any;
  pockets: { id: string; name: string }[];
  categories: { id: string; name: string; type: string }[];
}) {
  const { t, formatCurrency, language } = useLanguage();
  const router = useRouter();

  const now = new Date();
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const currentMonthName = language === "id"
    ? `${monthNames[now.getMonth()]} ${now.getFullYear()}`
    : `${monthNamesEn[now.getMonth()]} ${now.getFullYear()}`;

  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);

  const {
    totalBalance, monthlyIncome, monthlyExpenses, netCashflow,
    activeWishlistsCount, dailyChartData, recentTransactions,
    spendingLimits, primaryWishlist, recentWishlists,
  } = initialData;

  const isPositive = netCashflow >= 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary/70" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              {language === "id" ? "Ringkasan Keuangan" : "Financial Overview"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.dashboard}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t.overviewDesc}</p>
        </div>
        <AddTransactionDialog
          pockets={pockets}
          categories={categories}
          onSuccess={() => router.refresh()}
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t.totalBalance}
          value={formatCurrency(totalBalance)}
          sub={`${pockets.length} ${language === "id" ? "dompet aktif" : "active pockets"}`}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title={t.netCashflow}
          value={`${isPositive ? "+" : ""}${formatCurrency(netCashflow)}`}
          sub={language === "id" ? "Bulan ini" : "This month"}
          icon={CreditCard}
          color="green"
          valueClass={isPositive ? "text-emerald-500" : "text-red-500"}
        />
        <StatCard
          title={t.monthlyExpenses}
          value={`-${formatCurrency(monthlyExpenses)}`}
          sub={language === "id" ? "Total pengeluaran" : "Total spent"}
          icon={ArrowDownIcon}
          color="red"
        />
        <StatCard
          title={t.activeWishlists}
          value={String(activeWishlistsCount)}
          sub={language === "id" ? "Target berjalan" : "Goals in progress"}
          icon={Target}
          color="purple"
        />
      </div>

      {/* Chart + Spending Limit */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {t.cashflowChart}
                </CardTitle>
                <div className="flex items-center gap-4">
                  <p className={`text-2xl font-bold tracking-tight ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                    {isPositive ? "+" : ""}{formatCurrency(netCashflow)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {isPositive
                      ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                    {selectedMonth}
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex gap-1">
                    <span className="text-emerald-500 font-semibold">+{formatCurrency(monthlyIncome)}</span> pemasukan
                  </span>
                  <span className="flex gap-1">
                    <span className="text-red-500 font-semibold">-{formatCurrency(monthlyExpenses)}</span> pengeluaran
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-accent/60 transition-colors shrink-0">
                  {selectedMonth}
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="shadow-xl">
                  <DropdownMenuItem onClick={() => setSelectedMonth(currentMonthName)} className="font-medium text-xs">
                    {currentMonthName}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="px-2 sm:px-4 pb-4">
            <div className="h-[220px] sm:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData} barCategoryGap="20%" margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    className="text-muted-foreground"
                    dy={8}
                    interval={3}
                  />
                  <ReferenceLine y={0} stroke="currentColor" className="text-border" strokeWidth={1.5} />
                  <Tooltip
                    content={<CustomTooltip selectedMonthName={selectedMonth} formatCurrency={formatCurrency} />}
                    cursor={{ fill: "currentColor", className: "text-muted/40" }}
                  />
                  <Bar dataKey="change" radius={[4, 4, 1, 1]} maxBarSize={14}>
                    {dailyChartData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.change >= 0 ? "#10b981" : "#ef4444"}
                        fillOpacity={Math.abs(entry.change) === 0 ? 0.25 : 0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80 inline-block" />
                {language === "id" ? "Net Positif" : "Net Positive"}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500/80 inline-block" />
                {language === "id" ? "Net Negatif" : "Net Negative"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spending Limit Watch */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                {t.spendingLimit}
              </CardTitle>
              <p className="text-sm font-semibold">{language === "id" ? "Limit Budget" : "Budget Limits"}</p>
            </div>
            <Link href="/pockets" className="text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
              {language === "id" ? "Atur →" : "Manage →"}
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {spendingLimits.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
                  <Target className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "id" ? "Belum ada limit budget" : "No budget limits set"}
                </p>
              </div>
            ) : (
              spendingLimits.map((b: any) => {
                const percent = Math.min(Math.round((b.spent / b.limit) * 100), 100);
                const isOver = b.over;
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-medium flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: b.category?.color || "#f97316" }}
                        />
                        <span className="text-xs font-semibold">{b.category?.name}</span>
                      </div>
                      <span className={`font-semibold text-xs tabular-nums ${isOver ? "text-red-500" : "text-muted-foreground"}`}>
                        {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
                      </span>
                    </div>
                    <Progress
                      value={percent}
                      className="h-1.5 bg-muted"
                      indicatorColor={isOver ? "bg-red-500" : "bg-primary"}
                    />
                    <p className={`text-[10px] font-medium text-right ${isOver ? "text-red-500" : "text-muted-foreground"}`}>
                      {percent}% {isOver ? (language === "id" ? "⚠ Melebihi limit!" : "⚠ Over limit!") : language === "id" ? "digunakan" : "used"}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions + Wishlist Progress */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                {t.recentTransactions}
              </CardTitle>
              <p className="text-sm font-semibold">{language === "id" ? "Transaksi Terakhir" : "Latest Transactions"}</p>
            </div>
            <Link href="/transactions" className="text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
              {language === "id" ? "Lihat Semua →" : "View All →"}
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-0.5">
              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === "id" ? "Belum ada transaksi" : "No transactions yet"}
                  </p>
                </div>
              ) : (
                recentTransactions.map((tx: any) => {
                  const formattedDate = new Date(tx.transactionDate).toLocaleDateString(
                    language === "id" ? "id-ID" : "en-US",
                    { day: "numeric", month: "short" }
                  );
                  const amountNum = parseFloat(tx.amount);

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center p-2.5 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group"
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center mr-3 shrink-0 transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: `${tx.category?.color || "#3b82f6"}18`,
                        }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: tx.category?.color || "#3b82f6" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <MarqueeText
                          text={tx.notes || (language === "id" ? "Transaksi" : "Transaction")}
                          className="text-sm font-semibold text-foreground"
                        />
                        <p className="text-xs text-muted-foreground truncate">
                          {tx.category?.name || "—"} · {formattedDate}
                        </p>
                      </div>
                      <div
                        className={`font-bold text-sm tabular-nums shrink-0 ml-2 ${
                          tx.type === "INCOME" ? "text-emerald-500" : "text-foreground"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(amountNum)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wishlist Progress */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                {t.wishlistProgress}
              </CardTitle>
              <p className="text-sm font-semibold">{language === "id" ? "Target Impian Aktif" : "Active Goals"}</p>
            </div>
            <Link href="/wishlists" className="text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
              {language === "id" ? "Semua →" : "All →"}
            </Link>
          </CardHeader>
          <CardContent>
            {(() => {
              const wishlistsToShow = (recentWishlists && recentWishlists.length > 0)
                ? recentWishlists
                : (primaryWishlist ? [primaryWishlist] : []);

              if (wishlistsToShow.length === 0) {
                return (
                  <div className="py-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
                      <Target className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language === "id" ? "Belum ada wishlist aktif" : "No active wishlists"}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {wishlistsToShow.map((wl: any) => {
                    const allocatedNum = parseFloat(wl.allocatedAmount || "0");
                    const totalCostNum = parseFloat(wl.totalEstimatedCost || "0");
                    const prog = totalCostNum > 0 ? Math.min(Math.round((allocatedNum / totalCostNum) * 100), 100) : 0;
                    const remaining = Math.max(0, totalCostNum - allocatedNum);

                    return (
                      <div
                        key={wl.id}
                        className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/8 to-primary/3 border border-primary/10 space-y-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 text-primary">
                            <Target className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <MarqueeText text={wl.title} className="text-sm font-bold text-foreground" />
                              <span className="text-xs font-bold text-primary shrink-0 tabular-nums">{prog}%</span>
                            </div>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground mt-0.5">
                              {wl.status === "IN_PROGRESS"
                                ? (language === "id" ? "Sedang Berjalan" : "In Progress")
                                : (language === "id" ? "Perencanaan" : "Planning")}
                            </span>
                          </div>
                        </div>

                        <Progress value={prog} className="h-1.5" indicatorColor="bg-primary" />

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums pt-0.5">
                          <span className="font-medium">{formatCurrency(allocatedNum)} / {formatCurrency(totalCostNum)}</span>
                          <span>{language === "id" ? `Sisa ${formatCurrency(remaining)}` : `${formatCurrency(remaining)} left`}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
