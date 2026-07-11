import { useEffect, useMemo, useState } from "react";
import type { AppState } from "@/types";
import { cn, entryTimestamp, formatDateInput, isWithinLastDays } from "@/lib/utils";
import { localizedLabel, useI18n, type TranslationKey } from "@/lib/i18n";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface CooldownScreenProps {
  state: AppState;
}

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  return now;
}

function formatHHMM(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatFreeDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

interface Milestone {
  key: TranslationKey;
  minHours: number;
  maxHours: number;
}

const MILESTONES: Milestone[] = [
  { key: "cooldown.milestone.absorption", minHours: 0, maxHours: 1 },
  { key: "cooldown.milestone.peak", minHours: 1, maxHours: 4 },
  { key: "cooldown.milestone.halfLife", minHours: 4, maxHours: 12 },
  { key: "cooldown.milestone.resetting", minHours: 12, maxHours: 24 },
  { key: "cooldown.milestone.normalizing", minHours: 24, maxHours: 48 },
  { key: "cooldown.milestone.almostRecovered", minHours: 48, maxHours: 72 },
  { key: "cooldown.milestone.fullRecovery", minHours: 72, maxHours: Infinity },
];

export function CooldownScreen({ state }: CooldownScreenProps) {
  const { t, language } = useI18n();
  const now = useNow();
  const today = formatDateInput(new Date());

  const lastAbortiveEntry = useMemo(() => {
    return state.entries
      .filter((e) => e.abortiveMedicationId !== null)
      .sort((a, b) => entryTimestamp(b) - entryTimestamp(a))[0];
  }, [state.entries]);

  const cooldownMs = state.settings.abortiveCooldownHours * 3600000;
  const lastDoseTime = lastAbortiveEntry ? entryTimestamp(lastAbortiveEntry) : null;
  const timeSinceLastDose = lastDoseTime !== null ? now - lastDoseTime : null;
  const cooldownRemaining = timeSinceLastDose !== null ? cooldownMs - timeSinceLastDose : null;
  const available = cooldownRemaining === null || cooldownRemaining <= 0;

  const hoursSinceDose = timeSinceLastDose !== null ? timeSinceLastDose / 3600000 : null;
  const activeMilestone =
    hoursSinceDose !== null
      ? MILESTONES.find((m) => hoursSinceDose >= m.minHours && hoursSinceDose < m.maxHours)
      : null;

  const lastMedLabel = lastAbortiveEntry
    ? state.settings.abortiveMedications.find((m) => m.id === lastAbortiveEntry.abortiveMedicationId)
    : null;

  const acuteDays30 = useMemo(
    () =>
      state.entries.filter((e) => e.abortiveMedicationId !== null && isWithinLastDays(e.date, 30, today))
        .length,
    [state.entries, today]
  );

  const { personalCeilingDays, clinicalThresholdDays } = state.settings.mohThresholds;

  const mohLevel: "clear" | "caution" | "warning" =
    acuteDays30 >= clinicalThresholdDays
      ? "warning"
      : acuteDays30 >= personalCeilingDays
        ? "caution"
        : "clear";

  const mohColors = {
    clear: "bg-teal-50 border-teal-200 text-teal-700",
    caution: "bg-amber-50 border-amber-200 text-amber-700",
    warning: "bg-red-50 border-red-200 text-red-700",
  }[mohLevel];

  const mohMessages: Record<typeof mohLevel, TranslationKey> = {
    clear: "moh.clear",
    caution: "moh.caution",
    warning: "moh.warning",
  };
  const mohMessageKey = mohMessages[mohLevel];

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-stone-800 mb-4">{t("cooldown.title")}</h1>

      {/* Main timer card */}
      <div
        className={cn(
          "mb-4 p-5 rounded-2xl border-2 text-center shadow-sm",
          available ? "bg-teal-50 border-teal-200" : "bg-red-50 border-red-200"
        )}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          {available ? (
            <CheckCircle2 className="w-6 h-6 text-teal-600" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-red-500" />
          )}
          <span className={cn("text-sm font-semibold", available ? "text-teal-700" : "text-red-600")}>
            {available ? t("cooldown.available") : t("cooldown.active")}
          </span>
        </div>

        {lastAbortiveEntry === undefined ? (
          <p className="text-sm text-stone-500">{t("cooldown.neverTaken")}</p>
        ) : (
          <>
            <div className={cn("text-4xl font-bold tabular-nums", available ? "text-teal-700" : "text-red-600")}>
              {available ? formatFreeDuration(Number(timeSinceLastDose)) : formatHHMM(Number(cooldownRemaining))}
            </div>
            <p className="mt-2 text-xs text-stone-500">
              {available ? t("cooldown.freeFor") : t("cooldown.activeMessage")}
            </p>
            {lastMedLabel && (
              <p className="mt-1 text-[11px] text-stone-400">
                {t("cooldown.lastDose")}: {localizedLabel(lastMedLabel, language)} · {lastAbortiveEntry.date}{" "}
                {lastAbortiveEntry.time}
              </p>
            )}
          </>
        )}
      </div>

      {/* Milestones */}
      {lastAbortiveEntry && (
        <div className="mb-4 bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-stone-800 mb-3">{t("cooldown.milestones")}</h2>
          <div className="space-y-1.5">
            {MILESTONES.map((m) => {
              const active = activeMilestone?.key === m.key;
              return (
                <div
                  key={m.key}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                    active ? "bg-teal-100 text-teal-800 font-medium" : "text-stone-400"
                  )}
                >
                  <Clock size={12} className={active ? "text-teal-600" : "text-stone-300"} />
                  <span className="text-xs">{t(m.key)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MOH Counter */}
      <div className={cn("rounded-xl border p-4 shadow-sm", mohColors)}>
        <h2 className="text-sm font-semibold mb-2">{t("moh.title")}</h2>
        <p className="text-xs font-medium mb-3">{t(mohMessageKey)}</p>
        <div className="flex items-center justify-between text-xs mb-1">
          <span>{t("moh.acuteDays")}</span>
          <span className="font-bold">{acuteDays30}</span>
        </div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span>{t("moh.personalCeiling")}</span>
          <span className="font-medium">{personalCeilingDays}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span>{t("moh.clinicalThreshold")}</span>
          <span className="font-medium">{clinicalThresholdDays}</span>
        </div>
      </div>
    </div>
  );
}
