import type { AppState } from "@/types";

export const DEFAULT_AI_PROMPT = `You're reviewing a personal migraine/MOH tracking log. Given this summary of the last 30 days, identify: (1) what's going well — improving trends, cooldown discipline, growing medication-free streaks; (2) what needs attention — approaching MOH thresholds, any pathway used before its cooldown expired, rising attack frequency, or declining prodrome-prediction accuracy. Reply only as JSON: {"good": [...], "watch": [...]}, each a list of short plain-language sentences.`;

export const defaultState: AppState = {
  settings: {
    pathways: [
      { id: "naproxen", label: "Naproxen 550", color: "#86efac", cooldown_hours: 96 },
      { id: "metamizole", label: "Metamizole 1000", color: "#5eead4", cooldown_hours: 96 },
      { id: "pregabalin_tofisopam", label: "Pregabalin + Tofisopam", color: "#93c5fd", cooldown_hours: null },
      { id: "tofisopam", label: "Tofisopam alone", color: "#d8b4fe", cooldown_hours: null },
    ],
    severity_categories: [
      { id: "clear", label: "\u0427\u0438\u0441\u0442", color: "#86efac" },
      { id: "none", label: "\u0411\u0435\u0437 \u0442\u0435\u0436\u0435\u0441\u0442", color: "#bef264" },
      { id: "mild", label: "\u041c\u0430\u043b\u043a\u043e \u0442\u0435\u0436\u0435\u0441\u0442", color: "#fcd34d" },
      { id: "more", label: "\u041f\u043e\u0432\u0435\u0447\u0435 \u0442\u0435\u0436\u0435\u0441\u0442", color: "#fdba74" },
      { id: "severe", label: "\u0422\u0435\u0436\u043a\u043e", color: "#fca5a5" },
    ],
    moh_thresholds: {
      personal_ceiling_days: 10,
      clinical_threshold_days: 15,
    },
    ai_api_key: "",
    ai_custom_prompt: DEFAULT_AI_PROMPT,
  },
  entries: [],
};

const STORAGE_KEY = "migraine_app_state";

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultState));
    const parsed = JSON.parse(raw);
    // Validate required keys
    if (!parsed.settings || !parsed.entries) {
      return JSON.parse(JSON.stringify(defaultState));
    }
    // Merge with defaults to ensure new fields exist
    return {
      ...defaultState,
      ...parsed,
      settings: {
        ...defaultState.settings,
        ...parsed.settings,
        moh_thresholds: {
          ...defaultState.settings.moh_thresholds,
          ...parsed.settings.moh_thresholds,
        },
      },
      entries: parsed.entries || [],
    };
  } catch {
    return JSON.parse(JSON.stringify(defaultState));
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state:", e);
  }
}
