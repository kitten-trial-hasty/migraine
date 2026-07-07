import { useState, useMemo } from "react";
import type { AppState, Entry } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarScreen({ state, onEditEntry }: CalendarScreenProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

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

  function getDayColor(dateStr: string): string | null {
    const entries = monthEntries.get(dateStr);
    if (!entries || entries.length === 0) return null;
    // Use the most severe
    let mostSevere = entries[0];
    let highestRank = -1;
    const catIndex = new Map(state.settings.severity_categories.map((c, i) => [c.id, i]));
    for (const e of entries) {
      const rank = catIndex.get(e.severity_category_id) ?? -1;
      if (rank > highestRank) {
        highestRank = rank;
        mostSevere = e;
      }
    }
    const cat = state.settings.severity_categories.find(
      (c) => c.id === mostSevere.severity_category_id
    );
    return cat?.color || null;
  }

  function hasPathway(dateStr: string): boolean {
    const entries = monthEntries.get(dateStr);
    return entries?.some((e) => e.pathway_id !== "none") ?? false;
  }

  function getEntriesForDay(dateStr: string): Entry[] {
    return monthEntries.get(dateStr) || [];
  }

  const monthName = new Date(viewYear, viewMonth).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-stone-800">Calendar</h1>
        <button
          onClick={goToToday}
          className="text-xs font-medium text-teal-600 hover:text-teal-700 px-3 py-1.5 rounded-lg bg-teal-50"
        >
          Today
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-stone-100 transition-colors"
        >
          <ChevronLeft size={20} className="text-stone-600" />
        </button>
        <h2 className="text-base font-semibold text-stone-700">{monthName}</h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-stone-100 transition-colors"
        >
          <ChevronRight size={20} className="text-stone-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-stone-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const bgColor = getDayColor(dateStr);
          const pwUsed = hasPathway(dateStr);
          const isToday =
            today.getFullYear() === viewYear &&
            today.getMonth() === viewMonth &&
            today.getDate() === day;
          const entries = getEntriesForDay(dateStr);

          return (
            <button
              key={day}
              onClick={() => {
                if (entries.length > 0) {
                  onEditEntry(entries[0]);
                }
              }}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all",
                bgColor ? "hover:scale-105" : "hover:bg-stone-100",
                isToday && !bgColor && "border-2 border-teal-400 bg-teal-50"
              )}
              style={bgColor ? { backgroundColor: bgColor + "77" } : undefined}
            >
              <span
                className={cn(
                  "text-xs font-medium",
                  isToday ? "text-teal-700" : "text-stone-700"
                )}
              >
                {day}
              </span>
              {pwUsed && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-stone-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-2">
        {state.settings.severity_categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-[10px] text-stone-500">{cat.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="w-1.5 h-1.5 rounded-full bg-stone-500" />
          <span className="text-[10px] text-stone-500">Pathway used</span>
        </div>
      </div>
    </div>
  );
}
