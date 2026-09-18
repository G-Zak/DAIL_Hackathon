"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  Disc3,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogOut,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { signOut, useSession } from "@/lib/session";
import type { Role } from "@/lib/types";

const NAV: Array<{ href: string; label: string; Icon: typeof LayoutDashboard; roles: Role[] }> = [
  { href: "/queue", label: "Offer queue", Icon: ListChecks, roles: ["coordinator"] },
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard, roles: ["coordinator"] },
  { href: "/stock", label: "Stock needs", Icon: Boxes, roles: ["coordinator"] },
  { href: "/technician", label: "Inspections", Icon: ClipboardList, roles: ["technician"] },
  { href: "/settings", label: "Settings", Icon: SettingsIcon, roles: ["coordinator", "technician"] },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const role: Role = session?.role ?? "coordinator";

  const items = NAV.filter((n) => n.roles.includes(role));

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <>
      {open && (
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="animate-overlay fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-[var(--color-nav)] px-4 py-5 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-7 flex items-center gap-2.5 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)]">
            <Disc3 className="h-[18px] w-[18px] text-white" />
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-[var(--color-nav-ink)]">
            TyreFlow
          </span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="ml-auto text-[var(--color-nav-ink-soft)] lg:hidden"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-nav-ink-soft)]/60">
          {role === "technician" ? "Technician" : "Coordinator"}
        </p>

        <nav className="flex flex-col gap-1">
          {items.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-nav-raised)] text-[var(--color-nav-ink)]"
                    : "text-[var(--color-nav-ink-soft)] hover:bg-[var(--color-nav-raised)]/60 hover:text-[var(--color-nav-ink)]"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 pt-6">
          <span
            title="Not implemented in this slice"
            className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-nav-ink-soft)]/50"
          >
            <LifeBuoy className="h-[18px] w-[18px]" />
            Help &amp; Support
            <span className="ml-auto text-[9px] font-bold uppercase tracking-wide">soon</span>
          </span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-nav-ink-soft)] transition-colors hover:bg-[var(--color-nav-raised)]/60 hover:text-[var(--color-nav-ink)]"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
