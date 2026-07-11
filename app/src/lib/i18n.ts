import { createContext, useContext } from "react";
import type { Language } from "@/types";

type Vars = Record<string, string | number>;

export const dict = {
  en: {
    "common.appName": "Migraine Tracker",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.close": "Close",
    "common.add": "Add",
    "common.remove": "Remove",
    "common.today": "Today",
    "common.none": "None",
    "common.optional": "Optional",

    "nav.entry": "Entry",
    "nav.cooldown": "Cooldown",
    "nav.calendar": "Calendar",
    "nav.ai": "AI",
    "nav.settings": "Settings",

    "quickEntry.title": "Quick Entry",
    "quickEntry.editTitle": "Edit Entry",
    "quickEntry.date": "Date",
    "quickEntry.time": "Time",
    "quickEntry.clearTime": "Clear time",
    "quickEntry.severity": "Severity",
    "quickEntry.abortiveMed": "Abortive medication",
    "quickEntry.none": "None",
    "quickEntry.moreOptions": "More options",
    "quickEntry.supportiveMeds": "Supportive medications",
    "quickEntry.prodrome": "Prodrome only",
    "quickEntry.resolution": "Resolution",
    "quickEntry.medication": "Medication",
    "quickEntry.sleep": "Sleep",
    "quickEntry.behavioral": "Behavioural",
    "quickEntry.unresolved": "Unresolved",
    "quickEntry.notes": "Notes",
    "quickEntry.notesPlaceholder": "Optional notes…",
    "quickEntry.submit": "Save entry",
    "quickEntry.severityRequired": "Please select a severity level",
    "quickEntry.saved": "Saved",
    "quickEntry.deleteConfirm": "Delete this entry permanently?",

    "cooldown.title": "Cooldown",
    "cooldown.available": "Available",
    "cooldown.availableMessage": "Available – you may take an abortive medication",
    "cooldown.active": "Cooldown active",
    "cooldown.activeMessage": "Cooldown active – no abortive medication allowed",
    "cooldown.freeFor": "Medication-free for",
    "cooldown.neverTaken": "No abortive medication logged yet",
    "cooldown.lastDose": "Last dose",
    "cooldown.milestones": "Milestones",
    "cooldown.milestone.absorption": "Absorption phase",
    "cooldown.milestone.peak": "Peak effect window",
    "cooldown.milestone.halfLife": "Drug half-life clearance",
    "cooldown.milestone.resetting": "Receptors begin resetting",
    "cooldown.milestone.normalizing": "Receptor sensitivity normalising",
    "cooldown.milestone.almostRecovered": "Almost full recovery",
    "cooldown.milestone.fullRecovery": "Full recovery – safe to take again",

    "moh.title": "MOH Risk (last 30 days)",
    "moh.clear": "You are in the clear!",
    "moh.caution": "Be careful! You're approaching your personal limit.",
    "moh.warning": "Warning: Clinical threshold exceeded.",
    "moh.personalCeiling": "Personal ceiling",
    "moh.clinicalThreshold": "Clinical threshold",
    "moh.acuteDays": "Acute medication days",

    "calendar.title": "Calendar",
    "calendar.abortiveUsed": "Abortive medication taken",

    "ai.title": "AI Analysis",
    "ai.intro": "Get a calm, plain-language read on your recent log.",
    "ai.good": "What's going well",
    "ai.watch": "Needs attention",
    "ai.analyze": "Analyze",
    "ai.analyzing": "Analyzing…",
    "ai.apiKeyMissing": "Add your OpenRouter API key in Settings to enable AI analysis.",
    "ai.error": "Failed to get analysis",
    "ai.emptyResponse": "Empty response from AI",
    "ai.entriesConsidered": "Entries considered (last 90 days)",

    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.languageBg": "Bulgarian",
    "settings.languageEn": "English",

    "settings.abortiveMeds.title": "Abortive Medications",
    "settings.supportiveMeds.title": "Supportive Medications",
    "settings.labelBg": "Bulgarian name",
    "settings.labelEn": "English name",
    "settings.color": "Color",
    "settings.addMedication": "Add medication",
    "settings.addCategory": "Add category",

    "settings.cooldown.title": "Abortive Cooldown",
    "settings.cooldown.hours": "Cooldown (hours)",

    "settings.severity.title": "Severity Categories",

    "settings.moh.title": "MOH Thresholds",
    "settings.moh.personalCeiling": "Personal ceiling (days)",
    "settings.moh.clinicalThreshold": "Clinical threshold (days)",

    "settings.ai.title": "AI Settings",
    "settings.ai.apiKey": "OpenRouter API key",
    "settings.ai.model": "Model",
    "settings.ai.modelPlaceholder": "e.g. openai/gpt-4o",
    "settings.ai.fetchModels": "Fetch models",
    "settings.ai.fetchingModels": "Fetching…",
    "settings.ai.fetchError": "Couldn't fetch models. Check your API key, or type a model ID manually.",
    "settings.ai.customPrompt": "Custom prompt",
    "settings.ai.personalInfo": "Personal migraine info",
    "settings.ai.personalInfoPlaceholder": "Triggers, history, sensitivities…",
    "settings.ai.howToLink": "How to get an API key",
    "settings.ai.howToTitle": "Getting an OpenRouter API key",
    "settings.ai.howToStep1": "Go to openrouter.ai and create an account.",
    "settings.ai.howToStep2": "Add credits to your account.",
    "settings.ai.howToStep3": "Generate an API key in the dashboard.",
    "settings.ai.howToStep4": "Paste the key here.",

    "settings.data.title": "Data Management",
    "settings.data.exportJson": "Export JSON backup",
    "settings.data.exportCsv": "Export CSV",
    "settings.data.importJson": "Import backup",
    "settings.data.importConfirm": "Import will replace all current data ({n} entries). Continue?",
    "settings.data.importError": "Failed to import: invalid backup file",
    "settings.data.lastExported": "Last exported: {n} days ago",
    "settings.data.lastExportedToday": "Last exported: today",
    "settings.data.lastExportedNever": "Never exported",
    "settings.data.entriesCount": "{n} entries stored locally",
  },
  bg: {
    "common.appName": "Тракер на мигрена",
    "common.save": "Запази",
    "common.cancel": "Отказ",
    "common.delete": "Изтрий",
    "common.close": "Затвори",
    "common.add": "Добави",
    "common.remove": "Премахни",
    "common.today": "Днес",
    "common.none": "Няма",
    "common.optional": "Незадължително",

    "nav.entry": "Запис",
    "nav.cooldown": "Пауза",
    "nav.calendar": "Календар",
    "nav.ai": "АИ",
    "nav.settings": "Настройки",

    "quickEntry.title": "Бърз запис",
    "quickEntry.editTitle": "Редактиране на запис",
    "quickEntry.date": "Дата",
    "quickEntry.time": "Час",
    "quickEntry.clearTime": "Изчисти часа",
    "quickEntry.severity": "Тежест",
    "quickEntry.abortiveMed": "Абортивно лекарство",
    "quickEntry.none": "Няма",
    "quickEntry.moreOptions": "Още опции",
    "quickEntry.supportiveMeds": "Поддържащи лекарства",
    "quickEntry.prodrome": "Само продром",
    "quickEntry.resolution": "Разрешаване",
    "quickEntry.medication": "Лекарство",
    "quickEntry.sleep": "Сън",
    "quickEntry.behavioral": "Поведенческо",
    "quickEntry.unresolved": "Неразрешено",
    "quickEntry.notes": "Бележки",
    "quickEntry.notesPlaceholder": "Незадължителни бележки…",
    "quickEntry.submit": "Запази запис",
    "quickEntry.severityRequired": "Моля, изберете ниво на тежест",
    "quickEntry.saved": "Запазено",
    "quickEntry.deleteConfirm": "Да изтрия ли този запис окончателно?",

    "cooldown.title": "Пауза",
    "cooldown.available": "Достъпно",
    "cooldown.availableMessage": "Достъпно – можете да приемете абортивно лекарство",
    "cooldown.active": "Паузата е активна",
    "cooldown.activeMessage": "Паузата е активна – абортивно лекарство не е разрешено",
    "cooldown.freeFor": "Без лекарство от",
    "cooldown.neverTaken": "Още няма записано абортивно лекарство",
    "cooldown.lastDose": "Последна доза",
    "cooldown.milestones": "Етапи",
    "cooldown.milestone.absorption": "Фаза на абсорбция",
    "cooldown.milestone.peak": "Прозорец на пиков ефект",
    "cooldown.milestone.halfLife": "Изчистване на полуживота",
    "cooldown.milestone.resetting": "Рецепторите започват да се възстановяват",
    "cooldown.milestone.normalizing": "Чувствителността на рецепторите се нормализира",
    "cooldown.milestone.almostRecovered": "Почти пълно възстановяване",
    "cooldown.milestone.fullRecovery": "Пълно възстановяване – безопасно е да приемете отново",

    "moh.title": "Риск от MOH (последните 30 дни)",
    "moh.clear": "Вие сте в безопасност!",
    "moh.caution": "Внимание! Наближавате личния си лимит.",
    "moh.warning": "Внимание: Клиничният праг е надвишен.",
    "moh.personalCeiling": "Личен лимит",
    "moh.clinicalThreshold": "Клиничен праг",
    "moh.acuteDays": "Дни с остро лекарство",

    "calendar.title": "Календар",
    "calendar.abortiveUsed": "Прието абортивно лекарство",

    "ai.title": "АИ Анализ",
    "ai.intro": "Получете спокоен, разбираем поглед към вашия запис.",
    "ai.good": "Какво върви добре",
    "ai.watch": "Изисква внимание",
    "ai.analyze": "Анализирай",
    "ai.analyzing": "Анализиране…",
    "ai.apiKeyMissing": "Добавете вашия OpenRouter API ключ в Настройки, за да включите АИ анализ.",
    "ai.error": "Неуспешен анализ",
    "ai.emptyResponse": "Празен отговор от АИ",
    "ai.entriesConsidered": "Разгледани записи (последните 90 дни)",

    "settings.title": "Настройки",
    "settings.language": "Език",
    "settings.languageBg": "Български",
    "settings.languageEn": "Английски",

    "settings.abortiveMeds.title": "Абортивни лекарства",
    "settings.supportiveMeds.title": "Поддържащи лекарства",
    "settings.labelBg": "Име на български",
    "settings.labelEn": "Име на английски",
    "settings.color": "Цвят",
    "settings.addMedication": "Добави лекарство",
    "settings.addCategory": "Добави категория",

    "settings.cooldown.title": "Абортивна пауза",
    "settings.cooldown.hours": "Пауза (часове)",

    "settings.severity.title": "Категории на тежест",

    "settings.moh.title": "MOH Прагове",
    "settings.moh.personalCeiling": "Личен лимит (дни)",
    "settings.moh.clinicalThreshold": "Клиничен праг (дни)",

    "settings.ai.title": "АИ Настройки",
    "settings.ai.apiKey": "OpenRouter API ключ",
    "settings.ai.model": "Модел",
    "settings.ai.modelPlaceholder": "напр. openai/gpt-4o",
    "settings.ai.fetchModels": "Изтегли модели",
    "settings.ai.fetchingModels": "Изтегляне…",
    "settings.ai.fetchError": "Неуспешно изтегляне на модели. Проверете API ключа си или въведете ID на модел ръчно.",
    "settings.ai.customPrompt": "Персонализиран промпт",
    "settings.ai.personalInfo": "Лична информация за мигрената",
    "settings.ai.personalInfoPlaceholder": "Окидачи, история, чувствителности…",
    "settings.ai.howToLink": "Как да получите API ключ",
    "settings.ai.howToTitle": "Получаване на OpenRouter API ключ",
    "settings.ai.howToStep1": "Отидете на openrouter.ai и създайте акаунт.",
    "settings.ai.howToStep2": "Добавете кредити към акаунта си.",
    "settings.ai.howToStep3": "Генерирайте API ключ в таблото.",
    "settings.ai.howToStep4": "Поставете ключа тук.",

    "settings.data.title": "Управление на данни",
    "settings.data.exportJson": "Изнеси JSON резервно копие",
    "settings.data.exportCsv": "Изнеси CSV",
    "settings.data.importJson": "Импортирай резервно копие",
    "settings.data.importConfirm": "Импортът ще замени всички текущи данни ({n} записа). Продължавам?",
    "settings.data.importError": "Неуспешен импорт: невалиден файл с резервно копие",
    "settings.data.lastExported": "Последен износ: преди {n} дни",
    "settings.data.lastExportedToday": "Последен износ: днес",
    "settings.data.lastExportedNever": "Все още не е изнасяно",
    "settings.data.entriesCount": "{n} записа съхранени локално",
  },
} as const;

export type TranslationKey = keyof typeof dict.en;

function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export interface I18nContextValue {
  language: Language;
  t: (key: TranslationKey, vars?: Vars) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function translate(language: Language, key: TranslationKey, vars?: Vars): string {
  return interpolate(dict[language][key] ?? dict.en[key] ?? key, vars);
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function localizedLabel(item: { label_bg: string; label_en: string }, language: Language): string {
  return language === "bg" ? item.label_bg : item.label_en;
}
