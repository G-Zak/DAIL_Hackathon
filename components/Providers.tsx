"use client";

import type { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";

/**
 * Mounted at the root, above /login, so signing out and back in as another role
 * is client-side navigation that keeps the session's inspections, notifications
 * and stock flags alive. A full page reload still resets to the initial.json
 * starting point, which is the repeatable demo state we want.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
