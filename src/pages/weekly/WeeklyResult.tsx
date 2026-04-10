import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, TrendingDown, Activity, Brain, Zap,
  Target, ChevronRight, AlertCircle, Clock, ShieldAlert
} from "lucide-react";
import GaugeComponent from 'react-gauge-component';
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { getBaselineResults } from "../../api/baselineApi";
import { DOMAIN_COLORS } from "./../../constants/domains";

function CountdownTimer({ initialTime, gated = false, onRefresh }: { initialTime: number; gated?: boolean; onRefresh?: () => void }) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [hasRefreshed, setHasRefreshed] = useState(false);

  const [targetDate, setTargetDate] = useState(() => Date.now() + initialTime * 1000);

  useEffect(() => {
    setTimeLeft(initialTime);
    setHasRefreshed(false);
  }, [initialTime]);

  useEffect(() => {
    // Only update target if difference is significant (e.g. server sync)
    const newTarget = Date.now() + initialTime * 1000;
    if (Math.abs(newTarget - targetDate) > 2000) {
      setTargetDate(newTarget);
    }
  }, [initialTime, targetDate]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (initialTime > 0 && onRefresh && !hasRefreshed) {
        setHasRefreshed(true);
        onRefresh();
      }
      return;
    }
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((targetDate - now) / 1000));
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, timeLeft, initialTime, onRefresh, hasRefreshed]);

  const formatTime = (secs: number) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  if (timeLeft === 0) {
    if (gated) {
      return (
        <div className="flex items-center gap-2 text-rose-400 font-medium text-xs bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
          <span>⚠ Complete Phase 2 to unlock next check-in</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
        <Zap className="w-3.5 h-3.5" />
        <span>Next check-in is ready</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
      <Clock className="w-3.5 h-3.5 text-secondary/60" />
      <span className="text-gray-500 text-xs">Next check-in:</span>
      <span className="font-medium text-white">{formatTime(timeLeft)}</span>
    </div>
  );
}

export default function WeeklyResult() {
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["assessment-results"],
    queryFn: () => getBaselineResults(),
  });

  const apiData = data?.data;
  const calibration = apiData?.calibration;
  const weeklyMetrics = calibration?.weeklyMetrics || [];

  console.log("WeeklyResult API Data:", apiData);
  console.log("WeeklyMetrics Array:", weeklyMetrics);

  // Latest submitted week = last entry in weeklyMetrics sorted by week
  const latestMetric = [...weeklyMetrics].sort((a: any, b: any) => b.week - a.week)[0];

  // Domain data lives in weeklyMetrics[last].domains — top-level domains may be empty
  const apiDomains = latestMetric?.domains || apiData?.domains || [];

  // Analysis from latest week's analysis block, fallback to top-level
  const analysis = latestMetric?.analysis?.summary || apiData?.analysis?.summary;

  const phase2 = apiData?.weeklyStatus;
  const isPhase2Pending = phase2?.phase2Pending === true;
  const isWeekSubmitted = phase2?.isCurrentWeekSubmitted === true;
  const remainingTime = phase2?.remainingTime || calibration?.remainingTime || 0;
  const totalWeeks = calibration?.totalWeeks || 6;
  const nextWeek = phase2?.currentWeek || calibration?.currentWeek || 1;

  const latestWeekly = {
    week: latestMetric?.week || phase2?.currentWeek || calibration?.currentWeek || 1,
    nkpi: latestMetric?.nkpi_score || apiData?.nkpi || 0,
  };

  useEffect(() => {
    if (isLoading) return;
    const isBaselineComplete = 
      apiData?.isBaselineCompleted === true || 
      apiData?.isBaselineSubmitted === true || 
      apiData?.draftStatus === 'completed' ||
      apiData?.baseline?.status === 'completed';

    if (apiData?.userState === "baseline_pending" || !isBaselineComplete) {
      navigate("/baseline");
    }
  }, [apiData, isLoading, navigate]);

  if (isLoading || !apiData) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-gray-400 space-y-3">
        <Activity className="w-10 h-10 text-secondary animate-pulse" />
        <p className="text-sm">Loading your results...</p>
      </div>
    );
  }

  const results = apiDomains.map((d: any) => ({
    domain: d.domain,
    base: Math.round(d.baseline),
    current: Math.round(d.score),
    delta: Math.round(d.delta),
    status: d.status,
    deltaStatus: d.deltaStatus,
    drift: d.drift,
    triggerPhase2: d.triggerPhase2,
    zScore: d.zScore || 0,
    onWatchlist: d.onWatchlist || false,
  }));

  const nkpi = Math.min(100, Math.max(0, apiData?.nkpi || latestWeekly?.nkpi || 0));
  const overallStatus = analysis?.overallStatus || "Stable";

  const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
    "At Risk":   { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20" },
    "Critical":  { color: "text-red-500",    bg: "bg-red-500/10",    border: "border-red-500/20" },
    "Stable":    { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    "Peak":      { color: "text-secondary",  bg: "bg-secondary/10",  border: "border-secondary/20" },
  };
  const statusLine = statusConfig[overallStatus] || statusConfig["Stable"];

  return (
    <div className="relative mx-auto py-8 px-6 space-y-8 animate-in fade-in duration-500">

      {/* Phase 2 Banner */}
      {isPhase2Pending && (
        <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Deep diagnostic available</p>
              <p className="text-gray-400 text-xs mt-0.5">
                A deep diagnostic session has been triggered for your protocol.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              className="h-8 px-3 text-xs"
              onClick={() => document.getElementById("results-content")?.scrollIntoView({ behavior: 'smooth' })}
            >
              Skip for now
            </Button>
            <Button variant="goldDark" className="h-8 px-4 text-xs" onClick={() => navigate("/phase2")}>
              Start Diagnostic
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <p className="text-secondary text-xs font-medium">Week {latestWeekly.week}</p>
          <h4 className="text-white font-semibold">Weekly Results</h4>
          <div className="flex flex-wrap items-center gap-3">
            <CountdownTimer initialTime={remainingTime} gated={isPhase2Pending} onRefresh={refetch} />
            {remainingTime === 0 && !isWeekSubmitted && !isPhase2Pending && (
              <Button variant="goldDark" className="h-9 px-4 text-xs font-medium" onClick={() => navigate("/weekly")}>
                Start Week {nextWeek} Check-in <ChevronRight className="ml-1 w-3.5 h-3.5" />
              </Button>
            )}
            {isWeekSubmitted && (
              <span className="flex items-center gap-2 text-emerald-400 font-medium text-xs bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                ✓ Week {latestWeekly.week} submitted
              </span>
            )}
            {isPhase2Pending && (
              <Button variant="goldDark" className="h-9 px-4 text-xs font-medium bg-rose-600 hover:bg-rose-500 hover:text-white" onClick={() => navigate("/phase2", { state: { domain: phase2?.primaryIssue } })}>
                Start Phase 2 <ChevronRight className="ml-1 w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className={`self-start px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${statusLine.bg} ${statusLine.color} border ${statusLine.border}`}>
          <span>Status: {overallStatus}</span>
        </div>
      </div>

      <div id="results-content" className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-1 space-y-4">

          {/* Score Card */}
          <Card className="relative overflow-hidden">
            <p className="text-gray-400 text-xs font-medium mb-1 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-secondary" /> Overall score
            </p>
            <h5 className="text-white font-semibold mb-4">Your Score This Week</h5>

            <div className="h-44 flex items-center justify-center -mt-2">
              <GaugeComponent
                type="semicircle"
                arc={{
                  width: 0.15, padding: 0.02, cornerRadius: 1,
                  subArcs: [
                    { limit: 30, color: '#EA4242', showTick: true },
                    { limit: 50, color: '#F5CD19', showTick: true },
                    { limit: 70, color: '#5BE12C', showTick: true },
                    { limit: 100, color: '#EDDC90', showTick: true },
                  ]
                }}
                pointer={{ type: "blob", animationDelay: 0, color: '#ffffff' }}
                value={nkpi}
                labels={{
                  valueLabel: {
                    style: { fontSize: "36px", fill: "#fff", fontWeight: "bold" },
                    formatTextValue: (value: any) => value
                  }
                }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm">
                {overallStatus === "Stable" || overallStatus === "Peak"
                  ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                  : <TrendingDown className="w-4 h-4 text-red-400" />
                }
                <span className="text-gray-300 text-sm">Overall health</span>
              </div>
              <span className={`text-sm font-medium ${statusLine.color}`}>{overallStatus}</span>
            </div>
          </Card>

          {/* Pattern */}
          {analysis?.pattern && (
            <Card className="bg-secondary/5 border-secondary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Brain className="w-4 h-4 text-secondary" />
                </div>
                <h6 className="text-white font-medium text-base">Pattern detected</h6>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed italic">"{analysis.pattern}"</p>
            </Card>
          )}

          {/* Progress */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <h6 className="text-white font-medium text-base">Your progress</h6>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 text-gray-400">
                  <span>Calibration</span>
                  <span className="text-secondary font-medium">{Math.max(0, latestWeekly.week - 1)} of {totalWeeks} weeks</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full transition-all duration-1000"
                    style={{ width: `${(Math.max(0, latestWeekly.week - 1) / totalWeeks) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                  <p className="text-gray-500 text-[10px] mb-1">Weeks done</p>
                  <p className="text-white font-semibold text-lg">{Math.max(0, latestWeekly.week - 1)}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                  <p className="text-gray-500 text-[10px] mb-1">Remaining</p>
                  <p className="text-white font-semibold text-lg">{Math.max(0, totalWeeks - (latestWeekly.week - 1))}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Insights */}
          {analysis && (
            <Card className="border-l-4 border-l-secondary p-0">
              <div className="p-6 space-y-6">
                <h5 className="text-white font-semibold text-xl">Insights</h5>

                {/* Primary */}
                {(analysis.primaryIssue || analysis.primaryIssueText) && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <span className="w-1.5 h-5 bg-red-500 rounded-full" />
                      <span className="text-white font-medium text-sm">
                        Primary — {DOMAIN_COLORS[analysis.primaryIssue?.domain]?.label || analysis.primaryIssue?.domain || "Constraint"}
                      </span>
                      {analysis.primaryIssue?.status && (
                        <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                          {analysis.primaryIssue.status}
                        </span>
                      )}
                    </div>
                    {analysis.primaryIssueText && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-white text-sm">{analysis.primaryIssueText}</p>
                      </div>
                    )}
                    {analysis.primaryIssue && (
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Score", val: `${Math.round(analysis.primaryIssue.score)}` },
                          { label: "Baseline", val: `${Math.round(analysis.primaryIssue.baseline)}` },
                          { label: "Delta", val: `${analysis.primaryIssue.delta > 0 ? "+" : ""}${Math.round(analysis.primaryIssue.delta)}` },
                        ].map((item) => (
                          <div key={item.label} className="p-2.5 bg-white/5 rounded-xl text-center border border-white/5">
                            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                            <p className="text-white text-sm font-bold">{item.val}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Secondary */}
                {(analysis.secondaryIssue || analysis.secondaryIssueText) && (
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <span className="w-1.5 h-5 bg-secondary rounded-full" />
                      <span className="text-white font-medium text-sm">
                        Secondary — {DOMAIN_COLORS[analysis.secondaryIssue?.domain]?.label || analysis.secondaryIssue?.domain || "Signal"}
                      </span>
                      {analysis.secondaryIssue?.status && (
                        <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                          {analysis.secondaryIssue.status}
                        </span>
                      )}
                    </div>
                    {analysis.secondaryIssueText && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/5 border border-secondary/20">
                        <Brain className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                        <p className="text-white text-sm">{analysis.secondaryIssueText}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Stable \u2014 no issues */}
                {!analysis.primaryIssue && !analysis.secondaryIssue && !analysis.primaryIssueText && (
                  <p className="text-gray-500 text-sm">All systems operating within normal parameters.</p>
                )}
              </div>
            </Card>
          )}

          {/* Domain Results */}
          <Card>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
              <h5 className="text-white font-semibold text-xl">Domain Breakdown</h5>
              <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">vs. baseline</span>
            </div>

            <div className="space-y-2">
              {results.map((item: any) => {
                const color = DOMAIN_COLORS[item.domain]?.color || "#EDDC90";
                const label = DOMAIN_COLORS[item.domain]?.label || item.domain;
                const isPositive = item.delta > 0;
                const isNegative = item.delta < 0;

                return (
                  <div key={item.domain} className="group pb-6 border-b border-dashed border-white/5 last:border-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-7 rounded-full" style={{ backgroundColor: color }} />
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-white font-medium text-sm">{label}</span>
                            {item.onWatchlist && (
                              <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[9px] font-medium border border-red-500/20">Watchlist</span>
                            )}
                            {item.triggerPhase2 && (
                              <span className="px-1.5 py-0.5 rounded bg-secondary/10 text-secondary text-[9px] font-medium border border-secondary/20">Diagnostic</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-gray-400">{item.status}</span>
                            <span className="text-[10px] text-gray-600">z: {item.zScore.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="text-right">
                          <p className="text-gray-500 text-[10px] mb-0.5">Baseline</p>
                          <p className="text-gray-300 font-medium">{item.base}</p>
                        </div>
                        <div className="w-px h-5 bg-white/10" />
                        <div className="text-right">
                          <p className="text-gray-500 text-[10px] mb-0.5">Now</p>
                          <p className="text-white font-semibold">{item.current}</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium min-w-[46px] text-center ${isPositive ? "bg-emerald-500/10 text-emerald-400" : isNegative ? "bg-red-500/10 text-red-400" : "bg-white/5 text-gray-400"}`}>
                          {isPositive ? "+" : ""}{item.delta}
                        </div>
                      </div>
                    </div>

                    <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mt-1">
                      <div className="absolute top-0 bottom-0 w-0.5 bg-white/20 z-10" style={{ left: `${item.base}%` }} />
                      <div
                        className="absolute top-0 bottom-0 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${item.current}%`, background: `linear-gradient(90deg, ${color}66, ${color})` }}
                      />
                    </div>

                    <div className="flex justify-between mt-1.5 px-0.5">
                      <p className="text-[10px] text-gray-500">{item.drift}</p>
                      <p className={`text-[10px] font-medium ${isPositive ? "text-emerald-500" : isNegative ? "text-red-400" : "text-gray-500"}`}>
                        {item.deltaStatus}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* No Phase 2 message */}
      {!isPhase2Pending && (
        <Card className="text-center py-8 bg-white/5 border-dashed border-white/10">
          <p className="text-gray-500 text-sm">No deep assessment needed this week — all domains are within normal range.</p>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <button
          onClick={() => window.print()}
          className="text-gray-500 hover:text-white transition-colors text-sm"
        >
          Export report
        </button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>
          <Button onClick={() => navigate("/dashboard")} className="gap-2 flex items-center">
            Done <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}