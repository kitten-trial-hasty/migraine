import { useMemo, useState } from "react";
import type { AppState, Entry } from "@/types";
import { cn } from "@/lib/utils";
import { localizedLabel, useI18n } from "@/lib/i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarScreenProps {
  state: AppState;
  onEditEntry: (entry: Entry) => void;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function CalendarScreen({ state, onEditEntry }: CalendarScreenProps) {
  const { t, language } = useI18n();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const locale = language === "bg" ? "bg-BG" : "en-US";
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const weekdayLabels = useMemo(() => {
    const base = new Date(2024, 0, 7); // a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toLocaleDateString(locale, { weekday: "short" });
    });
  }, [locale]);

  const severityRank = useMemo(
    () => new Map(state.settings.severityCategories.map((c, i) => [c.id, i])),
    [state.settings.severityCategories]
  );

  const monthEntries = useMemo(() => {
    const map = new Map<string, Entry[]>();
    state.entries.forEach((e) => {
      const d = new Date(e.date + "T00:00:00");
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        const existing = map.get(e.date) || [];
        existing.push(e);
        map.set(e.date, existing);
      }
    });
    return map;
  }, [state.entries, viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function goToToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

  function worstEntry(entries: Entry[]): Entry {
    return entries.reduce((worst, e) => {
      const rank = severityRank.get(e.severityCategoryId) ?? -1;
      const worstRank = severityRank.get(worst.severityCategoryId) ?? -1;
      return rank > worstRank ? e : worst;
    }, entries[0]);
  }

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-stone-800">{t("calendar.title")}</h1>
        <button
          onClick={goToToday}
          className="text-xs font-medium text-teal-600 hover:text-teal-700 px-3 py-1.5 rounded-lg bg-teal-50"
        >
          {t("common.today")}
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-stone-100 transition-colors">
          <ChevronLeft size={20} className="text-stone-600" />
        </button>
        <h2 className="text-base font-semibold text-stone-700 capitalize">{monthLabel}</h2>
        <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-stone-100 transition-colors">
          <ChevronRight size={20} className="text-stone-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdayLabels.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-stone-400 py-1 capitalize">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const entries = monthEntries.get(dateStr) || [];
          const worst = entries.length > 0 ? worstEntry(entries) : null;
          const cat = worst
            ? state.settings.severityCategories.find((c) => c.id === worst.severityCategoryId)
            : null;
          const abortiveUsed = entries.some((e) => e.abortiveMedicationId !== null);
          const isToday =
            today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

          return (
            <button
              key={day}
              onClick={() => entries.length > 0 && onEditEntry(entries[0])}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all",
                cat ? "hover:scale-105" : "hover:bg-stone-100",
                isToday && !cat && "border-2 border-teal-400 bg-teal-50"
              )}
              style={cat ? { backgroundColor: cat.color + "99" } : undefined}
            >
              <span className={cn("text-xs font-medium", isToday ? "text-teal-700" : "text-stone-700")}>
                {day}
              </span>
              {abortiveUsed && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-stone-600" />}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {state.settings.severityCategories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="text-[10px] text-stone-500">{localizedLabel(cat, language)}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="w-1.5 h-1.5 rounded-full bg-stone-600" />
          <span className="text-[10px] text-stone-500">{t("calendar.abortiveUsed")}</span>
        </div>
      </div>
    </div>
  );
}
