import { useRef, useState } from "react";
import type { AppState, Entry } from "@/types";
import { generateId, formatDateInput, formatTimeInput } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { EntryFields, type EntryFieldsValue } from "@/sections/EntryFields";
import { Check } from "lucide-react";

interface QuickEntryScreenProps {
  state: AppState;
  onAddEntry: (entry: Entry) => void;
}

function emptyValue(): EntryFieldsValue {
  const now = new Date();
  return {
    date: formatDateInput(now),
    time: formatTimeInput(now),
    severityId: "",
    abortiveMedicationId: null,
    supportiveMedicationIds: [],
    prodromeOnly: false,
    resolution: "unresolved",
    notes: "",
  };
}

export function QuickEntryScreen({ state, onAddEntry }: QuickEntryScreenProps) {
  const { t } = useI18n();
  const [value, setValue] = useState<EntryFieldsValue>(emptyValue);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(patch: Partial<EntryFieldsValue>) {
    setValue((prev) => ({ ...prev, ...patch }));
    if (patch.severityId) setError("");
  }

  function handleSubmit() {
    if (!value.severityId) {
      setError(t("quickEntry.severityRequired"));
      return;
    }

    const entry: Entry = {
      id: generateId(),
      date: value.date,
      time: value.time || "00:00",
      severityCategoryId: value.severityId,
      abortiveMedicationId: value.abortiveMedicationId,
      supportiveMedicationIds: value.supportiveMedicationIds,
      prodromeOnly: value.prodromeOnly,
      resolution: value.resolution,
      notes: value.notes.trim(),
    };

    onAddEntry(entry);
    setSubmitted(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setSubmitted(false);
      setValue(emptyValue());
      setError("");
    }, 900);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6">
        <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center animate-in zoom-in-50 duration-300">
          <Check className="w-10 h-10 text-teal-600" strokeWidth={2.5} />
        </div>
        <p className="mt-4 text-lg font-medium text-teal-700">{t("quickEntry.saved")}</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-stone-800 mb-4">{t("quickEntry.title")}</h1>

      <EntryFields
        settings={state.settings}
        value={value}
        onChange={handleChange}
        severityError={error}
      />

      <button
        onClick={handleSubmit}
        className="mt-5 w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors shadow-sm active:scale-[0.98]"
      >
        {t("quickEntry.submit")}
      </button>
    </div>
  );
}
