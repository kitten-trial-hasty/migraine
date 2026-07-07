import { useState, useEffect } from "react";
import type { AppState, Entry, Resolution } from "@/types";
import { X, Trash2, Save, Clock } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EditEntryDialogProps {
  entry: Entry | null;
  state: AppState;
  onClose: () => void;
  onSave: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

export function EditEntryDialog({
  entry,
  state,
  onClose,
  onSave,
  onDelete,
}: EditEntryDialogProps) {
  const [date, setDate] = useState(entry?.date || "");
  const [time, setTime] = useState(entry?.time || "00:00");
  const [severityId, setSeverityId] = useState(entry?.severity_category_id || "");
  const [pathwayId, setPathwayId] = useState(entry?.pathway_id || "none");
  const [adjuvant, setAdjuvant] = useState(entry?.adjuvant_metoclopramide || false);
  const [prodromeOnly, setProdromeOnly] = useState(entry?.prodrome_only || false);
  const [resolution, setResolution] = useState<Resolution>(
    entry?.resolution || "unresolved"
  );
  const [notes, setNotes] = useState(entry?.notes || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (entry) {
      setDate(entry.date);
      setTime(entry.time);
      setSeverityId(entry.severity_category_id);
      setPathwayId(entry.pathway_id);
      setAdjuvant(entry.adjuvant_metoclopramide);
      setProdromeOnly(entry.prodrome_only);
      setResolution(entry.resolution);
      setNotes(entry.notes);
      setShowDeleteConfirm(false);
    }
  }, [entry]);

  if (!entry) return null;

  function clearTime() {
    setTime("00:00");
  }

  function handleSave() {
    if (!severityId || !entry) return;
    onSave({
      ...entry,
      date,
      time: time || "00:00",
      severity_category_id: severityId,
      pathway_id: pathwayId,
      adjuvant_metoclopramide: adjuvant,
      prodrome_only: prodromeOnly,
      resolution,
      notes: notes.trim(),
    });
    onClose();
  }

  function handleDelete() {
    if (!entry) return;
    onDelete(entry.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-stone-800">Edit Entry</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X size={18} className="text-stone-500" />
          </button>
        </div>

        {/* Date & Time */}
        <div className="mb-3">
          <label className="block text-[10px] font-medium text-stone-500 mb-1 uppercase tracking-wider">
            Date & Time
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 px-2.5 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <div className="relative">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="px-2.5 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300 w-[100px]"
              />
              <button
                onClick={clearTime}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <Clock size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Severity */}
        <div className="mb-3">
          <label className="block text-[10px] font-medium text-stone-500 mb-1.5 uppercase tracking-wider">
            Severity
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {state.settings.severity_categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSeverityId(cat.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-0.5 rounded-xl border-2 transition-all",
                  severityId === cat.id
                    ? "border-stone-400 shadow-sm"
                    : "border-transparent hover:border-stone-200"
                )}
                style={{
                  backgroundColor: cat.color + (severityId === cat.id ? "" : "88"),
                }}
              >
                <span className="text-[9px] font-medium text-stone-700 leading-tight text-center">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pathway */}
        <div className="mb-3">
          <label className="block text-[10px] font-medium text-stone-500 mb-1.5 uppercase tracking-wider">
            Pathway
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setPathwayId("none")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-[10px] font-medium border-2 transition-all",
                pathwayId === "none"
                  ? "border-stone-400 bg-stone-100 text-stone-700"
                  : "border-transparent bg-stone-100 text-stone-500"
              )}
            >
              None
            </button>
            {state.settings.pathways.map((pw) => (
              <button
                key={pw.id}
                onClick={() => setPathwayId(pw.id)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[10px] font-medium border-2 transition-all",
                  pathwayId === pw.id
                    ? "border-stone-400"
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

        {/* Toggles */}
        <div className="flex gap-2 mb-3">
          <label className="flex items-center gap-1.5 px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={adjuvant}
              onChange={(e) => setAdjuvant(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-stone-300 text-teal-600"
            />
            <span className="text-[10px] font-medium text-stone-600">
              Metoclopramide
            </span>
          </label>
          <label className="flex items-center gap-1.5 px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={prodromeOnly}
              onChange={(e) => setProdromeOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-stone-300 text-teal-600"
            />
            <span className="text-[10px] font-medium text-stone-600">
              Prodrome only
            </span>
          </label>
        </div>

        {/* Resolution */}
        <div className="mb-3">
          <label className="block text-[10px] font-medium text-stone-500 mb-1.5 uppercase tracking-wider">
            Resolution
          </label>
          <div className="flex gap-1.5">
            {(
              [
                { value: "medication", label: "Meds" },
                { value: "sleep", label: "Sleep" },
                { value: "behavioral", label: "Behav" },
                { value: "unresolved", label: "Open" },
              ] as { value: Resolution; label: string }[]
            ).map((r) => (
              <button
                key={r.value}
                onClick={() => setResolution(r.value)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-[10px] font-medium border-2 transition-all",
                  resolution === r.value
                    ? "border-teal-400 bg-teal-50 text-teal-700"
                    : "border-transparent bg-stone-100 text-stone-500"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-[10px] font-medium text-stone-500 mb-1 uppercase tracking-wider">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-2.5 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors shrink-0"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-medium transition-colors"
          >
            <Save size={14} />
            Save Changes
          </button>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-[10px] text-red-700 mb-2">
              Delete this entry permanently?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-1.5 bg-white border border-stone-200 rounded-lg text-[10px] font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
