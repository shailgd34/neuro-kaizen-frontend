import Card from "../../ui/Card";
import { Brain, Quote, AlertCircle, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DOMAIN_COLORS } from "../../../constants/domains";

// Domain-object shape from the API (top-level primaryIssue / secondaryIssue)
type DomainIssue = {
  domain: string;
  score: number;
  status: string;
  baseline: number;
  delta: number;
  deltaStatus: string;
  zScore: number;
  drift: string;
  triggerPhase2?: boolean;
};

type SummaryShape = {
  overallStatus?: string;
  primaryIssue?: DomainIssue | null;
  secondaryIssue?: DomainIssue | null;
  primaryIssueText?: string | null;
  secondaryIssueText?: string | null;
  pattern?: string;
};

type Props = {
  summary?: SummaryShape;
  topSummary?: string;
  recommendations?: string[];
  primaryIssue?: DomainIssue | null;    // top-level shortcut
  secondaryIssue?: DomainIssue | null;  // top-level shortcut
};

export default function PerformancePressureCard({
  summary,
  topSummary,
  recommendations = [],
  primaryIssue: propPrimary,
  secondaryIssue: propSecondary,
}: Props) {
  const navigate = useNavigate();

  // Resolve issues: prefer top-level props, fall back to summary object
  const primaryIssue = propPrimary ?? summary?.primaryIssue ?? null;
  const secondaryIssue = propSecondary ?? summary?.secondaryIssue ?? null;
  const hasIssues = primaryIssue || secondaryIssue;

  // Text descriptions
  const primaryText = summary?.primaryIssueText || (primaryIssue
    ? `${DOMAIN_COLORS[primaryIssue.domain]?.label || primaryIssue.domain} is ${primaryIssue.status.toLowerCase()} — score dropped to ${Math.round(primaryIssue.score)} from baseline ${Math.round(primaryIssue.baseline)}.`
    : null);

  const secondaryText = summary?.secondaryIssueText || (secondaryIssue
    ? `${DOMAIN_COLORS[secondaryIssue.domain]?.label || secondaryIssue.domain} is ${secondaryIssue.status.toLowerCase()} — score dropped to ${Math.round(secondaryIssue.score)} from baseline ${Math.round(secondaryIssue.baseline)}.`
    : null);

  const isCritical = primaryIssue?.status === "Critical" || primaryIssue?.status === "At Risk";

  return (
    <Card
      title="Performance Intelligence"
      className={`relative group overflow-hidden ${isCritical ? "border-rose-500/20" : ""}`}
    >
      {/* Ambient glow — red if critical */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 blur-[80px] pointer-events-none transition-colors duration-500 ${
          isCritical ? "bg-rose-500/10" : "bg-secondary/5"
        }`}
      />

      {/* Pattern row */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2.5 rounded-xl border ${isCritical ? "bg-rose-500/10 border-rose-500/20" : "bg-white/5 border-white/5"}`}>
          <Brain size={18} className={isCritical ? "text-rose-400" : "text-secondary"} />
        </div>
        <div>
          <h6 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Detected pattern</h6>
          <p className="text-white font-semibold text-sm capitalize">{summary?.pattern || "Establishing baseline"}</p>
        </div>

        {/* Overall status badge */}
        {summary?.overallStatus && (
          <span className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${
            isCritical
              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}>
            {summary.overallStatus}
          </span>
        )}
      </div>

      <div className="space-y-4 relative z-10">
        {/* Summary text */}
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 relative">
          <Quote size={16} className="absolute top-2 right-3 text-white opacity-5 rotate-12" />
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Overall Analysis</p>
          <p className="text-gray-300 text-sm leading-relaxed font-medium">
            {topSummary || `Your performance pattern shows a ${summary?.pattern || "stable"} signature.`}
          </p>
        </div>

        {/* Issues */}
        {hasIssues ? (
          <div className="space-y-3">
            {/* Primary issue */}
            {primaryIssue && (
              <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={13} className="text-rose-400" />
                    <p className="text-rose-400 font-black text-[9px] uppercase tracking-wider">
                      Primary Constraint — {DOMAIN_COLORS[primaryIssue.domain]?.label || primaryIssue.domain}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingDown size={11} className="text-rose-400" />
                    <span className="text-rose-300 text-[9px] font-bold">{Math.round(primaryIssue.delta)}</span>
                  </div>
                </div>
                <p className="text-white text-xs font-semibold leading-relaxed mb-2">{primaryText}</p>
                <div className="flex gap-2">
                  <span className="px-1.5 py-0.5 bg-rose-500/10 rounded text-[9px] text-rose-400 border border-rose-500/10 capitalize">
                    {primaryIssue.status}
                  </span>
                  <span className="px-1.5 py-0.5 bg-rose-500/10 rounded text-[9px] text-rose-400 border border-rose-500/10 capitalize">
                    {primaryIssue.drift}
                  </span>
                  {primaryIssue.triggerPhase2 && (
                    <button
                      onClick={() => navigate("/phase2", { state: { domain: primaryIssue.domain } })}
                      className="px-1.5 py-0.5 bg-secondary/10 rounded text-[9px] text-secondary border border-secondary/20 font-bold hover:bg-secondary/20 transition-colors"
                    >
                      → Start Phase 2
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Secondary issue */}
            {secondaryIssue && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={13} className="text-amber-400" />
                    <p className="text-amber-400 font-black text-[9px] uppercase tracking-wider">
                      Secondary Signal — {DOMAIN_COLORS[secondaryIssue.domain]?.label || secondaryIssue.domain}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingDown size={11} className="text-amber-400" />
                    <span className="text-amber-300 text-[9px] font-bold">{Math.round(secondaryIssue.delta)}</span>
                  </div>
                </div>
                <p className="text-white text-xs font-semibold leading-relaxed">{secondaryText}</p>
              </div>
            )}
          </div>
        ) : (
          /* Fallback recommendations */
          recommendations.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest px-1">Protocol Adjustments</p>
              {recommendations.slice(0, 3).map((rec, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-secondary/5 border border-secondary/10 rounded-xl items-start">
                  <TrendingUp size={12} className="text-secondary mt-0.5 shrink-0" />
                  <p className="text-white text-xs leading-relaxed font-medium">{rec}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <div className="mt-6 flex justify-between items-center opacity-30">
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => <div key={i} className="w-6 h-[1px] bg-white/40 rounded-full" />)}
        </div>
        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">NK-PID Platform</span>
      </div>
    </Card>
  );
}