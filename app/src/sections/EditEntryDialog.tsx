import { useState } from "react";
import type { AppState, Entry } from "@/types";
import { useI18n } from "@/lib/i18n";
import { EntryFields, type EntryFieldsValue } from "@/sections/EntryFields";
import { X, Trash2, Save } from "lucide-react";

interface EditEntryDialogProps {
  entry: Entry | null;
  state: AppState;
  onClose: () => void;
  onSave: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

function toValue(entry: Entry): EntryFieldsValue {
  return {
    date: entry.date,
    time: entry.time,
    severityId: entry.severityCategoryId,
    abortiveMedicationId: entry.abortiveMedicationId,
    supportiveMedicationIds: entry.supportiveMedicationIds,
    prodromeOnly: entry.prodromeOnly,
    resolution: entry.resolution,
    notes: entry.notes,
  };
}

export function EditEntryDialog({ entry, state, onClose, onSave, onDelete }: EditEntryDialogProps) {
  const { t } = useI18n();
  const [value, setValue] = useState<EntryFieldsValue | null>(() => (entry ? toValue(entry) : null));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!entry || !value) return null;

  function handleChange(patch: Partial<EntryFieldsValue>) {
    setValue((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function handleSave() {
    if (!entry || !value || !value.severityId) return;
    onSave({
      ...entry,
      date: value.date,
      time: value.time || "00:00",
      severityCategoryId: value.severityId,
      abortiveMedicationId: value.abortiveMedicationId,
      supportiveMedicationIds: value.supportiveMedicationIds,
      prodromeOnly: value.prodromeOnly,
      resolution: value.resolution,
      notes: value.notes.trim(),
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-stone-800">{t("quickEntry.editTitle")}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            <X size={18} className="text-stone-500" />
          </button>
        </div>

        <EntryFields
          settings={state.settings}
          value={value}
          onChange={handleChange}
          compact
          defaultMoreOpen
        />

        <div className="flex gap-2 mt-5">
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
            {t("common.save")}
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-[10px] text-red-700 mb-2">{t("quickEntry.deleteConfirm")}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-1.5 bg-white border border-stone-200 rounded-lg text-[10px] font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-medium transition-colors"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
