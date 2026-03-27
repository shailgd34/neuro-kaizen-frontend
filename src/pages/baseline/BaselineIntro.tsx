import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDraftStatusConfig } from "../../features/baseline/utils/status";

import {
  getAssessmentQuestions,
  restartAssignment,
} from "../../api/baselineApi";
import { useEffect } from "react";
import { toast } from "react-toastify";

const TOTAL_SECTIONS = 25;

export default function BaselineIntro() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["questions", "baseline"],
    queryFn: () => getAssessmentQuestions(1, "baseline"),
  });

  const basePath = "/baseline";

  const isBaselineCompleted = data?.isBaselineCompleted;
  const answeredCount = data?.progress?.completed || 0;
  const total = data?.progress?.total || 200;
  
  const draftStatus = data?.draftStatus;
  const currentStatus = getDraftStatusConfig(draftStatus);

  const progress = Math.round((answeredCount / total) * 100);
  const resumePage = data?.resumePage || 1;
  const completedSections = Math.floor(answeredCount / 8);

  const isResume = answeredCount > 0;

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
      toast.success("Baseline assessment restarted. Redirecting to start...");

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

  return (
    <div className="flex justify-center items-center py-16 px-6">
      <div className="w-full max-w-6xl bg-[#0F141A] border border-[#30363F] rounded-xl p-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-4"></div>
            Loading assessment...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h4 className="text-red-400 mb-2">Failed to load assessment</h4>
            <p className="text-gray-400 mb-4">
              We couldn't retrieve your baseline progress.
            </p>

            <p className="text-xs text-gray-500 mb-6">{String(error)}</p>

            <Button variant="white" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="bg-orange-600/20 border boder-orange-600 py-1 px-3 rounded-full text-sm font-medium text-orange-600 inline-flex items-center gap-1 mb-3">
                  {"Baseline"}
                </span>
                <h5 className="text-2xl font-semibold text-white mb-2">
                  {isResume
                    ? "Resume Baseline Diagnostic (DCP™)"
                    : "Baseline Diagnostic (DCP™)"}
                </h5>

                {!isResume && (
                  <p className="text-gray-400">
                    This structured assessment establishes your performance
                    baseline across five core domains.
                  </p>
                )}
              </div>

              {isResume && (
                <div className="text-sm text-gray-400 text-right">
                  <div className="mb-2">
                    Draft Status:{" "}
                    <span className={`font-medium ${currentStatus.color}`}>
                      {currentStatus.label}
                    </span>
                  </div>

                  <div>Completion: {progress}%</div>
                </div>
              )}
            </div>

            {/* START SCREEN */}
            {!isResume && (
              <>
                <div className="flex justify-between text-sm text-gray-400 mb-6">
                  <div>
                    Estimated completion time:{" "}
                    <span className="text-white font-medium">
                      20–25 minutes
                    </span>
                  </div>

                  <div>
                    Assessment structure:{" "}
                    <span className="text-white font-medium">
                      {TOTAL_SECTIONS}  sections
                    </span>
                  </div>
                </div>

                <hr className="border-[#30363F] mb-6" />

                <ul className="space-y-2 text-gray-400 mb-6 list-disc pl-5">
                  <li>200 structured statements</li>
                  <li>1–7 agreement scale</li>
                  <li>Minimum 90% completion required (≥180/200)</li>
                  <li>200 structured statements</li>
                </ul>

                <hr className="border-[#30363F] mb-6" />

                <p className="text-gray-400 mb-8">
                  <>
                    Baseline submission establishes your{" "}
                    <span className="text-white font-medium">
                      calibration anchor
                    </span>
                    .
                    <br />
                    Retakes require coach approval.
                  </>
                </p>

                <div className="flex justify-center">
                  <Button variant="white" onClick={handleStart}>
                    Begin Assessment
                  </Button>
                </div>
              </>
            )}

            {/* RESUME SCREEN */}
            {isResume && (
              <>
                <hr className="border-[#30363F] mb-6" />

                <p className="text-gray-400 mb-6">
                  Your baseline assessment is currently in progress. You may
                  resume from your last completed section.
                </p>

                <div className="mb-6">
                  <h6 className="text-white font-medium mb-3">
                    Progress Summary
                  </h6>

                  <ul className="list-disc pl-5 text-gray-400 space-y-1">
                    <li>
                      Sections Completed: {completedSections} of{" "}
                      {TOTAL_SECTIONS}
                    </li>
                    <li>Completion: {progress}%</li>
                    <li>
                      Minimum 90% completion required for final submission.
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <Button onClick={handleResume} variant="white">
                    Resume Assessment
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    You may exit and resume at any time within 30 days.
                  </p>

                  <Button
                    onClick={handleRestart}
                    variant="outlineWhite"
                    disabled={restartMutation.isPending}
                  >
                    {restartMutation.isPending
                      ? "Restarting..."
                      : "Restart Assessment"}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
