import { useState, useEffect, useCallback } from "react";
import type { AppState, TabId, Entry } from "@/types";
import { loadState, saveState } from "@/data/defaults";
import { I18nProvider } from "@/lib/I18nProvider";
import { useI18n } from "@/lib/i18n";
import { cn, formatDateInput } from "@/lib/utils";
import { QuickEntryScreen } from "@/sections/QuickEntryScreen";
import { CooldownScreen } from "@/sections/CooldownScreen";
import { CalendarScreen } from "@/sections/CalendarScreen";
import { AiScreen } from "@/sections/AiScreen";
import { SettingsScreen } from "@/sections/SettingsScreen";
import { EditEntryDialog } from "@/sections/EditEntryDialog";
import { Pill, Timer, Calendar, Brain, Settings } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

const tabs: { id: TabId; labelKey: TranslationKey; icon: typeof Pill }[] = [
  { id: "entry", labelKey: "nav.entry", icon: Pill },
  { id: "cooldown", labelKey: "nav.cooldown", icon: Timer },
  { id: "calendar", labelKey: "nav.calendar", icon: Calendar },
  { id: "ai", labelKey: "nav.ai", icon: Brain },
  { id: "settings", labelKey: "nav.settings", icon: Settings },
];

function AppShell({
  state,
  activeTab,
  setActiveTab,
  editingEntry,
  setEditingEntry,
  addEntry,
  updateEntry,
  deleteEntry,
  updateSettings,
  refreshState,
  updateLastExport,
}: {
  state: AppState;
  activeTab: TabId;
  setActiveTab: (t: TabId) => void;
  editingEntry: Entry | null;
  setEditingEntry: (e: Entry | null) => void;
  addEntry: (e: Entry) => void;
  updateEntry: (e: Entry) => void;
  deleteEntry: (id: string) => void;
  updateSettings: (s: AppState["settings"]) => void;
  refreshState: () => void;
  updateLastExport: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 flex flex-col">
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "entry" && <QuickEntryScreen state={state} onAddEntry={addEntry} />}
        {activeTab === "cooldown" && <CooldownScreen state={state} />}
        {activeTab === "calendar" && <CalendarScreen state={state} onEditEntry={setEditingEntry} />}
        {activeTab === "ai" && <AiScreen state={state} />}
        {activeTab === "settings" && (
          <SettingsScreen
            state={state}
            onUpdateSettings={updateSettings}
            onImport={refreshState}
            onExport={updateLastExport}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-stone-200 z-50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors",
                  active ? "text-teal-600" : "text-stone-400 hover:text-stone-600"
                )}
              >
                <tab.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <EditEntryDialog
        key={editingEntry?.id ?? "none"}
        entry={editingEntry}
        state={state}
        onClose={() => setEditingEntry(null)}
        onSave={updateEntry}
        onDelete={deleteEntry}
      />
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [activeTab, setActiveTab] = useState<TabId>("entry");
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addEntry = useCallback((entry: Entry) => {
    setState((prev) => ({ ...prev, entries: [entry, ...prev.entries] }));
  }, []);

  const updateEntry = useCallback((entry: Entry) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => (e.id === entry.id ? entry : e)),
    }));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setState((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }));
  }, []);

  const updateSettings = useCallback((settings: AppState["settings"]) => {
    setState((prev) => ({ ...prev, settings }));
  }, []);

  const updateLastExport = useCallback(() => {
    setState((prev) => ({ ...prev, lastExportDate: formatDateInput(new Date()) }));
  }, []);

  const refreshState = useCallback(() => {
    setState(loadState());
  }, []);

  return (
    <I18nProvider language={state.settings.language}>
      <AppShell
        state={state}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        editingEntry={editingEntry}
        setEditingEntry={setEditingEntry}
        addEntry={addEntry}
        updateEntry={updateEntry}
        deleteEntry={deleteEntry}
        updateSettings={updateSettings}
        refreshState={refreshState}
        updateLastExport={updateLastExport}
      />
    </I18nProvider>
  );
}
