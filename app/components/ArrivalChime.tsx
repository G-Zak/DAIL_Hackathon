"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { useSession } from "@/lib/session";
import { playNotificationSound } from "@/lib/sound";

/**
 * Rings once when the coordinator arrives and something was flagged while they
 * were away — typically a technician logging an inspection under the other role.
 * Mounted in the (app) layout, so it fires on entering the app, not on every
 * navigation between coordinator pages.
 */
export function ArrivalChime() {
  const { notifications, settings } = useStore();
  const session = useSession();
  const role = session?.role;

  useEffect(() => {
    if (role !== "coordinator" || !settings.soundEnabled) return;
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    playNotificationSound(unread.some((n) => n.urgent));
    // Mount-only on purpose: this announces what was waiting on arrival, and must
    // not re-fire as notifications come in (notify() already handles those).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return null;
}
