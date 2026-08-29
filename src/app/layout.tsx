"use client";

import { Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Wallet, Receipt, Gift, Menu, Globe, Sun, Moon,
  TrendingUp, ChevronRight, Sparkles,
} from "lucide-react";
import { LanguageProvider, useLanguage } from "@/lib/i18n";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { useTheme } from "next-themes";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
        isActive
          ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary nav-active"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/60 dark:hover:bg-accent/30"
      }`}
    >
      <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${
        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
      }`} />
      <span className="flex-1">{label}</span>
      {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary/60" />}
    </Link>
  );
}

function Navigation() {
  const { t } = useLanguage();
  const links = [
    { href: "/",             label: t.dashboard,    icon: LayoutDashboard },
    { href: "/transactions", label: t.transactions, icon: Receipt },
    { href: "/pockets",      label: t.budgets,      icon: Wallet },
    { href: "/wishlists",    label: t.wishlists,    icon: Gift },
  ];
  return (
    <nav className="px-3 py-2 space-y-0.5">
      {links.map((link) => (
        <NavLink key={link.href} {...link} />
      ))}
    </nav>
  );
}

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent/60 dark:hover:bg-accent/30 transition-colors">
        <Globe className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={() => setLanguage("id")} className={`gap-2 text-sm ${language === "id" ? "bg-primary/10 text-primary font-semibold" : ""}`}>
          🇮🇩 Indonesia
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("en")} className={`gap-2 text-sm ${language === "en" ? "bg-primary/10 text-primary font-semibold" : ""}`}>
          🇺🇸 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent/60 dark:hover:bg-accent/30 transition-colors relative"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 text-muted-foreground rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
      <Moon className="h-4 w-4 text-muted-foreground rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
    </button>
  );
}

function SidebarBrand() {
  return (
    <div className="px-5 py-5 flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30">
        <TrendingUp className="w-4.5 h-4.5 text-white" />
      </div>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Money<span className="text-primary">Tracker</span>
      </span>
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="px-5 py-4 border-t border-border/50 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="w-3.5 h-3.5 text-primary/70" />
        <span className="font-medium">Finance Tracker</span>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </div>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col flex-shrink-0 border-r border-border/60 bg-sidebar/95 backdrop-blur-xl">
        <SidebarBrand />
        <div className="flex-1 overflow-y-auto pt-1">
          <Navigation />
        </div>
        <SidebarFooter />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-background/90 backdrop-blur-xl border-b border-border/60 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-accent/60 transition-colors">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 flex flex-col bg-sidebar border-r border-border/60">
                <SidebarBrand />
                <div className="flex-1 overflow-y-auto pt-1">
                  <Navigation />
                </div>
                <div className="px-5 py-4 border-t border-border/50 flex items-center gap-2">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-base font-bold tracking-tight">
              Money<span className="text-primary">Tracker</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-background bg-ambient">
          <div className="max-w-7xl mx-auto w-full page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <title>MoneyTracker — Catat Keuangan Pribadi</title>
        <meta name="description" content="Aplikasi pencatatan keuangan pribadi modern dengan fitur transaksi, dompet, budget, dan wishlist planner." />
      </head>
      <body className={`${outfit.variable} font-sans min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <MainLayout>{children}</MainLayout>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
