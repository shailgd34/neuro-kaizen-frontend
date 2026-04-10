import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDraftStatusConfig } from "../../features/baseline/utils/status";

import {
  getAssessmentQuestions,
  restartAssignment,
  getBaselineResults
} from "../../api/baselineApi";
import { useEffect } from "react";
import { toast } from "react-toastify";
import Card from "../../components/ui/Card";

// const TOTAL_SECTIONS = 25;

export default function BaselineIntro() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: questionsData, isLoading: isQuestionsLoading, isError } = useQuery({
    queryKey: ["questions", "baseline"],
    queryFn: () => getAssessmentQuestions(1, "baseline"),
  });

  // Fetch the user's state/scores API to get accurate draftStatus and progress
  const { data: stateData, isLoading: isStateLoading } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: () => getBaselineResults(),
  });

  const basePath = "/baseline";
  const isLoading = isQuestionsLoading || isStateLoading;

  const apiState = stateData?.data || stateData;

  const isBaselineCompleted = 
    apiState?.isBaselineSubmitted || 
    apiState?.baseline?.status === "completed" || 
    apiState?.draftStatus === "completed" ||
    questionsData?.isBaselineCompleted ||
    questionsData?.draftStatus === "completed";
  const answeredCount = questionsData?.progress?.completed || apiState?.progress?.completed || 0;
  const total = questionsData?.progress?.total || apiState?.progress?.total || 200;
  
  const draftStatus = questionsData?.draftStatus || apiState?.draftStatus || "pending";
  const currentStatus = getDraftStatusConfig(draftStatus);

  const progress = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  // If the state API gives a resumePage, use it, otherwise calculate from answered
  const calculatedResumePage = Math.floor(answeredCount / 8) + 1;
  const resumePage = apiState?.resumePage || calculatedResumePage;

  const isResume = draftStatus === "draft" || draftStatus === "pending" || answeredCount > 0;

  useEffect(() => {
    if (isLoading) return;
    if (isBaselineCompleted) {
      navigate("/baseline/results", { replace: true });
    }
  }, [isLoading, isBaselineCompleted, navigate]);

  const restartMutation = useMutation({
    mutationFn: restartAssignment,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["questions", "baseline"] });
      toast.success("Assessment restarted successfully");
      localStorage.removeItem("baseline_start_time");
      navigate(`${basePath}/assessment?page=1`);
    },
  });

  const handleStart = () => {
    navigate(`${basePath}/assessment?page=1`);
  };

  const handleResume = () => {
    navigate(`${basePath}/assessment?page=${resumePage}`);
  };

  const handleRestart = () => {
    restartMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mb-4"></div>
        <p className="text-sm">Loading assessment...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h4 className="text-rose-400 font-bold mb-2">Error</h4>
        <p className="text-gray-400 mb-6 text-sm">
          We couldn't retrieve your progress. Please try again.
        </p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500">
      <Card className="bg-white/[0.02] border-white/5 p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
            <div>
              <span className="bg-secondary/10 border border-secondary/20 py-1 px-3 rounded-lg text-[10px] font-bold text-secondary uppercase tracking-wider inline-flex items-center gap-1 mb-4">
                Baseline Assessment
              </span>
              <h4 className="text-white font-bold mb-3">
                {isResume ? "Resume Assessment" : "Performance Baseline"}
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                This assessment establishes your performance baseline across five core domains. 
                Answer naturally based on your typical daily experience.
              </p>
            </div>

            {isResume && (
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl min-w-[200px]">
                <div className="text-xs text-gray-500 font-medium mb-3">
                  Status: <span className={`font-bold ${currentStatus.color}`}>{currentStatus.label}</span>
                </div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Progress</span>
                  <span className="text-xs text-white font-bold">{progress}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h6 className="text-white font-semibold text-sm mb-4">Structure</h6>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex gap-3">
                  <span className="text-secondary opacity-50">•</span>
                  <span>200 statements using a 1-7 agreement scale</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-secondary opacity-50">•</span>
                  <span>Minimum 90% completion required for submission</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-secondary opacity-50">•</span>
                  <span>Expected time: 20-30 minutes</span>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="text-white font-semibold text-sm mb-4">Protocol</h6>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex gap-3">
                  <span className="text-secondary opacity-50">•</span>
                  <span>Establishing your performance anchor</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-secondary opacity-50">•</span>
                  <span>Retakes require coach approval</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-secondary opacity-50">•</span>
                  <span>Your data remains strictly confidential</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 pt-8 border-t border-white/5">
            {isResume ? (
              <>
                <Button onClick={handleResume} variant="goldDark" className="px-12 h-12 text-sm font-bold shadow-xl shadow-secondary/10">
                  Resume Assessment
                </Button>
                <button
                  onClick={handleRestart}
                  disabled={restartMutation.isPending}
                  className="text-[11px] text-gray-500 hover:text-rose-400 transition-colors font-medium uppercase tracking-wider"
                >
                  {restartMutation.isPending ? "Restarting..." : "Restart assessment"}
                </button>
              </>
            ) : (
              <Button onClick={handleStart} variant="goldDark" className="px-12 h-12 text-sm font-bold shadow-xl shadow-secondary/10">
                Begin Assessment
              </Button>
            )}
            
            <p className="text-[10px] text-gray-600 font-medium">
              You can exit and resume your progress at any time.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
