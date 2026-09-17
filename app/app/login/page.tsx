"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Disc3, ListChecks, Wrench } from "lucide-react";
import { signIn } from "@/lib/session";
import type { Role } from "@/lib/types";

const ROLES: Array<{
  role: Role;
  Icon: typeof Wrench;
  title: string;
  blurb: string;
  href: string;
}> = [
  {
    role: "technician",
    Icon: Wrench,
    title: "Technician",
    blurb: "Log what you found on the wheels — condition per axle, size, appointment, contact.",
    href: "/technician",
  },
  {
    role: "coordinator",
    Icon: ListChecks,
    title: "Coordinator",
    blurb: "Review flagged wheel sets, check the evidence, approve or reject every offer.",
    href: "/queue",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Role>("coordinator");
  const [name, setName] = useState("Zakaria");

  function handleContinue() {
    const target = ROLES.find((r) => r.role === selected)!;
    signIn(selected, name);
    router.push(target.href);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-shell)] px-4 py-10">
      <div className="w-full max-w-lg animate-fade-up">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]">
            <Disc3 className="h-5 w-5 text-white" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">
            TyreFlow
          </span>
        </div>

        <div
          className="rounded-2xl bg-[var(--color-panel)] p-6 sm:p-7"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h1 className="text-lg font-bold text-[var(--color-ink)]">Sign in</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Pick the view you need. Both roles share the same inspection data.
          </p>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {ROLES.map(({ role, Icon, title, blurb }) => {
              const active = selected === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelected(role)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                    active
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-bg)]"
                      : "border-[var(--color-border-strong)] bg-[var(--color-panel)] hover:border-[var(--color-accent-border)]"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      active
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-panel-sunken)] text-[var(--color-ink-soft)]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      active ? "text-[var(--color-accent-ink)]" : "text-[var(--color-ink)]"
                    }`}
                  >
                    {title}
                  </span>
                  <span className="text-xs leading-snug text-[var(--color-ink-soft)]">{blurb}</span>
                </button>
              );
            })}
          </div>

          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">
              Display name (optional)
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zakaria"
              className="mt-1.5 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)]"
            />
          </label>

          <button
            onClick={handleContinue}
            className="mt-5 w-full rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-bold text-[var(--color-accent-contrast)] transition-all hover:bg-[var(--color-accent-strong)] active:scale-[0.99]"
          >
            Continue as {selected === "technician" ? "Technician" : "Coordinator"}
          </button>

          <p className="mt-4 rounded-xl border border-[var(--color-illustrative-border)] bg-[var(--color-illustrative-bg)] px-3 py-2 text-[11px] leading-snug text-[var(--color-illustrative-ink)]">
            <strong>Demo sign-in.</strong> No password, no real authentication — the role only picks
            a landing view. Supabase auth, accounts and email/push alerts are planned, not built.
          </p>
        </div>

        <p className="mt-4 text-center text-[11px] text-[var(--color-ink-faint)]">
          Synthetic exercise data (C03) — no real customers, shops or messages.
        </p>
      </div>
    </div>
  );
}
