import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Entry } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatTimeInput(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function entryTimestamp(entry: Pick<Entry, "date" | "time">): number {
  return new Date(`${entry.date}T${entry.time || "00:00"}`).getTime();
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export function isWithinLastDays(dateStr: string, days: number, referenceDate?: string): boolean {
  const ref = referenceDate || formatDateInput(new Date());
  const diff = daysBetween(dateStr, ref);
  return diff >= 0 && diff < days;
}
