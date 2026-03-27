import AssessmentBanner from "../../components/client/Dashboard/AssessmentBanner";
import CalibrationBanner from "../../components/client/Dashboard/CalibrationBanner";
import DomainRadarChart from "../../components/client/Dashboard/DomainRadarChart";
import FiveDomainRecord from "../../components/client/Dashboard/FiveDomainRecord";
import PerformanceChart from "../../components/client/Dashboard/PerformanceChart";
import PerformanceIndexCard from "../../components/client/Dashboard/PerformanceIndexCard";
import PerformancePressureCard from "../../components/client/Dashboard/PerformancePressureCard";
import SummaryStatsRow from "../../components/client/Dashboard/SummaryStatsRow";

import { useQuery } from "@tanstack/react-query";
import { getBaselineResults } from "../../api/baselineApi";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import type { RootState } from "../../store/store";

export default function ClientDashboard() {
  const { name } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
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
  const submissions = apiData?.submissions || [];
  const summary = apiData?.analysis?.summary;
  const analysisDomains = apiData?.analysis?.domains || [];

  const isBaselineSubmitted = apiData?.isBaselineCompleted;
  const calibration = apiData?.calibration;

  // -------------------------------
  // 🔹 DERIVED DATA (KEEP OLD STRUCTURE)
  // -------------------------------

  const baselineSubmission = submissions.find(
    (s: any) => s.type === "baseline",
  );

  const weeklySubmission = [...submissions]
    .reverse()
    .find((s: any) => s.type === "weekly");

  const baseline =
    baselineSubmission?.domainScores?.map((d: any) => ({
      domain: d.domain,
      score: d.score,
    })) || [];

  const weekly =
    weeklySubmission?.domainScores?.map((d: any) => ({
      domain: d.domain,
      score: d.score,
    })) || [];

  // -------------------------------
  // 🔹 RUNNING STATE (IMPORTANT FIX)
  // -------------------------------

  const draftStatus = apiData?.draftStatus;
  const showProgressBanner = draftStatus === "draft";
  const showWelcome = draftStatus === "pending";

  const type: "weekly" | "baseline" = isBaselineSubmitted
    ? "weekly"
    : "baseline";

  const runningAssessment = showProgressBanner
    ? {
        type,
        week: apiData?.calibration?.currentWeek ?? 0,
        answered: 1,
        total: isBaselineSubmitted ? 30 : 200,
        status: "draft" as const,
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
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="w-full max-w-xl text-center">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20 animate-pulse">
                <span className="text-yellow-400 text-xl">⚡</span>
              </div>
            </div>

            <h4 className="text-3xl font-semibold text-white mb-2">
              Welcome, {name}
            </h4>

            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Let’s begin by establishing your baseline. This one-time
              assessment helps us understand your current performance across key
              domains.
            </p>

            <div className="bg-[#0b1220] border border-gray-800 p-6 text-left shadow-xl backdrop-blur-sm">
              <h5 className="text-white font-medium mb-4">What to expect</h5>

              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✔</span>
                  <p>~200 questions (10–15 minutes)</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✔</span>
                  <p>Minimum 90% completion required</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✔</span>
                  <p>Auto-save enabled — resume anytime</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✔</span>
                  <p>Generates baseline score & NKPI insights</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800 text-center">
                <Button
                  onClick={() => navigate("/baseline")}
                  className="w-full bg-yellow-500 text-black py-3 font-medium"
                >
                  Start Baseline Assessment
                </Button>

                <p className="text-xs text-gray-400 mt-3">
                  Takes about 25–30 minutes. You can pause anytime.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-400 mt-6">
              Your dashboard unlocks after your first submission.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // -------------------------------
  // 🔹 HEADER
  // -------------------------------
  const DashboardHeader = () => (
    <div className="flex justify-between items-center pb-6">
      <div>
        <h5 className="text-2xl font-semibold text-white mb-1">
          Performance Overview
        </h5>
        <p className="font-light text-gray-400">
          Executive Dashboard • Week {calibration?.currentWeek ?? 0}
        </p>
      </div>

      <p className="text-sm text-gray-400">
        Last Updated: {getTimeAgo(apiData?.lastUpdate)}
      </p>
    </div>
  );

  // -------------------------------
  // 🔹 BASELINE NOT COMPLETED
  // -------------------------------
  if (!isLoading && !isBaselineSubmitted) {
    return (
      <>
        <DashboardHeader />

        <div className="">
          {showProgressBanner && runningAssessment && (
            <AssessmentBanner runningAssessment={runningAssessment} />
          )}

          <Card className="mt-6 text-center min-h-80 flex flex-col justify-center">
            <div className="max-w-xl mx-auto">
              <h5 className="text-white font-medium mb-2">
                Your performance insights will appear here.
              </h5>

              <p className="text-gray-400 text-sm leading-relaxed">
                Complete your baseline assessment and weekly check-ins to unlock
                your domain scores, performance trends, and calibration
                insights.
              </p>

              <p className="text-gray-500 text-xs mt-3">
                Once enough data is collected, this dashboard will begin to
                reflect your cognitive patterns and progress over time.
              </p>
            </div>
          </Card>
        </div>
      </>
    );
  }

  // -------------------------------
  // 🔹 FULL DASHBOARD
  // -------------------------------
  return (
    <div className="px-8">
      {mode === "calibration" && isBaselineSubmitted && (
        <CalibrationBanner
          weeksSubmitted={calibration?.currentWeek}
          isBaselineSubmitted={isBaselineSubmitted}
        />
      )}

      <DashboardHeader />

      {showProgressBanner && runningAssessment && (
        <AssessmentBanner runningAssessment={runningAssessment} />
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col gap-6">
          <PerformanceIndexCard baseline={baseline} weekly={weekly} />
          <PerformancePressureCard
            baseline={baseline}
            weekly={weekly}
            summary={summary}
          />
        </div>

        <PerformanceChart submissions={submissions} />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <DomainRadarChart baseline={baseline} weekly={weekly} />
        <FiveDomainRecord
          baseline={baseline}
          weekly={weekly}
          analysisDomains={analysisDomains}
        />
      </div>

      <SummaryStatsRow baseline={baseline} weekly={weekly} summary={summary} />
    </div>
  );
}
