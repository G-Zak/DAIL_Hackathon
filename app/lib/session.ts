"use client";

import { useSyncExternalStore } from "react";
import type { Role, Session } from "./types";

/**
 * Demo session only — there is no real authentication yet. It records which role
 * the viewer picked on the login screen so the shell can show the right landing
 * page and label. Real auth/authorisation arrives with Supabase.
 */
const STORAGE_KEY = "c03-session";
const EVENT = "c03-session-change";

function read(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (parsed.role !== "technician" && parsed.role !== "coordinator") return null;
    return parsed;
  } catch {
    return null;
  }
}

let cached: Session | null | undefined;

function getSnapshot(): Session | null {
  if (cached === undefined) cached = read();
  return cached;
}

function getServerSnapshot(): Session | null {
  return null;
}

function subscribe(onChange: () => void) {
  const handler = () => {
    cached = read();
    onChange();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function signIn(role: Role, name: string) {
  const session: Session = { role, name: name.trim() || (role === "technician" ? "Technician" : "Coordinator") };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage blocked — the session just won't survive a reload.
  }
  cached = session;
  window.dispatchEvent(new Event(EVENT));
}

export function signOut() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
  cached = null;
  window.dispatchEvent(new Event(EVENT));
}
