import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getBaselineResults } from "../../api/baselineApi";
import { ChevronRight, Calendar, Activity, Zap } from "lucide-react";
import { DOMAIN_COLORS } from "../../constants/domains";

export default function WeeklyHistory() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["client-scores"],
    queryFn: () => getBaselineResults(),
  });

  const apiData = data?.data;

  /* =======================
     NORMALIZE DATA
  ======================= */

  const history = useMemo(() => {
    const rawSubmissions = apiData?.submissions || [];
    const weeklyMetrics = apiData?.calibration?.weeklyMetrics || [];
    const baseline = apiData?.baseline;

    // Create a base map of all submissions by week
    const weeksMap = new Map<number, any>();

    // 1. Add Baseline (Week 0)
    if (baseline?.status === 'completed') {
      weeksMap.set(0, {
        type: 'baseline',
        week: 0,
        nkpi: baseline.score,
        submittedAt: baseline.completedAt,
        domains: baseline.domains || []
      });
    }

    // 2. Add raw submissions (if any)
    rawSubmissions.forEach((s: any) => {
      weeksMap.set(s.week, {
        ...s,
        domains: s.domains || []
      });
    });

    // 3. Supplement/Overwrite with weeklyMetrics (source of truth for results)
    weeklyMetrics.forEach((wm: any) => {
      const existing = weeksMap.get(wm.week) || {};
      weeksMap.set(wm.week, {
        ...existing,
        week: wm.week,
        type: 'weekly',
        nkpi: wm.nkpi_score || existing.nkpi,
        submittedAt: wm.submittedAt || existing.submittedAt,
        domains: wm.domains || existing.domains || []
      });
    });

    // Map and normalize from our combined map
    return Array.from(weeksMap.values()).map((item: any) => {
      let status: "completed" | "pending" | "locked" = "completed";

      // If we have a type but no real data yet? 
      // (Usually submissions are only completed ones, but let's be safe)
      if (!item.nkpi && item.nkpi !== 0) status = "pending";

      // Map correct domain data depending on the type
      let domains = [];
      if (item.type === "baseline" || item.week === 0) {
        domains = apiData?.baseline?.domains || [];
      } else {
        const matchingWeekly = weeklyMetrics.find((w: any) => w.week === item.week);
        domains = matchingWeekly?.domains || [];
      }

      return {
        week: item.week,
        type: item.type,
        status,
        nkpi: item.nkpi ?? null,
        submittedAt: item.submittedAt ?? null,
        domains,
      };
    }).sort((a: any, b: any) => a.week - b.week);
  }, [apiData]);

  const baselineNkpi = history.find((h: { week: number }) => h.week === 0)?.nkpi || 0;

  /* =======================
     HELPERS
  ======================= */

  const formatWeek = (week: number) =>
    week === 0 ? "Baseline" : `Week ${String(week).padStart(2, "0")}`;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  /* =======================
     LOADING
  ======================= */

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <Activity className="w-8 h-8 text-secondary animate-pulse mb-4" />
        Loading history...
      </div>
    );
  }

  /* =======================
     UI
  ======================= */

  return (
    <div className="mx-auto px-6 py-8 animate-in fade-in zoom-in-95 duration-700">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-10 pb-6 border-b border-white/5">
        <div>
          <span className="text-secondary text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5" /> Performance Log
          </span>
          <h4 className="text-3xl text-white font-bold tracking-tight">
            History Timeline
          </h4>
          <p className="text-gray-400 text-sm mt-2 max-w-lg leading-relaxed shadow-sm">
            Review your past calibration cycles. Click into any completed week to view your detailed insights and deep-dive analytics.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center min-w-[120px]">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Submissions</p>
          <p className="text-white font-mono font-bold text-lg">{history.length}</p>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {history.map((item: any) => {
          const delta = item.nkpi !== null && item.week !== 0 ? item.nkpi - baselineNkpi : null;
          const isPositive = delta && delta > 0;
          const isNegative = delta && delta < 0;

          return (
            <div
              key={item.week}
              onClick={() => {
                if (item.status === "completed" && item.week !== 0) {
                  navigate(`/weekly/result?week=${item.week}`);
                }
              }}
              className={`p-0 overflow-hidden group flex flex-col justify-between transition-all duration-500 min-h-[300px] border relative rounded-3xl shadow-xl ${item.status === "completed" && item.week !== 0
                  ? "cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-secondary/10 border-white/5 hover:border-secondary/30 bg-[#0A0D11]"
                  : item.week === 0
                    ? "border-secondary/20 bg-secondary/5 cursor-default"
                    : "border-white/5 bg-[#0A0D11]/50 opacity-60 cursor-not-allowed"
                }`}
            >
              <div className="p-6">
                {/* HEAD */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h6 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
                      {formatWeek(item.week)}
                      {item.week === 0 && <Zap className="w-3.5 h-3.5 text-secondary" />}
                    </h6>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-1">
                      {formatDate(item.submittedAt)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${item.status === "completed"
                        ? item.week === 0 ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                      }`}
                  >
                    {item.week === 0 ? "Calibrated" : item.status}
                  </span>
                </div>

                {/* Score */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-3">
                    <h4 className="text-4xl text-white font-mono font-bold tracking-tighter">
                      {item.nkpi ? item.nkpi.toFixed(1) : "--"}
                    </h4>
                    {delta !== null && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isPositive ? "bg-emerald-500/10 text-emerald-400" : isNegative ? "bg-rose-500/10 text-rose-400" : "bg-white/5 text-gray-400"}`}>
                        {isPositive ? "+" : ""}{delta.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium uppercase mt-1.5 tracking-wider">
                    {item.week === 0 ? "Baseline Score" : "NKPI Score"}
                  </p>
                </div>

                {/* Domains */}
                {item.domains && item.domains.length > 0 && (
                  <div className="space-y-3 relative z-10">
                    {item.domains.map((d: any) => {
                      const cColor = DOMAIN_COLORS[d.domain]?.color || "#EDDC90";
                      const cLabel = DOMAIN_COLORS[d.domain]?.label || d.domain;
                      const score = typeof d.score === "number" ? Math.round(d.score) : 0;

                      return (
                        <div key={d.domain} className="group/domain">
                          <div className="flex justify-between text-[10px] items-center mb-1.5">
                            <span className="text-gray-400 font-medium capitalize">{cLabel}</span>
                            <span className="text-white font-mono">{score}</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${score}%`, backgroundColor: cColor }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className={`mt-auto p-4 border-t transition-colors ${item.status === 'completed' && item.week !== 0 ? 'border-white/5 group-hover:border-secondary/20 bg-white/[0.02] flex justify-between items-center' : 'border-transparent'}`}>
                {item.status === "completed" && item.week !== 0 ? (
                  <>
                    <span className="text-[10px] text-gray-400 font-medium">View Analysis Report</span>
                    <div className="w-6 h-6 rounded-full bg-white/5 group-hover:bg-secondary/10 flex items-center justify-center transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-secondary group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </>
                ) : item.week === 0 ? (
                  <span className="text-[10px] text-secondary font-medium tracking-wide">Initial Calibration Anchor</span>
                ) : (
                  <span className="text-[10px] text-gray-500 font-medium tracking-wide">Waiting for submission</span>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}