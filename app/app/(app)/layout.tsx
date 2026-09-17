"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { StoreProvider } from "@/lib/store";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { RecordModal } from "@/components/queue/RecordModal";
import { Toaster } from "@/components/Toaster";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/queue": "Offer queue",
  "/stock": "Stock needs",
  "/technician": "Inspections",
  "/settings": "Settings",
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <StoreProvider>
      <div className="flex min-h-screen bg-[var(--color-nav)]">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col bg-[var(--color-canvas)] lg:my-3 lg:mr-3 lg:rounded-3xl lg:overflow-hidden">
          <Topbar title={TITLES[pathname] ?? "TyreFlow"} onOpenMenu={() => setMenuOpen(true)} />
          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6">{children}</main>
        </div>
      </div>
      <RecordModal />
      <Toaster />
    </StoreProvider>
  );
}
