import { useState, useRef } from "react";
import type { AppState, Entry, Resolution } from "@/types";
import { generateId, formatDateInput, formatTimeInput } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuickEntryScreenProps {
  state: AppState;
  onAddEntry: (entry: Entry) => void;
}

export function QuickEntryScreen({ state, onAddEntry }: QuickEntryScreenProps) {
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [time, setTime] = useState(formatTimeInput(new Date()));
  const [severityId, setSeverityId] = useState<string>("");
  const [pathwayId, setPathwayId] = useState<string>("none");
  const [adjuvant, setAdjuvant] = useState(false);
  const [prodromeOnly, setProdromeOnly] = useState(false);
  const [resolution, setResolution] = useState<Resolution>("unresolved");
  const [notes, setNotes] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { settings } = state;

  function clearTime() {
    setTime("00:00");
  }

  function resetForm() {
    setDate(formatDateInput(new Date()));
    setTime(formatTimeInput(new Date()));
    setSeverityId("");
    setPathwayId("none");
    setAdjuvant(false);
    setProdromeOnly(false);
    setResolution("unresolved");
    setNotes("");
    setShowMore(false);
    setError("");
  }

  function handleSubmit() {
    if (!severityId) {
      setError("Please select a severity level");
      return;
    }

    const entry: Entry = {
      id: generateId(),
      date,
      time: time || "00:00",
      severity_category_id: severityId,
      pathway_id: pathwayId,
      adjuvant_metoclopramide: adjuvant,
      prodrome_only: prodromeOnly,
      resolution,
      notes: notes.trim(),
    };

    onAddEntry(entry);
    setSubmitted(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setSubmitted(false);
      resetForm();
    }, 1200);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6">
        <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center animate-in zoom-in-50 duration-300">
          <Check className="w-10 h-10 text-teal-600" strokeWidth={2.5} />
        </div>
        <p className="mt-4 text-lg font-medium text-teal-700">Saved</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-stone-800 mb-4">New Entry</h1>

      {/* Date & Time */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wider">
          Date & Time
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent"
          />
          <div className="relative">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent w-[110px]"
            />
            <button
              onClick={clearTime}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              title="Clear time to 00:00"
            >
              <Clock size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Severity - Mandatory */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
          Severity <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-5 gap-2">
          {settings.severity_categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSeverityId(cat.id);
                setError("");
              }}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-1 rounded-xl border-2 transition-all duration-200",
                severityId === cat.id
                  ? "border-stone-400 shadow-sm scale-[1.02]"
                  : "border-transparent hover:border-stone-200"
              )}
              style={{
                backgroundColor: cat.color + (severityId === cat.id ? "" : "88"),
              }}
            >
              <span className="text-[10px] font-medium text-stone-700 leading-tight text-center">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>

      {/* Pathway */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
          Pathway Used
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPathwayId("none")}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all",
              pathwayId === "none"
                ? "border-stone-400 bg-stone-100 text-stone-700"
                : "border-transparent bg-stone-100 text-stone-500 hover:border-stone-300"
            )}
          >
            None
          </button>
          {settings.pathways.map((pw) => (
            <button
              key={pw.id}
              onClick={() => setPathwayId(pw.id)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all",
                pathwayId === pw.id
                  ? "border-stone-400 shadow-sm"
                  : "border-transparent hover:border-stone-200"
              )}
              style={{
                backgroundColor: pw.color + (pathwayId === pw.id ? "" : "66"),
              }}
            >
              {pw.label}
            </button>
          ))}
        </div>
      </div>

      {/* More options toggle */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-700 mb-2 transition-colors"
      >
        {showMore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        More options
      </button>

      {/* Expanded options */}
      {showMore && (
        <div className="space-y-4 mb-4 animate-in slide-in-from-top-2 duration-200">
          {/* Adjuvant & Prodrome toggles */}
          <div className="flex gap-3">
            <label className="flex items-center gap-2 px-3 py-2.5 bg-white border border-stone-200 rounded-xl cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={adjuvant}
                onChange={(e) => setAdjuvant(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-teal-600 focus:ring-teal-300"
              />
              <span className="text-xs font-medium text-stone-600">Metoclopramide</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2.5 bg-white border border-stone-200 rounded-xl cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={prodromeOnly}
                onChange={(e) => setProdromeOnly(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-teal-600 focus:ring-teal-300"
              />
              <span className="text-xs font-medium text-stone-600">Prodrome only</span>
            </label>
          </div>

          {/* Resolution */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
              Resolution
            </label>
            <div className="flex gap-2">
              {(
                [
                  { value: "medication", label: "Medication" },
                  { value: "sleep", label: "Sleep" },
                  { value: "behavioral", label: "Behavioral" },
                  { value: "unresolved", label: "Unresolved" },
                ] as { value: Resolution; label: string }[]
              ).map((r) => (
                <button
                  key={r.value}
                  onClick={() => setResolution(r.value)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all",
                    resolution === r.value
                      ? "border-teal-400 bg-teal-50 text-teal-700"
                      : "border-transparent bg-stone-100 text-stone-500 hover:border-stone-300"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent resize-none"
              placeholder="Optional notes..."
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors shadow-sm active:scale-[0.98]"
      >
        Save Entry
      </button>
    </div>
  );
}
