import { useState, useEffect, useMemo } from "react";
import type { AppState, Pathway } from "@/types";
import { formatDateInput, isWithinLastDays } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CooldownScreenProps {
  state: AppState;
}

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  return now;
}

function getMostRecentEntryForPathway(state: AppState, pathwayId: string) {
  return state.entries
    .filter((e) => e.pathway_id === pathwayId)
    .sort((a, b) => {
      const da = new Date(a.date + "T" + (a.time || "00:00")).getTime();
      const db = new Date(b.date + "T" + (b.time || "00:00")).getTime();
      return db - da;
    })[0];
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Available";
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function formatCountUp(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  if (hours < 24) return `+${hours}h free`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `+${days}d free`;
  const weeks = Math.floor(days / 7);
  return `+${weeks}w free`;
}

function getMilestone(hoursFree: number): string | null {
  if (hoursFree >= 24 && hoursFree < 25) return "24h milestone";
  if (hoursFree >= 48 && hoursFree < 49) return "48h milestone";
  if (hoursFree >= 168 && hoursFree < 169) return "1 week milestone";
  return null;
}

function getPathwayStatus(
  pathway: Pathway,
  state: AppState,
  now: number
): {
  available: boolean;
  display: string;
  subtext: string | null;
  color: string;
} {
  const lastEntry = getMostRecentEntryForPathway(state, pathway.id);
  if (!lastEntry) {
    return { available: true, display: "Never used", subtext: null, color: "#86efac" };
  }

  const lastTime = new Date(
    lastEntry.date + "T" + (lastEntry.time || "00:00")
  ).getTime();

  if (pathway.cooldown_hours === null) {
    // No cooldown configured - show warning
    const hoursFree = Math.floor((now - lastTime) / 3600000);
    return {
      available: true,
      display: formatCountUp(now - lastTime),
      subtext: "Set cooldown in settings",
      color: hoursFree > 24 ? "#86efac" : "#fcd34d",
    };
  }

  const cooldownMs = pathway.cooldown_hours * 3600000;
  const remaining = lastTime + cooldownMs - now;

  if (remaining > 0) {
    return {
      available: false,
      display: formatCountdown(remaining),
      subtext: "On cooldown",
      color: "#fca5a5",
    };
  }

  const hoursFree = Math.floor((now - (lastTime + cooldownMs)) / 3600000);
  const milestone = getMilestone(hoursFree);

  return {
    available: true,
    display: formatCountUp(now - (lastTime + cooldownMs)),
    subtext: milestone,
    color: "#86efac",
  };
}

export function CooldownScreen({ state }: CooldownScreenProps) {
  const now = useNow();
  const today = formatDateInput(new Date());

  const pathwayStatuses = useMemo(() => {
    return state.settings.pathways.map((pw) => ({
      pathway: pw,
      status: getPathwayStatus(pw, state, now),
    }));
  }, [state, now]);

  const availablePathways = pathwayStatuses.filter((p) => p.status.available);

  // MOH count: entries in last 30 days with naproxen or metamizole
  const mohCount = useMemo(() => {
    return state.entries.filter(
      (e) =>
        (e.pathway_id === "naproxen" || e.pathway_id === "metamizole") &&
        isWithinLastDays(e.date, 30, today)
    ).length;
  }, [state.entries, today]);

  const personalCeiling = state.settings.moh_thresholds.personal_ceiling_days;
  const clinicalThreshold = state.settings.moh_thresholds.clinical_threshold_days;

  const mohPercentagePersonal = Math.min((mohCount / personalCeiling) * 100, 100);
  const mohPercentageClinical = Math.min((mohCount / clinicalThreshold) * 100, 100);

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-stone-800 mb-4">Cooldowns</h1>

      {/* Available summary */}
      <div
        className={cn(
          "mb-4 p-3 rounded-xl border flex items-center gap-3",
          availablePathways.length > 0
            ? "bg-teal-50 border-teal-200"
            : "bg-red-50 border-red-200"
        )}
      >
        {availablePathways.length > 0 ? (
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
        )}
        <p className="text-sm text-stone-700">
          {availablePathways.length > 0 ? (
            <>
              <span className="font-medium">Available:</span>{" "}
              {availablePathways.map((p) => p.pathway.label).join(", ") || "All pathways"}
            </>
          ) : (
            <span className="font-medium">All pathways on cooldown</span>
          )}
        </p>
      </div>

      {/* Pathway cards */}
      <div className="space-y-3 mb-6">
        {pathwayStatuses.map(({ pathway, status }) => (
          <div
            key={pathway.id}
            className={cn(
              "p-4 rounded-xl border-2 transition-all",
              status.available
                ? "border-transparent bg-white shadow-sm"
                : "border-red-200 bg-red-50/50"
            )}
            style={{
              backgroundColor: status.available ? pathway.color + "33" : undefined,
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-stone-800">
                {pathway.label}
              </span>
              {pathway.cooldown_hours === null && (
                <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  No cooldown set
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock
                size={14}
                className={cn(
                  status.available ? "text-teal-600" : "text-red-500"
                )}
              />
              <span
                className={cn(
                  "text-lg font-bold",
                  status.available ? "text-teal-700" : "text-red-600"
                )}
              >
                {status.display}
              </span>
            </div>
            {status.subtext && (
              <p className="text-xs text-stone-500 mt-1">{status.subtext}</p>
            )}
          </div>
        ))}
      </div>

      {/* MOH Counter */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-800 mb-3">
          MOH Risk (Last 30 Days)
        </h2>

        {/* Personal ceiling */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-stone-600">
              Personal ceiling
            </span>
            <span className="text-xs font-bold text-stone-800">
              {mohCount} / {personalCeiling} days
            </span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                mohPercentagePersonal >= 100 ? "bg-red-400" : "bg-amber-400"
              )}
              style={{ width: `${mohPercentagePersonal}%` }}
            />
          </div>
        </div>

        {/* Clinical threshold */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-stone-600">
              Clinical threshold
            </span>
            <span className="text-xs font-bold text-stone-800">
              {mohCount} / {clinicalThreshold} days
            </span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                mohPercentageClinical >= 100 ? "bg-red-400" : "bg-teal-400"
              )}
              style={{ width: `${mohPercentageClinical}%` }}
            />
          </div>
        </div>

        {mohCount >= personalCeiling && (
          <div className="mt-3 flex items-center gap-2 text-red-600">
            <AlertTriangle size={14} />
            <span className="text-xs font-medium">
              Approaching personal MOH ceiling
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
