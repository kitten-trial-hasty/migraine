import type { AppState } from "@/types";

export const DEFAULT_AI_PROMPT = `You are reviewing a personal migraine/MOH tracking log. Given the detailed data and background information, identify:
1) What's going well — improving trends, cooldown discipline, growing medication‑free streaks.
2) What needs attention — approaching MOH thresholds, cooldown violations, rising attack frequency, declining prodrome‑prediction accuracy.
Reply ONLY as JSON: {"good": [...], "watch": [...]}, each a list of short plain‑language sentences.`;

export const defaultState: AppState = {
  settings: {
    language: "bg",
    abortiveMedications: [
      { id: "naproxen", label_bg: "Напроксен 550", label_en: "Naproxen 550", color: "#C8E6C9" },
      { id: "metamizole", label_bg: "Метамизол 1000", label_en: "Metamizole 1000", color: "#B3E5FC" },
    ],
    supportiveMedications: [
      {
        id: "metoclopramide",
        label_bg: "Метоклопрамид (Деган)",
        label_en: "Metoclopramide (Degan)",
        color: "#E1BEE7",
      },
    ],
    abortiveCooldownHours: 72,
    severityCategories: [
      { id: "clear", label_bg: "Чист", label_en: "Clear", color: "#C8E6C9" },
      { id: "none", label_bg: "Без тежест", label_en: "No Heaviness", color: "#F0F4C3" },
      { id: "mild", label_bg: "Малко тежест", label_en: "Mild Heaviness", color: "#FFE082" },
      { id: "more", label_bg: "Повече тежест", label_en: "More Heaviness", color: "#FFCC80" },
      { id: "severe", label_bg: "Тежко", label_en: "Severe", color: "#EF9A9A" },
    ],
    mohThresholds: {
      personalCeilingDays: 10,
      clinicalThresholdDays: 15,
    },
    ai: {
      apiKey: "",
      model: "openai/gpt-4o",
      customPrompt: DEFAULT_AI_PROMPT,
      personalInfo: "",
    },
  },
  entries: [],
};

const STORAGE_KEY = "migraine_app_state";

function cloneDefault(): AppState {
  return JSON.parse(JSON.stringify(defaultState));
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    const parsed = JSON.parse(raw);
    if (!parsed.settings || !parsed.entries) {
      return cloneDefault();
    }
    return {
      ...cloneDefault(),
      ...parsed,
      settings: {
        ...cloneDefault().settings,
        ...parsed.settings,
        mohThresholds: {
          ...defaultState.settings.mohThresholds,
          ...parsed.settings.mohThresholds,
        },
        ai: {
          ...defaultState.settings.ai,
          ...parsed.settings.ai,
        },
      },
      entries: parsed.entries || [],
    };
  } catch {
    return cloneDefault();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state:", e);
  }
}

export function isValidBackup(data: unknown): data is AppState {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return typeof obj.settings === "object" && Array.isArray(obj.entries);
}
