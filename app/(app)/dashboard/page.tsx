"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleAlert, Disc3, PackageX, Wallet } from "lucide-react";
import { buildProjection, useStore } from "@/lib/store";
import { formatMAD } from "@/lib/pricing";
import { StatCard } from "@/components/StatCard";
import { QueueTable } from "@/components/queue/QueueTable";
import { StockReminderBanner } from "@/components/queue/StockReminderBanner";
import { ProjectionChart } from "@/components/analytics/ProjectionChart";
import {
  ReviewReasonBreakdown,
  StatusBreakdown,
  StockDemandSupply,
  UrgencyTimeline,
} from "@/components/analytics/AnalyticsPanels";

type Tab = "projection" | "queue" | "breakdown";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "projection", label: "Revenue projection" },
  { id: "queue", label: "Action needed" },
  { id: "breakdown", label: "Breakdown" },
];

export default function DashboardPage() {
  const {
    items,
    actionNeeded,
    sendReady,
    blockedByStock,
    rejectedItems,
    resolvedItems,
    bulkEligible,
    bulkApprove,
    discountPct,
  } = useStore();
  const [tab, setTab] = useState<Tab>("projection");

  const review = actionNeeded.filter((i) => i.classification.state === "review_task");
  const { cumulative } = buildProjection(items, discountPct);

  return (
    <div className="space-y-4">
      <StockReminderBanner />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard Icon={Disc3} label="Ready to contact" value={String(sendReady.length)} hint="stock confirmed" index={0} />
        <StatCard Icon={PackageX} label="Blocked on stock" value={String(blockedByStock.length)} hint="flag to stock team" index={1} />
        <StatCard Icon={CircleAlert} label="Need review" value={String(review.length)} hint="incomplete records" index={2} />
        <StatCard
          Icon={Wallet}
          label="Projected revenue"
          value={formatMAD(cumulative)}
          hint={`illustrative · ${discountPct}% discount`}
          index={3}
        />
      </div>

      <section
        className="animate-fade-up rounded-2xl bg-[var(--color-panel)] p-5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[var(--color-border)]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 pb-2.5 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "border-[var(--color-accent)] text-[var(--color-accent-ink)]"
                  : "border-transparent text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
              }`}
            >
              {t.label}
            </button>
          ))}

          {bulkEligible.length > 0 && tab === "queue" && (
            <button
              onClick={bulkApprove}
              title={bulkEligible.map((i) => i.wheelSet.id).join(", ")}
              className="mb-2.5 ml-auto rounded-xl bg-[var(--color-ready)] px-3.5 py-2 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Bulk-approve {bulkEligible.length} clean draft{bulkEligible.length === 1 ? "" : "s"}
            </button>
          )}
        </div>

        {tab === "projection" && <ProjectionChart />}
        {tab === "queue" && (
          <QueueTable
            items={actionNeeded}
            showRank
            emptyText="Queue clear — every record has been actioned."
          />
        )}
        {tab === "breakdown" && (
          <div className="grid gap-4 xl:grid-cols-2">
            <StatusBreakdown />
            <StockDemandSupply />
            <UrgencyTimeline />
            <ReviewReasonBreakdown />
          </div>
        )}
      </section>

      <p className="text-center text-[11px] text-[var(--color-ink-faint)]">
        {resolvedItems.length} resolved · {rejectedItems.length} in the{" "}
        <Link href="/queue" className="font-semibold text-[var(--color-accent-ink)] underline">
          Rejected bin
        </Link>{" "}
        · Synthetic exercise data (C03), every send simulated.
      </p>
    </div>
  );
}
