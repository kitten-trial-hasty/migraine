import { useRef, useState, type ReactNode } from "react";
import type { AppState, Language } from "@/types";
import { isValidBackup } from "@/data/defaults";
import { useI18n, localizedLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { NamedListEditor } from "@/sections/NamedListEditor";
import {
  Download,
  Upload,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
  RefreshCw,
} from "lucide-react";

interface SettingsScreenProps {
  state: AppState;
  onUpdateSettings: (settings: AppState["settings"]) => void;
  onImport: () => void;
  onExport: () => void;
}

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="mb-3 bg-white rounded-xl border border-stone-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
      >
        <span className="text-sm font-medium text-stone-700">{title}</span>
        {open ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">{children}</div>}
    </div>
  );
}

export function SettingsScreen({ state, onUpdateSettings, onImport, onExport }: SettingsScreenProps) {
  const { t, language } = useI18n();
  const { settings } = state;

  const [openSection, setOpenSection] = useState<string | null>(null);
  const [showHowTo, setShowHowTo] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [importError, setImportError] = useState("");
  const importFileRef = useRef<HTMLInputElement>(null);

  function toggle(key: string) {
    setOpenSection((prev) => (prev === key ? null : key));
  }

  function setLanguage(lang: Language) {
    onUpdateSettings({ ...settings, language: lang });
  }

  async function fetchModels() {
    setFetchingModels(true);
    setFetchError("");
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${settings.ai.apiKey}` },
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const ids: string[] = (data.data ?? []).map((m: { id: string }) => m.id).sort();
      setModelOptions(ids);
    } catch {
      setFetchError(t("settings.ai.fetchError"));
      setModelOptions([]);
    } finally {
      setFetchingModels(false);
    }
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `migraine_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onExport();
  }

  function handleExportCSV() {
    const abortiveById = new Map(settings.abortiveMedications.map((m) => [m.id, m]));
    const supportiveById = new Map(settings.supportiveMedications.map((m) => [m.id, m]));
    const severityById = new Map(settings.severityCategories.map((c) => [c.id, c]));

    const headers = [
      "id",
      "date",
      "time",
      "severity",
      "abortiveMedication",
      "supportiveMedications",
      "prodromeOnly",
      "resolution",
      "notes",
    ];
    const rows = state.entries.map((e) => [
      e.id,
      e.date,
      e.time,
      severityById.get(e.severityCategoryId) ? localizedLabel(severityById.get(e.severityCategoryId)!, language) : e.severityCategoryId,
      e.abortiveMedicationId
        ? localizedLabel(abortiveById.get(e.abortiveMedicationId) ?? { label_bg: "", label_en: "" }, language)
        : "",
      e.supportiveMedicationIds
        .map((id) => (supportiveById.get(id) ? localizedLabel(supportiveById.get(id)!, language) : id))
        .join("; "),
      e.prodromeOnly ? "yes" : "no",
      e.resolution,
      e.notes,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
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
        if (!isValidBackup(parsed)) throw new Error(t("settings.data.importError"));
        if (window.confirm(t("settings.data.importConfirm", { n: state.entries.length }))) {
          localStorage.setItem("migraine_app_state", JSON.stringify(parsed));
          onImport();
        }
      } catch {
        setImportError(t("settings.data.importError"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const daysSinceExport = state.lastExportDate
    ? Math.floor((Date.now() - new Date(state.lastExportDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const inputCls =
    "w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-300";
  const labelCls = "block text-[10px] text-stone-500 mb-1 uppercase tracking-wider";

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-stone-800 mb-4">{t("settings.title")}</h1>

      {/* Language */}
      <div className="mb-3 bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="text-sm font-medium text-stone-700 mb-3">{t("settings.language")}</h3>
        <div className="flex gap-2">
          {(["bg", "en"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-medium border-2 transition-all",
                settings.language === lang
                  ? "border-teal-400 bg-teal-50 text-teal-700"
                  : "border-transparent bg-stone-100 text-stone-500"
              )}
            >
              {lang === "bg" ? t("settings.languageBg") : t("settings.languageEn")}
            </button>
          ))}
        </div>
      </div>

      {/* Abortive medications */}
      <Section title={t("settings.abortiveMeds.title")} open={openSection === "abortive"} onToggle={() => toggle("abortive")}>
        <NamedListEditor
          items={settings.abortiveMedications}
          onChange={(items) => onUpdateSettings({ ...settings, abortiveMedications: items })}
          addLabel={t("settings.addMedication")}
        />
      </Section>

      {/* Supportive medications */}
      <Section
        title={t("settings.supportiveMeds.title")}
        open={openSection === "supportive"}
        onToggle={() => toggle("supportive")}
      >
        <NamedListEditor
          items={settings.supportiveMedications}
          onChange={(items) => onUpdateSettings({ ...settings, supportiveMedications: items })}
          addLabel={t("settings.addMedication")}
        />
      </Section>

      {/* Cooldown */}
      <div className="mb-3 bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="text-sm font-medium text-stone-700 mb-3">{t("settings.cooldown.title")}</h3>
        <label className={labelCls}>{t("settings.cooldown.hours")}</label>
        <input
          type="number"
          min={0}
          value={settings.abortiveCooldownHours}
          onChange={(e) => onUpdateSettings({ ...settings, abortiveCooldownHours: parseInt(e.target.value) || 0 })}
          className={inputCls}
        />
      </div>

      {/* Severity categories */}
      <Section
        title={t("settings.severity.title")}
        open={openSection === "severity"}
        onToggle={() => toggle("severity")}
      >
        <NamedListEditor
          items={settings.severityCategories}
          onChange={(items) => onUpdateSettings({ ...settings, severityCategories: items })}
          addLabel={t("settings.addCategory")}
        />
      </Section>

      {/* MOH thresholds */}
      <div className="mb-3 bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="text-sm font-medium text-stone-700 mb-3">{t("settings.moh.title")}</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelCls}>{t("settings.moh.personalCeiling")}</label>
            <input
              type="number"
              min={0}
              value={settings.mohThresholds.personalCeilingDays}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  mohThresholds: { ...settings.mohThresholds, personalCeilingDays: parseInt(e.target.value) || 0 },
                })
              }
              className={inputCls}
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>{t("settings.moh.clinicalThreshold")}</label>
            <input
              type="number"
              min={0}
              value={settings.mohThresholds.clinicalThresholdDays}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  mohThresholds: { ...settings.mohThresholds, clinicalThresholdDays: parseInt(e.target.value) || 0 },
                })
              }
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* AI settings */}
      <Section title={t("settings.ai.title")} open={openSection === "ai"} onToggle={() => toggle("ai")}>
        <div>
          <label className={labelCls}>{t("settings.ai.apiKey")}</label>
          <input
            type="password"
            value={settings.ai.apiKey}
            onChange={(e) => onUpdateSettings({ ...settings, ai: { ...settings.ai, apiKey: e.target.value } })}
            placeholder="sk-or-..."
            className={inputCls}
          />
          <button
            onClick={() => setShowHowTo(true)}
            className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-teal-600 hover:text-teal-700"
          >
            <ExternalLink size={11} />
            {t("settings.ai.howToLink")}
          </button>
        </div>

        <div>
          <label className={labelCls}>{t("settings.ai.model")}</label>
          <input
            type="text"
            value={settings.ai.model}
            onChange={(e) => onUpdateSettings({ ...settings, ai: { ...settings.ai, model: e.target.value } })}
            placeholder={t("settings.ai.modelPlaceholder")}
            className={inputCls}
          />
          <button
            onClick={fetchModels}
            disabled={!settings.ai.apiKey || fetchingModels}
            className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 rounded-lg text-[10px] font-medium text-stone-600 transition-colors"
          >
            <RefreshCw size={11} className={fetchingModels ? "animate-spin" : ""} />
            {fetchingModels ? t("settings.ai.fetchingModels") : t("settings.ai.fetchModels")}
          </button>
          {fetchError && <p className="mt-1.5 text-[10px] text-red-600">{fetchError}</p>}
          {modelOptions.length > 0 && (
            <select
              value={settings.ai.model}
              onChange={(e) => onUpdateSettings({ ...settings, ai: { ...settings.ai, model: e.target.value } })}
              className={cn(inputCls, "mt-1.5")}
            >
              {modelOptions.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className={labelCls}>{t("settings.ai.customPrompt")}</label>
          <textarea
            value={settings.ai.customPrompt}
            onChange={(e) => onUpdateSettings({ ...settings, ai: { ...settings.ai, customPrompt: e.target.value } })}
            rows={5}
            className={cn(inputCls, "resize-none")}
          />
        </div>

        <div>
          <label className={labelCls}>{t("settings.ai.personalInfo")}</label>
          <textarea
            value={settings.ai.personalInfo}
            onChange={(e) => onUpdateSettings({ ...settings, ai: { ...settings.ai, personalInfo: e.target.value } })}
            rows={4}
            placeholder={t("settings.ai.personalInfoPlaceholder")}
            className={cn(inputCls, "resize-none")}
          />
        </div>
      </Section>

      {/* Data management */}
      <Section title={t("settings.data.title")} open={openSection === "data"} onToggle={() => toggle("data")}>
        <p className="text-[10px] text-stone-500">
          {daysSinceExport === null
            ? t("settings.data.lastExportedNever")
            : daysSinceExport === 0
              ? t("settings.data.lastExportedToday")
              : t("settings.data.lastExported", { n: daysSinceExport })}
        </p>
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-lg text-xs font-medium text-stone-700 transition-colors"
        >
          <Download size={14} />
          {t("settings.data.exportJson")}
        </button>
        <button
          onClick={handleExportCSV}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-lg text-xs font-medium text-stone-700 transition-colors"
        >
          <FileSpreadsheet size={14} />
          {t("settings.data.exportCsv")}
        </button>
        <button
          onClick={() => importFileRef.current?.click()}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-lg text-xs font-medium text-stone-700 transition-colors"
        >
          <Upload size={14} />
          {t("settings.data.importJson")}
        </button>
        <input ref={importFileRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
        {importError && <p className="text-xs text-red-600">{importError}</p>}
      </Section>

      <p className="text-center text-[10px] text-stone-400 mt-4">
        {t("settings.data.entriesCount", { n: state.entries.length })}
      </p>

      {/* How to get API key overlay */}
      {showHowTo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-stone-800">{t("settings.ai.howToTitle")}</h3>
              <button onClick={() => setShowHowTo(false)} className="p-1.5 rounded-lg hover:bg-stone-100">
                <X size={16} className="text-stone-500" />
              </button>
            </div>
            <ol className="space-y-2 text-xs text-stone-600 list-decimal list-inside">
              <li>{t("settings.ai.howToStep1")}</li>
              <li>{t("settings.ai.howToStep2")}</li>
              <li>{t("settings.ai.howToStep3")}</li>
              <li>{t("settings.ai.howToStep4")}</li>
            </ol>
            <button
              onClick={() => setShowHowTo(false)}
              className="mt-5 w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-medium transition-colors"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
