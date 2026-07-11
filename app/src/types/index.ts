// Data types for the Migraine & MOH Tracker

export type Language = "bg" | "en";

export interface Medication {
  id: string;
  label_bg: string;
  label_en: string;
  color: string;
}

export interface SeverityCategory {
  id: string;
  label_bg: string;
  label_en: string;
  color: string;
}

export interface MohThresholds {
  personalCeilingDays: number;
  clinicalThresholdDays: number;
}

export interface AiSettings {
  apiKey: string;
  model: string;
  customPrompt: string;
  personalInfo: string;
}

export interface Settings {
  language: Language;
  abortiveMedications: Medication[];
  supportiveMedications: Medication[];
  abortiveCooldownHours: number;
  severityCategories: SeverityCategory[];
  mohThresholds: MohThresholds;
  ai: AiSettings;
}

export type Resolution = "medication" | "sleep" | "behavioral" | "unresolved";

export interface Entry {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  time: string; // HH:mm
  severityCategoryId: string;
  abortiveMedicationId: string | null;
  supportiveMedicationIds: string[];
  prodromeOnly: boolean;
  resolution: Resolution;
  notes: string;
}

export interface AppState {
  settings: Settings;
  entries: Entry[];
  lastExportDate?: string;
}

export type TabId = "entry" | "cooldown" | "calendar" | "ai" | "settings";
