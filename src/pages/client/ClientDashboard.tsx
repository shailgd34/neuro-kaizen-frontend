import AssessmentBanner from "../../components/client/Dashboard/AssessmentBanner";
import CalibrationBanner from "../../components/client/Dashboard/CalibrationBanner";
import DomainRadarChart from "../../components/client/Dashboard/DomainRadarChart";
import FiveDomainRecord from "../../components/client/Dashboard/FiveDomainRecord";
import PerformanceChart from "../../components/client/Dashboard/PerformanceChart";
import PerformanceIndexCard from "../../components/client/Dashboard/PerformanceIndexCard";
import PerformancePressureCard from "../../components/client/Dashboard/PerformancePressureCard";
import SummaryStatsRow from "../../components/client/Dashboard/SummaryStatsRow";
import { Activity } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { getBaselineResults, getAssessmentQuestions } from "../../api/baselineApi";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import type { RootState } from "../../store/store";

export default function ClientDashboard() {
  const { name } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: () => getBaselineResults(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const apiData = data?.data;
  const mode = apiData?.mode;

  // -------------------------------
  // 🔹 RAW DATA
  // -------------------------------
  // Build submissions[] for charts from calibration.weeklyMetrics + baseline
  const baselineSubmission = apiData?.submissions?.find((s: any) => s.type === "baseline");

  // Build submissions[] for charts from calibration.weeklyMetrics + baseline
  const weeklyMetrics = apiData?.calibration?.weeklyMetrics || [];
  const rawSubmissions = apiData?.submissions || [];

  const submissions = [
    // Baseline as week 0
    ...(baselineSubmission || apiData?.baseline?.status === "completed"
      ? [{ type: "baseline" as const, week: 0, nkpi: baselineSubmission?.nkpi || apiData?.baseline?.score }]
      : []),
    // Weekly check-ins
    ...weeklyMetrics.map((wm: any) => ({
      type: "weekly" as const,
      week: wm.week,
      nkpi: wm.nkpi_score,
    })),
    // Or if weekly is in rawSubmissions but not weeklyMetrics
    ...rawSubmissions.filter((s: any) => s.type === 'weekly').map((wm: any) => ({
      type: "weekly" as const,
      week: wm.week,
      nkpi: wm.nkpi,
    }))
  ].reduce((acc: any[], curr) => {
    // deduplicate by week
    if (!acc.find(item => item.week === curr.week && item.type === curr.type)) {
      acc.push(curr);
    }
    return acc;
  }, []);

  // Derived data — use latest submitted week (highest week number)
  const latestMetric = [...weeklyMetrics].sort((a: any, b: any) => b.week - a.week)[0];
  const summary = latestMetric?.analysis?.summary || apiData?.analysis?.summary;
  const topSummary = apiData?.summary;
  const recommendations = apiData?.recommendations || [];
  const topPrimaryIssue = apiData?.primaryIssue;   // top-level domain object
  const topSecondaryIssue = apiData?.secondaryIssue; // top-level domain object

  // analysisDomains: prefer latest week's domains (most up-to-date), fallback to baseline
  const rawDomains = latestMetric?.domains || apiData?.domains || baselineSubmission?.domainScores || apiData?.baseline?.domains || [];
  const analysisDomains = rawDomains.map((d: any) => ({
    domain: d.domain,
    baseline: d.baseline ?? d.score,
    current: d.score,
    delta: d.delta ?? 0,
    zScore: d.zScore ?? 0,
    drift: d.drift ?? "Stable",
    status: d.status ?? "Stable",
    phase2: d.triggerPhase2 ? { eligible: true, selected: d.triggerPhase2 } : undefined,
  }));
  const isBaselineSubmitted =
    apiData?.isBaselineSubmitted === true ||
    apiData?.draftStatus === "completed" ||
    apiData?.baseline?.status === "completed" ||
    apiData?.isBaselineCompleted === true;
  const calibration = apiData?.calibration;

  // -------------------------------
  // 🔹 RUNNING STATE (IMPORTANT FIX)
  // -------------------------------

  const draftStatus = apiData?.draftStatus;

  // We need to fetch questions API to get `progress.completed` because `getBaselineResults()`
  // doesn't return progress on pending/draft baseline.
  const { data: questionsData } = useQuery({
    queryKey: ["assessment-questions", 1],
    queryFn: () => getAssessmentQuestions(1, "baseline"),
    enabled: (!isBaselineSubmitted && apiData) !== false,
  });

  const answeredCount =
    questionsData?.progress?.completed ||
    apiData?.progress?.completed ||
    apiData?.baseline?.answeredCount ||
    0;

  const totalQuestions =
    questionsData?.progress?.total ||
    apiData?.progress?.total ||
    apiData?.baseline?.total ||
    200;

  // Progress banner shows if we have started (draft) but not finished.
  // The /scores endpoint signals in-progress baseline via baseline.status === "draft"
  // (the /questions endpoint signals via draftStatus field — support both)
  const isBaselineInProgress =
    draftStatus === "draft" ||
    draftStatus === "pending" ||
    questionsData?.draftStatus === "draft" ||
    apiData?.baseline?.status === "draft" ||
    answeredCount > 0;

  const showProgressBanner = isBaselineInProgress && !isBaselineSubmitted;

  // Welcome shows ONLY if we haven't started at all
  const showWelcome = !isBaselineSubmitted && !showProgressBanner;

  const type: "weekly" | "baseline" = isBaselineSubmitted
    ? "weekly"
    : "baseline";

  const runningAssessment = showProgressBanner && !isBaselineSubmitted
    ? {
      type,
      week: apiData?.calibration?.currentWeek ?? 0,
      answered: answeredCount,
      total: isBaselineSubmitted ? 30 : totalQuestions,
      status: (questionsData?.draftStatus || draftStatus || "draft") as "draft" | "pending",
    }
    : undefined;

  const isBaselineNotStarted = showWelcome;

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "—";

    const now = new Date().getTime();
    const past = new Date(dateString).getTime();
    const diff = Math.floor((now - past) / 1000); // in seconds

    if (diff < 60) return `${diff}s ago`;

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!isLoading && isBaselineNotStarted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[70vh] animate-in fade-in duration-1000">
        <div className="w-full max-w-2xl relative">
          {/* Background Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

          <Card className="relative overflow-hidden border-white/10 bg-[#0B0E14]/80 backdrop-blur-2xl p-10 text-center">
            <div className="flex justify-center mb-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-amber-500/20 blur-xl group-hover:bg-amber-500/30 transition-all duration-500 rounded-full" />
                <div className="relative w-20 h-20 flex items-center justify-center rounded-3xl bg-[#111827] border border-amber-500/30 shadow-2xl group-hover:scale-105 transition-all duration-500">
                  <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">⚡</span>
                </div>
              </div>
            </div>

            <h4 className="text-white mb-2 font-bold tracking-tight">
              Initialize your <span className="text-amber-500">baseline</span>
            </h4>

            <p className="text-gray-400 text-lg max-w-md mx-auto mb-10 font-medium">
              Welcome, <span className="text-white font-bold">{name}</span>. Complete the initial assessment to unlock your performance tracking.
            </p>

            <div className="grid grid-cols-1 gap-4 text-left mb-12">
              {[
                { label: "Duration", val: `~${apiData?.progress?.total || 200} Questions (20m)`, icon: "⏱" },
                { label: "Threshold", val: "90% Completion Required", icon: "📊" },
                { label: "Autosave", val: "Resume anytime, anywhere", icon: "💾" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-colors">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">{item.label}</p>
                    <p className="text-white font-bold text-sm">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => navigate("/baseline")}
              variant="goldDark"
              className="w-full h-12 text-sm font-semibold shadow-lg transition-all"
            >
              Start baseline assessment
            </Button>

            <p className="text-xs text-gray-500 mt-6 font-medium opacity-50">
              Baseline Phase • V1.0.4
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // -------------------------------
  // 🔹 HEADER
  // -------------------------------
  const DashboardHeader = () => (
    <div className="flex justify-between items-end pb-8 border-b border-white/5 mb-8">
      <div>
        <div className="flex items-center gap-2 text-secondary text-xs font-medium mb-2">
          Dashboard
        </div>
        <h4 className="text-white font-bold tracking-tight">
          Performance <span className="text-secondary">Overview</span>
        </h4>

      </div>

      <div className="text-right">
        <p className="text-[10px] text-gray-500 font-medium mb-1.5 opacity-60">Last sync</p>
        <p className="text-xs text-white font-medium bg-white/5 px-4 py-2 rounded-xl border border-white/5">
          {getTimeAgo(apiData?.lastUpdate)}
        </p>
      </div>
    </div>
  );

  // -------------------------------
  // 🔹 BASELINE NOT COMPLETED
  // -------------------------------
  if (!isLoading && !isBaselineSubmitted) {
    return (
      <div className="mx-auto px-6 lg:px-10 py-8">
        <DashboardHeader />

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12">
            {showProgressBanner && runningAssessment && (
              <AssessmentBanner runningAssessment={runningAssessment} />
            )}

            <Card className="mt-8 text-center p-16 flex flex-col items-center justify-center bg-[#0B0E14]/50 border-white/5 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 mx-auto">
                <Activity size={32} className="text-gray-600" />
              </div>
              <div className="max-w-md mx-auto">
                <h5 className="text-white font-bold mb-3 text-xl">
                  Awaiting Performance Baseline
                </h5>

                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Complete your initial assessment to unlock the Neural HUD and personalized performance telemetry.
                </p>

                <div className="h-1 w-20 bg-secondary/20 rounded-full mx-auto" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Phase 2 — driven by weeklyStatus (most reliable source)
  const weeklyStatus = apiData?.weeklyStatus;
  const phase2Required = weeklyStatus?.phase2Pending === true;
  const phase2Completed = weeklyStatus?.phase2Pending === false && (apiData?.phase2Completed || apiData?.isTargetedComplete || false);

  // -------------------------------
  // 🔹 FULL DASHBOARD
  // -------------------------------
  return (
    <div className="mx-auto px-6 lg:px-10 py-8 animate-in fade-in duration-1000">
      {(mode === "calibrating" || mode === "calibration" || isBaselineSubmitted) && (
        <CalibrationBanner
          weeksSubmitted={weeklyStatus?.currentWeek || calibration?.currentWeek}
          totalWeeks={calibration?.totalWeeks}
          isBaselineSubmitted={isBaselineSubmitted}
          isLocked={weeklyStatus?.isLocked || calibration?.isLocked}
          isWeekSubmitted={weeklyStatus?.isCurrentWeekSubmitted || calibration?.isWeekSubmitted}
          remainingTime={weeklyStatus?.remainingTime || calibration?.remainingTime}
          phase2Required={phase2Required}
          phase2Completed={phase2Completed}
          targetDomain={weeklyStatus?.primaryIssue}
          onRefresh={refetch}
        />
      )}

      <DashboardHeader />

      {showProgressBanner && runningAssessment && (
        <div className="mb-10">
          <AssessmentBanner runningAssessment={runningAssessment} />
        </div>
      )}

      <div className="grid grid-cols-12 gap-8 mb-10 items-start">
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <PerformanceIndexCard submissions={submissions} />
          <PerformancePressureCard
            summary={summary}
            topSummary={topSummary}
            recommendations={recommendations}
            primaryIssue={topPrimaryIssue}
            secondaryIssue={topSecondaryIssue}
          />
        </div>

        <div className="col-span-12 lg:col-span-8 h-full">
          <PerformanceChart submissions={submissions} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 mb-10">
        <div className="col-span-12 lg:col-span-5">
          <DomainRadarChart analysisDomains={analysisDomains} />
        </div>
        <div className="col-span-12 lg:col-span-7">
          <FiveDomainRecord analysisDomains={analysisDomains} />
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[120px] group-hover:bg-blue-500/10 transition-all duration-1000" />
        <SummaryStatsRow summary={summary} />
      </div>
    </div>
  );
}
