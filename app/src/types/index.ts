// Data types for Migraine & MOH Tracker

export interface Pathway {
  id: string;
  label: string;
  color: string;
  cooldown_hours: number | null;
}

export interface SeverityCategory {
  id: string;
  label: string;
  color: string;
}

export interface MOHThresholds {
  personal_ceiling_days: number;
  clinical_threshold_days: number;
}

export interface Settings {
  pathways: Pathway[];
  severity_categories: SeverityCategory[];
  moh_thresholds: MOHThresholds;
  ai_api_key: string;
  ai_custom_prompt: string;
}

export type Resolution = "medication" | "sleep" | "behavioral" | "unresolved";

export interface Entry {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  time: string; // HH:mm
  severity_category_id: string;
  pathway_id: string | "none";
  adjuvant_metoclopramide: boolean;
  prodrome_only: boolean;
  resolution: Resolution;
  notes: string;
}

export interface AppState {
  settings: Settings;
  entries: Entry[];
  last_export_date?: string;
}

export type TabId = "entry" | "cooldown" | "calendar" | "ai" | "settings";
