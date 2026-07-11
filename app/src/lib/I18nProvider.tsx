import { useMemo, type ReactNode } from "react";
import type { Language } from "@/types";
import { I18nContext, translate, type I18nContextValue } from "@/lib/i18n";

export function I18nProvider({ language, children }: { language: Language; children: ReactNode }) {
  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      t: (key, vars) => translate(language, key, vars),
    }),
    [language]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
