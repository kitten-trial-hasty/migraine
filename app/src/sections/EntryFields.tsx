import { useState } from "react";
import type { Resolution, Settings } from "@/types";
import { cn } from "@/lib/utils";
import { localizedLabel, useI18n, type TranslationKey } from "@/lib/i18n";
import { ChevronDown, ChevronUp, X } from "lucide-react";

export interface EntryFieldsValue {
  date: string;
  time: string;
  severityId: string;
  abortiveMedicationId: string | null;
  supportiveMedicationIds: string[];
  prodromeOnly: boolean;
  resolution: Resolution;
  notes: string;
}

interface EntryFieldsProps {
  settings: Settings;
  value: EntryFieldsValue;
  onChange: (patch: Partial<EntryFieldsValue>) => void;
  severityError?: string;
  defaultMoreOpen?: boolean;
  compact?: boolean;
}

const RESOLUTIONS: { value: Resolution; key: TranslationKey }[] = [
  { value: "medication", key: "quickEntry.medication" },
  { value: "sleep", key: "quickEntry.sleep" },
  { value: "behavioral", key: "quickEntry.behavioral" },
  { value: "unresolved", key: "quickEntry.unresolved" },
];

export function EntryFields({
  settings,
  value,
  onChange,
  severityError,
  defaultMoreOpen = false,
  compact = false,
}: EntryFieldsProps) {
  const { t, language } = useI18n();
  const [showMore, setShowMore] = useState(defaultMoreOpen);

  const labelCls = cn(
    "block font-medium text-stone-500 uppercase tracking-wider",
    compact ? "text-[10px] mb-1" : "text-xs mb-1.5"
  );

  function toggleSupportive(id: string) {
    const set = new Set(value.supportiveMedicationIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange({ supportiveMedicationIds: Array.from(set) });
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {/* Date & Time */}
      <div>
        <label className={labelCls}>
          {t("quickEntry.date")} / {t("quickEntry.time")}
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            value={value.date}
            onChange={(e) => onChange({ date: e.target.value })}
            className={cn(
              "flex-1 bg-white border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent",
              compact ? "px-2.5 py-2 text-xs" : "px-3 py-2.5 text-sm"
            )}
          />
          <div className="relative">
            <input
              type="time"
              value={value.time}
              onChange={(e) => onChange({ time: e.target.value })}
              className={cn(
                "bg-white border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent",
                compact ? "px-2.5 py-2 text-xs w-[104px]" : "px-3 py-2.5 text-sm w-[120px]"
              )}
            />
            <button
              type="button"
              onClick={() => onChange({ time: "00:00" })}
              title={t("quickEntry.clearTime")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Severity - mandatory */}
      <div>
        <label className={labelCls}>
          {t("quickEntry.severity")} <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {settings.severityCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange({ severityId: cat.id })}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-200",
                compact ? "py-2 px-0.5" : "py-3 px-1",
                value.severityId === cat.id
                  ? "border-stone-400 shadow-sm scale-[1.02]"
                  : "border-transparent hover:border-stone-200"
              )}
              style={{
                backgroundColor: cat.color + (value.severityId === cat.id ? "" : "99"),
              }}
            >
              <span
                className={cn(
                  "font-medium text-stone-700 leading-tight text-center",
                  compact ? "text-[9px]" : "text-[10px]"
                )}
              >
                {localizedLabel(cat, language)}
              </span>
            </button>
          ))}
        </div>
        {severityError && <p className="mt-1.5 text-xs text-red-500">{severityError}</p>}
      </div>

      {/* Abortive medication */}
      <div>
        <label className={labelCls}>{t("quickEntry.abortiveMed")}</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ abortiveMedicationId: null })}
            className={cn(
              "rounded-xl font-medium border-2 transition-all",
              compact ? "px-2.5 py-1.5 text-[10px]" : "px-3 py-2 text-xs",
              value.abortiveMedicationId === null
                ? "border-stone-400 bg-stone-100 text-stone-700"
                : "border-transparent bg-stone-100 text-stone-500 hover:border-stone-300"
            )}
          >
            {t("quickEntry.none")}
          </button>
          {settings.abortiveMedications.map((med) => (
            <button
              key={med.id}
              type="button"
              onClick={() => onChange({ abortiveMedicationId: med.id })}
              className={cn(
                "rounded-xl font-medium border-2 transition-all",
                compact ? "px-2.5 py-1.5 text-[10px]" : "px-3 py-2 text-xs",
                value.abortiveMedicationId === med.id
                  ? "border-stone-400 shadow-sm"
                  : "border-transparent hover:border-stone-200"
              )}
              style={{
                backgroundColor: med.color + (value.abortiveMedicationId === med.id ? "" : "77"),
              }}
            >
              {localizedLabel(med, language)}
            </button>
          ))}
        </div>
      </div>

      {/* More options toggle */}
      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors"
      >
        {showMore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {t("quickEntry.moreOptions")}
      </button>

      {showMore && (
        <div className={cn(compact ? "space-y-3" : "space-y-4", "animate-in slide-in-from-top-2 duration-200")}>
          {/* Supportive medications */}
          {settings.supportiveMedications.length > 0 && (
            <div>
              <label className={labelCls}>{t("quickEntry.supportiveMeds")}</label>
              <div className="flex flex-wrap gap-2">
                {settings.supportiveMedications.map((med) => {
                  const checked = value.supportiveMedicationIds.includes(med.id);
                  return (
                    <label
                      key={med.id}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl border cursor-pointer",
                        compact ? "px-2.5 py-1.5 text-[10px]" : "px-3 py-2 text-xs",
                        checked ? "border-stone-400 bg-stone-100" : "border-stone-200 bg-white"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSupportive(med.id)}
                        className="w-3.5 h-3.5 rounded border-stone-300 text-teal-600 focus:ring-teal-300"
                      />
                      <span className="font-medium text-stone-600">{localizedLabel(med, language)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prodrome toggle */}
          <label
            className={cn(
              "flex items-center gap-2 bg-white border border-stone-200 rounded-xl cursor-pointer",
              compact ? "px-2.5 py-2" : "px-3 py-2.5"
            )}
          >
            <input
              type="checkbox"
              checked={value.prodromeOnly}
              onChange={(e) => onChange({ prodromeOnly: e.target.checked })}
              className="w-4 h-4 rounded border-stone-300 text-teal-600 focus:ring-teal-300"
            />
            <span className={cn("font-medium text-stone-600", compact ? "text-[10px]" : "text-xs")}>
              {t("quickEntry.prodrome")}
            </span>
          </label>

          {/* Resolution */}
          <div>
            <label className={labelCls}>{t("quickEntry.resolution")}</label>
            <div className="flex gap-1.5">
              {RESOLUTIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => onChange({ resolution: r.value })}
                  className={cn(
                    "flex-1 rounded-xl font-medium border-2 transition-all",
                    compact ? "py-1.5 text-[10px]" : "py-2 text-xs",
                    value.resolution === r.value
                      ? "border-teal-400 bg-teal-50 text-teal-700"
                      : "border-transparent bg-stone-100 text-stone-500 hover:border-stone-300"
                  )}
                >
                  {t(r.key)}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>{t("quickEntry.notes")}</label>
            <textarea
              value={value.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              rows={2}
              placeholder={t("quickEntry.notesPlaceholder")}
              className={cn(
                "w-full bg-white border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent resize-none",
                compact ? "px-2.5 py-2 text-xs" : "px-3 py-2.5 text-sm"
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
