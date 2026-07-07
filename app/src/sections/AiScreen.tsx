import { useState, useMemo, useCallback } from "react";
import type { AppState } from "@/types";
import { formatDateInput, isWithinLastDays } from "@/lib/utils";
import { Brain, AlertCircle, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AiScreenProps {
  state: AppState;
}

interface AiResponse {
  good: string[];
  watch: string[];
}

function computeSummary(state: AppState) {
  const today = formatDateInput(new Date());
  const last30Entries = state.entries
    .filter((e) => isWithinLastDays(e.date, 30, today))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pathway counts
  const pathwayCounts: Record<string, number> = {};
  state.settings.pathways.forEach((pw) => (pathwayCounts[pw.label] = 0));
  pathwayCounts["None"] = 0;
  last30Entries.forEach((e) => {
    if (e.pathway_id === "none") {
      pathwayCounts["None"]++;
    } else {
      const pw = state.settings.pathways.find((p) => p.id === e.pathway_id);
      if (pw) pathwayCounts[pw.label] = (pathwayCounts[pw.label] || 0) + 1;
    }
  });

  // MOH count
  const mohCount = last30Entries.filter(
    (e) => e.pathway_id === "naproxen" || e.pathway_id === "metamizole"
  ).length;

  // Days since last severe
  const catIndex = new Map(state.settings.severity_categories.map((c, i) => [c.id, i]));
  let daysSinceSevere: number | null = null;
  const severeIdx = state.settings.severity_categories.findIndex(
    (c) => c.id === "severe"
  );
  for (const e of state.entries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )) {
    const rank = catIndex.get(e.severity_category_id) ?? -1;
    if (rank >= severeIdx && severeIdx >= 0) {
      daysSinceSevere = Math.floor(
        (new Date(today).getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      break;
    }
  }

  // Prodrome hit rate
  const prodromeEntries = last30Entries.filter((e) => e.prodrome_only);
  const prodromeRate =
    last30Entries.length > 0
      ? Math.round((prodromeEntries.length / last30Entries.length) * 100)
      : 0;

  // Resolution breakdown
  const resolutions: Record<string, number> = {
    medication: 0,
    sleep: 0,
    behavioral: 0,
    unresolved: 0,
  };
  last30Entries.forEach((e) => {
    resolutions[e.resolution] = (resolutions[e.resolution] || 0) + 1;
  });

  // Cooldown states
  const now = Date.now();
  const cooldownStates = state.settings.pathways.map((pw) => {
    const lastEntry = state.entries
      .filter((e) => e.pathway_id === pw.id)
      .sort((a, b) => {
        const da = new Date(a.date + "T" + (a.time || "00:00")).getTime();
        const db = new Date(b.date + "T" + (b.time || "00:00")).getTime();
        return db - da;
      })[0];
    if (!lastEntry || pw.cooldown_hours === null) return { label: pw.label, available: true };
    const lastTime = new Date(
      lastEntry.date + "T" + (lastEntry.time || "00:00")
    ).getTime();
    const remaining = lastTime + pw.cooldown_hours * 3600000 - now;
    return { label: pw.label, available: remaining <= 0 };
  });

  return {
    days_tracked: last30Entries.length,
    pathway_counts: pathwayCounts,
    moh_count: mohCount,
    moh_personal_ceiling: state.settings.moh_thresholds.personal_ceiling_days,
    moh_clinical_threshold: state.settings.moh_thresholds.clinical_threshold_days,
    days_since_severe: daysSinceSevere,
    prodrome_hit_rate_percent: prodromeRate,
    resolution_breakdown: resolutions,
    cooldown_states: cooldownStates,
  };
}

export function AiScreen({ state }: AiScreenProps) {
  const [response, setResponse] = useState<AiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const summary = useMemo(() => computeSummary(state), [state]);

  const analyze = useCallback(async () => {
    if (!state.settings.ai_api_key) {
      setError("Please set your OpenRouter API key in Settings first.");
      return;
    }
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.settings.ai_api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a migraine and medication-overuse headache tracking assistant. Reply only as requested JSON.",
            },
            {
              role: "user",
              content: `${state.settings.ai_custom_prompt}\n\nSummary (last 30 days):\n${JSON.stringify(summary, null, 2)}`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`API error ${res.status}: ${err}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from AI");

      const parsed = JSON.parse(content) as AiResponse;
      setResponse(parsed);
    } catch (e: any) {
      setError(e.message || "Failed to get analysis");
    } finally {
      setLoading(false);
    }
  }, [state, summary]);

  return (
    <div className="px-4 pt-5 pb-4 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-stone-800 mb-4">AI Analysis</h1>

      {/* API key warning */}
      {!state.settings.ai_api_key && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">
            Add your OpenRouter API key in Settings to enable AI analysis.
          </p>
        </div>
      )}

      {/* Summary card */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-800 mb-3">
          Current Summary
        </h2>
        <div className="space-y-2 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>Days tracked (30d)</span>
            <span className="font-medium">{summary.days_tracked}</span>
          </div>
          <div className="flex justify-between">
            <span>MOH count</span>
            <span
              className={cn(
                "font-medium",
                summary.moh_count >= summary.moh_personal_ceiling
                  ? "text-red-600"
                  : "text-stone-800"
              )}
            >
              {summary.moh_count} / {summary.moh_personal_ceiling}
            </span>
          </div>
          {summary.days_since_severe !== null && (
            <div className="flex justify-between">
              <span>Days since severe</span>
              <span className="font-medium">{summary.days_since_severe}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Prodrome-only rate</span>
            <span className="font-medium">{summary.prodrome_hit_rate_percent}%</span>
          </div>
        </div>
      </div>

      {/* Analyze button */}
      <button
        onClick={analyze}
        disabled={loading || !state.settings.ai_api_key}
        className={cn(
          "w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all mb-4",
          state.settings.ai_api_key
            ? "bg-teal-600 hover:bg-teal-700 text-white shadow-sm active:scale-[0.98]"
            : "bg-stone-200 text-stone-400 cursor-not-allowed"
        )}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Brain size={18} />
            Analyze
          </>
        )}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {/* AI Response */}
      {response && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
          {/* Good section */}
          {response.good && response.good.length > 0 && (
            <div className="bg-teal-50 rounded-xl border border-teal-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-teal-600" />
                <h3 className="text-sm font-semibold text-teal-800">
                  Going Well
                </h3>
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

          {/* Watch section */}
          {response.watch && response.watch.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-amber-600" />
                <h3 className="text-sm font-semibold text-amber-800">
                  Watch
                </h3>
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
