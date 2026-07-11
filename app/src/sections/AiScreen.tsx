import { useCallback, useMemo, useState } from "react";
import type { AppState } from "@/types";
import { cn, daysBetween, entryTimestamp, formatDateInput, isWithinLastDays } from "@/lib/utils";
import { localizedLabel, useI18n } from "@/lib/i18n";
import { Brain, AlertCircle, Loader2, Sparkles, ShieldCheck } from "lucide-react";

interface AiScreenProps {
  state: AppState;
}

interface AiResponse {
  good: string[];
  watch: string[];
}

function buildPayload(state: AppState, language: "bg" | "en") {
  const today = formatDateInput(new Date());
  const { settings } = state;
  const abortiveById = new Map(settings.abortiveMedications.map((m) => [m.id, m]));
  const supportiveById = new Map(settings.supportiveMedications.map((m) => [m.id, m]));
  const severityById = new Map(settings.severityCategories.map((c) => [c.id, c]));

  const last90 = state.entries
    .filter((e) => isWithinLastDays(e.date, 90, today))
    .sort((a, b) => entryTimestamp(a) - entryTimestamp(b))
    .map((e) => ({
      date: e.date,
      time: e.time,
      severity: severityById.get(e.severityCategoryId)
        ? localizedLabel(severityById.get(e.severityCategoryId)!, language)
        : e.severityCategoryId,
      abortiveMedication: e.abortiveMedicationId
        ? localizedLabel(abortiveById.get(e.abortiveMedicationId) ?? { label_bg: e.abortiveMedicationId, label_en: e.abortiveMedicationId }, language)
        : null,
      supportiveMedications: e.supportiveMedicationIds.map((id) =>
        supportiveById.get(id) ? localizedLabel(supportiveById.get(id)!, language) : id
      ),
      prodromeOnly: e.prodromeOnly,
      resolution: e.resolution,
      notes: e.notes,
    }));

  const last30 = state.entries.filter((e) => isWithinLastDays(e.date, 30, today));

  const severityDistribution: Record<string, number> = {};
  for (const cat of settings.severityCategories) severityDistribution[localizedLabel(cat, language)] = 0;
  last30.forEach((e) => {
    const cat = severityById.get(e.severityCategoryId);
    if (cat) severityDistribution[localizedLabel(cat, language)]++;
  });

  const resolutionBreakdown: Record<string, number> = {
    medication: 0,
    sleep: 0,
    behavioral: 0,
    unresolved: 0,
  };
  last30.forEach((e) => (resolutionBreakdown[e.resolution] = (resolutionBreakdown[e.resolution] ?? 0) + 1));

  const prodromeEntries = last30.filter((e) => e.prodromeOnly);
  const prodromeHits = prodromeEntries.filter((p) =>
    last30.some((o) => o.id !== p.id && !o.prodromeOnly && daysBetween(p.date, o.date) === 1)
  );
  const prodromeToAttackHitRatePercent =
    prodromeEntries.length > 0 ? Math.round((prodromeHits.length / prodromeEntries.length) * 100) : null;

  const acuteDays30 = last30.filter((e) => e.abortiveMedicationId !== null).length;

  const lastAbortiveEntry = state.entries
    .filter((e) => e.abortiveMedicationId !== null)
    .sort((a, b) => entryTimestamp(b) - entryTimestamp(a))[0];
  const cooldownMs = settings.abortiveCooldownHours * 3600000;
  const cooldownRemainingMs = lastAbortiveEntry
    ? cooldownMs - (Date.now() - entryTimestamp(lastAbortiveEntry))
    : null;

  return {
    entries_last_90_days: last90,
    aggregated_last_30_days: {
      acute_medication_days: acuteDays30,
      severity_distribution: severityDistribution,
      resolution_breakdown: resolutionBreakdown,
      prodrome_to_attack_hit_rate_percent: prodromeToAttackHitRatePercent,
    },
    cooldown_status: {
      abortive_cooldown_hours: settings.abortiveCooldownHours,
      last_abortive_dose_at: lastAbortiveEntry ? `${lastAbortiveEntry.date}T${lastAbortiveEntry.time}` : null,
      cooldown_active: cooldownRemainingMs !== null && cooldownRemainingMs > 0,
      cooldown_remaining_hours:
        cooldownRemainingMs !== null && cooldownRemainingMs > 0
          ? Math.round((cooldownRemainingMs / 3600000) * 10) / 10
          : 0,
    },
    moh_status: {
      acute_medication_days_last_30: acuteDays30,
      personal_ceiling_days: settings.mohThresholds.personalCeilingDays,
      clinical_threshold_days: settings.mohThresholds.clinicalThresholdDays,
    },
    personal_info: settings.ai.personalInfo,
  };
}

function parseAiJson(content: string): AiResponse {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse AI response as JSON");
  }
}

export function AiScreen({ state }: AiScreenProps) {
  const { t, language } = useI18n();
  const [response, setResponse] = useState<AiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const payload = useMemo(() => buildPayload(state, language), [state, language]);

  const analyze = useCallback(async () => {
    if (!state.settings.ai.apiKey) {
      setError(t("ai.apiKeyMissing"));
      return;
    }
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.settings.ai.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: state.settings.ai.model,
          messages: [
            { role: "system", content: state.settings.ai.customPrompt },
            { role: "user", content: `Context and data:\n${JSON.stringify(payload)}` },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`API error ${res.status}: ${err}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error(t("ai.emptyResponse"));
      setResponse(parseAiJson(content));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("ai.error"));
    } finally {
      setLoading(false);
    }
  }, [state, payload, t]);

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-stone-800 mb-1">{t("ai.title")}</h1>
      <p className="text-xs text-stone-500 mb-4">{t("ai.intro")}</p>

      {!state.settings.ai.apiKey && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">{t("ai.apiKeyMissing")}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4 shadow-sm">
        <div className="flex justify-between text-xs text-stone-600">
          <span>{t("ai.entriesConsidered")}</span>
          <span className="font-medium">{payload.entries_last_90_days.length}</span>
        </div>
      </div>

      <button
        onClick={analyze}
        disabled={loading || !state.settings.ai.apiKey}
        className={cn(
          "w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all mb-4",
          state.settings.ai.apiKey
            ? "bg-teal-600 hover:bg-teal-700 text-white shadow-sm active:scale-[0.98]"
            : "bg-stone-200 text-stone-400 cursor-not-allowed"
        )}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {t("ai.analyzing")}
          </>
        ) : (
          <>
            <Brain size={18} />
            {t("ai.analyze")}
          </>
        )}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{error}</div>
      )}

      {response && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
          {response.good && response.good.length > 0 && (
            <div className="bg-teal-50 rounded-xl border border-teal-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-teal-600" />
                <h3 className="text-sm font-semibold text-teal-800">{t("ai.good")}</h3>
              </div>
              <ul className="space-y-2">
                {response.good.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-teal-700">
                    <span className="text-teal-400 mt-0.5 shrink-0">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {response.watch && response.watch.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-amber-600" />
                <h3 className="text-sm font-semibold text-amber-800">{t("ai.watch")}</h3>
              </div>
              <ul className="space-y-2">
                {response.watch.map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-amber-700">
                    <span className="text-amber-400 mt-0.5 shrink-0">!</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
