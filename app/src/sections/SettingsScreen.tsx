import { useState, useRef, useCallback } from "react";
import type { AppState, Pathway, SeverityCategory } from "@/types";
import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from "lucide-react";


interface SettingsScreenProps {
  state: AppState;
  onUpdateSettings: (settings: AppState["settings"]) => void;
  onImport: () => void;
  onExport: () => void;
}

export function SettingsScreen({
  state,
  onUpdateSettings,
  onImport,
  onExport,
}: SettingsScreenProps) {
  const [showPathways, setShowPathways] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importError, setImportError] = useState("");
  const importFileRef = useRef<HTMLInputElement>(null);

  const { settings } = state;

  const updatePathway = useCallback(
    (index: number, patch: Partial<Pathway>) => {
      const updated = [...settings.pathways];
      updated[index] = { ...updated[index], ...patch };
      onUpdateSettings({ ...settings, pathways: updated });
    },
    [settings, onUpdateSettings]
  );

  const updateCategory = useCallback(
    (index: number, patch: Partial<SeverityCategory>) => {
      const updated = [...settings.severity_categories];
      updated[index] = { ...updated[index], ...patch };
      onUpdateSettings({ ...settings, severity_categories: updated });
    },
    [settings, onUpdateSettings]
  );

  function handleExport() {
    const fullState = {
      ...state,
      _exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(fullState, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `migraine_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onExport();
  }

  function handleExportCSV() {
    const headers = [
      "id",
      "date",
      "time",
      "severity_category_id",
      "severity_label",
      "pathway_id",
      "pathway_label",
      "adjuvant_metoclopramide",
      "prodrome_only",
      "resolution",
      "notes",
    ];
    const rows = state.entries.map((e) => {
      const sev = state.settings.severity_categories.find(
        (c) => c.id === e.severity_category_id
      );
      const pw = state.settings.pathways.find((p) => p.id === e.pathway_id);
      return [
        e.id,
        e.date,
        e.time,
        e.severity_category_id,
        sev?.label || "",
        e.pathway_id,
        pw?.label || e.pathway_id,
        e.adjuvant_metoclopramide ? "yes" : "no",
        e.prodrome_only ? "yes" : "no",
        e.resolution,
        e.notes,
      ];
    });
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `migraine_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!parsed.settings || !parsed.entries) {
          throw new Error("Invalid backup file: missing required fields");
        }
        if (
          window.confirm(
            `Import will replace all current data (${state.entries.length} entries). Continue?`
          )
        ) {
          localStorage.setItem("migraine_app_state", JSON.stringify(parsed));
          onImport();
        }
      } catch (err: any) {
        setImportError(err.message || "Failed to parse import file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleReset() {
    if (
      window.confirm(
        "WARNING: This will delete ALL data permanently. This cannot be undone. Export a backup first if needed. Are you sure?"
      )
    ) {
      localStorage.removeItem("migraine_app_state");
      window.location.reload();
    }
  }

  const daysSinceExport = state.last_export_date
    ? Math.floor(
        (new Date().getTime() - new Date(state.last_export_date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-stone-800 mb-4">Settings</h1>

      {/* Pathways */}
      <div className="mb-3 bg-white rounded-xl border border-stone-200 overflow-hidden">
        <button
          onClick={() => setShowPathways(!showPathways)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
        >
          <span className="text-sm font-medium text-stone-700">Pathways</span>
          {showPathways ? (
            <ChevronUp size={16} className="text-stone-400" />
          ) : (
            <ChevronDown size={16} className="text-stone-400" />
          )}
        </button>
        {showPathways && (
          <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {settings.pathways.map((pw, i) => (
              <div key={pw.id} className="p-3 bg-stone-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pw.label}
                    onChange={(e) =>
                      updatePathway(i, { label: e.target.value })
                    }
                    className="flex-1 px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                  <input
                    type="color"
                    value={pw.color}
                    onChange={(e) =>
                      updatePathway(i, { color: e.target.value })
                    }
                    className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">Cooldown (h):</span>
                  <input
                    type="number"
                    value={pw.cooldown_hours ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      updatePathway(i, {
                        cooldown_hours: val === "" ? null : parseInt(val),
                      });
                    }}
                    placeholder="None"
                    className="w-20 px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Severity Categories */}
      <div className="mb-3 bg-white rounded-xl border border-stone-200 overflow-hidden">
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
        >
          <span className="text-sm font-medium text-stone-700">
            Severity Categories
          </span>
          {showCategories ? (
            <ChevronUp size={16} className="text-stone-400" />
          ) : (
            <ChevronDown size={16} className="text-stone-400" />
          )}
        </button>
        {showCategories && (
          <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {settings.severity_categories.map((cat, i) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg"
              >
                <input
                  type="text"
                  value={cat.label}
                  onChange={(e) =>
                    updateCategory(i, { label: e.target.value })
                  }
                  className="flex-1 px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
                <input
                  type="color"
                  value={cat.color}
                  onChange={(e) =>
                    updateCategory(i, { color: e.target.value })
                  }
                  className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MOH Thresholds */}
      <div className="mb-3 bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="text-sm font-medium text-stone-700 mb-3">MOH Thresholds</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[10px] text-stone-500 mb-1 uppercase">
              Personal ceiling
            </label>
            <input
              type="number"
              value={settings.moh_thresholds.personal_ceiling_days}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  moh_thresholds: {
                    ...settings.moh_thresholds,
                    personal_ceiling_days: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] text-stone-500 mb-1 uppercase">
              Clinical threshold
            </label>
            <input
              type="number"
              value={settings.moh_thresholds.clinical_threshold_days}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  moh_thresholds: {
                    ...settings.moh_thresholds,
                    clinical_threshold_days: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
        </div>
      </div>

      {/* AI Settings */}
      <div className="mb-3 bg-white rounded-xl border border-stone-200 overflow-hidden">
        <button
          onClick={() => setShowAi(!showAi)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
        >
          <span className="text-sm font-medium text-stone-700">AI Settings</span>
          {showAi ? (
            <ChevronUp size={16} className="text-stone-400" />
          ) : (
            <ChevronDown size={16} className="text-stone-400" />
          )}
        </button>
        {showAi && (
          <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-[10px] text-stone-500 mb-1 uppercase">
                OpenRouter API Key
              </label>
              <input
                type="password"
                value={settings.ai_api_key}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, ai_api_key: e.target.value })
                }
                placeholder="sk-or-..."
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
            <div>
              <label className="block text-[10px] text-stone-500 mb-1 uppercase">
                Custom Prompt
              </label>
              <textarea
                value={settings.ai_custom_prompt}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    ai_custom_prompt: e.target.value,
                  })
                }
                rows={4}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="mb-3 bg-white rounded-xl border border-stone-200 overflow-hidden">
        <button
          onClick={() => setShowData(!showData)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
        >
          <span className="text-sm font-medium text-stone-700">Data</span>
          {showData ? (
            <ChevronUp size={16} className="text-stone-400" />
          ) : (
            <ChevronDown size={16} className="text-stone-400" />
          )}
        </button>
        {showData && (
          <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {daysSinceExport !== null && (
              <p className="text-[10px] text-stone-500 mb-2">
                Last exported: {daysSinceExport === 0 ? "today" : `${daysSinceExport} day${daysSinceExport !== 1 ? "s" : ""} ago`}
              </p>
            )}
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-lg text-xs font-medium text-stone-700 transition-colors"
            >
              <Download size={14} />
              Export JSON Backup
            </button>
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-lg text-xs font-medium text-stone-700 transition-colors"
            >
              <FileSpreadsheet size={14} />
              Export CSV
            </button>
            <button
              onClick={() => importFileRef.current?.click()}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-lg text-xs font-medium text-stone-700 transition-colors"
            >
              <Upload size={14} />
              Import Backup
            </button>
            <input
              ref={importFileRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            {importError && (
              <p className="text-xs text-red-600">{importError}</p>
            )}
            <hr className="border-stone-200 my-2" />
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-medium text-red-700 transition-colors"
            >
              <Trash2 size={14} />
              Reset All Data
            </button>
          </div>
        )}
      </div>

      {/* Reset confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-red-500" />
              <h3 className="text-base font-semibold text-stone-800">
                Reset All Data?
              </h3>
            </div>
            <p className="text-xs text-stone-600 mb-5">
              This will permanently delete all entries and settings. Export a backup first if you want to keep anything.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-medium text-stone-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-medium text-white transition-colors"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entries count */}
      <p className="text-center text-[10px] text-stone-400 mt-4">
        {state.entries.length} entries stored locally
      </p>
    </div>
  );
}
