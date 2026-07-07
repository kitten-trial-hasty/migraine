import { useState, useEffect, useCallback } from "react";
import type { AppState, TabId, Entry } from "@/types";
import { loadState, saveState } from "@/data/defaults";
import { QuickEntryScreen } from "@/sections/QuickEntryScreen";
import { CooldownScreen } from "@/sections/CooldownScreen";
import { CalendarScreen } from "@/sections/CalendarScreen";
import { AiScreen } from "@/sections/AiScreen";
import { SettingsScreen } from "@/sections/SettingsScreen";
import { EditEntryDialog } from "@/sections/EditEntryDialog";
import { Pill, Timer, Calendar, Brain, Settings } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const tabs: { id: TabId; label: string; icon: typeof Pill }[] = [
  { id: "entry", label: "Entry", icon: Pill },
  { id: "cooldown", label: "Cooldowns", icon: Timer },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "ai", label: "AI", icon: Brain },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [activeTab, setActiveTab] = useState<TabId>("entry");
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  // Persist to localStorage on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const addEntry = useCallback((entry: Entry) => {
    setState((prev) => ({
      ...prev,
      entries: [entry, ...prev.entries],
    }));
  }, []);

  const updateEntry = useCallback((entry: Entry) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => (e.id === entry.id ? entry : e)),
    }));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== id),
    }));
  }, []);

  const updateSettings = useCallback((settings: AppState["settings"]) => {
    setState((prev) => ({ ...prev, settings }));
  }, []);

  const updateLastExport = useCallback(() => {
    setState((prev) => ({
      ...prev,
      last_export_date: new Date().toISOString().split("T")[0],
    }));
  }, []);

  const refreshState = useCallback(() => {
    setState(loadState());
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 flex flex-col">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "entry" && (
          <QuickEntryScreen state={state} onAddEntry={addEntry} />
        )}
        {activeTab === "cooldown" && <CooldownScreen state={state} />}
        {activeTab === "calendar" && (
          <CalendarScreen
            state={state}
            onEditEntry={setEditingEntry}
          />
        )}
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

      {/* Bottom navigation */}
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
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Edit entry dialog */}
      <EditEntryDialog
        entry={editingEntry}
        state={state}
        onClose={() => setEditingEntry(null)}
        onSave={updateEntry}
        onDelete={deleteEntry}
      />
    </div>
  );
}
