import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Card from "../../components/ui/Card";
import { AlertCircle, Clock } from "lucide-react";
import {
  getAssessmentQuestions,
  submitAssessment,
} from "../../api/baselineApi";
import { getAssessmentStartTime } from "../../constants/assessmentTime";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import StatusDialog from "../../components/ui/StatusDialog";
import Lottie from "lottie-react";
import success from "../../lottie/success02.json";

export default function BaselineReview() {
  const MIN_REQUIRED = 180;
  const [openDialog, setopenDialog] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const basePath = "/baseline";
  const assessmentPath = `${basePath}/assessment`;

  const { data, isLoading } = useQuery({
    queryKey: ["assessment-progress"],
    queryFn: () => getAssessmentQuestions(1, "baseline"), // baseline always starts at page 1, weekly may start at page 0 if no questions answered
    staleTime: 1000 * 60 * 5,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const assessmentId = data?.assignmentId || "N/A";

  const submitMutation = useMutation({
    mutationFn: () => submitAssessment("baseline"),
    onSuccess: () => {
      setopenDialog(true);
      const storageKey = "baseline_start_time";

      localStorage.removeItem(storageKey);
      toast.success("Your Assesment Submitted");
      navigate(`${basePath}/results`);
    },
  });

  const isSubmitted = data?.isSubmitted;
  useEffect(() => {
    if (!isLoading && isSubmitted) {
      navigate(`${basePath}/results`, {
        replace: true,
      });
    }
  }, [isLoading, isSubmitted, navigate]);
  useEffect(() => {
    if (!openDialog) return;

    const timer = setTimeout(() => {
      navigate(`${basePath}/results`);
    }, 2000); // 2 seconds feels natural

    return () => clearTimeout(timer);
  }, [openDialog, navigate]);

  const startTime = getAssessmentStartTime();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  const completed = data?.progress?.completed || 0;
  const total = data?.progress?.total || 200;

  const unanswered = total - completed;
  const progress = Math.round((completed / total) * 100);
  const QUESTIONS_PER_PAGE = 10; // must match backend pagination

  const resumePage = Math.floor(completed / QUESTIONS_PER_PAGE) + 1;

  const avgSecondsPerQuestion = completed > 0 ? elapsedSeconds / completed : 8;

  const estimatedMinutes = unanswered
    ? Math.ceil((unanswered * avgSecondsPerQuestion) / 60)
    : 0;

  const isEligible = completed >= MIN_REQUIRED;
  const canSubmit = isEligible;

  const handleSubmit = () => {
    if (!isEligible) {
      navigate(`${assessmentPath}?page=${resumePage}&fromReview=true`);
      return;
    }

    submitMutation.mutate();
  };

  useEffect(() => {
    if (!isLoading && completed === 0) {
      navigate(basePath, { replace: true });
    }
  }, [isLoading, completed, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-400">
        Loading review summary...
      </div>
    );
  }

  return (
    <>
      <Card className="max-w-6xl mx-auto p-10">
        <h4 className="text-3xl font-semibold text-white mb-2">
          Baseline Diagnostic — Final Review
        </h4>

        <p className="text-gray-400 mb-8">
          Assessment complete. Review your responses before submitting your{" "}
          baseline.
        </p>

        {/* Stats Cards */}

        <div className="grid grid-cols-3 gap-6 mb-4">
          {/* Completion */}
          <div className="bg-[#0F141A] border border-[#30363F] p-6 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Completion</p>
            <p className="text-3xl text-white font-bold">{progress}%</p>
            <div className="w-full h-2 bg-gray-700 rounded mt-4">
              <div
                className="h-2 bg-green-500 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Responses */}
          <div className="bg-[#0F141A] border border-[#30363F] p-6 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Responses</p>

            <p className="text-3xl text-white font-bold">
              {completed}
              <span className="text-gray-600 text-lg"> / {total}</span>
            </p>

            {unanswered > 0 ? (
              <button
                onClick={async () => {
                  await queryClient.invalidateQueries({
                    queryKey: ["assessment-questions"],
                  });
                  await queryClient.invalidateQueries({
                    queryKey: ["assessment-progress"],
                  });

                  navigate(
                    `${assessmentPath}?page=${resumePage}&fromReview=true`,
                  );
                }}
                className="mt-2 text-xs text-secondary hover:text-amber-300 hover:underline"
              >
                {unanswered} unanswered — continue answering
              </button>
            ) : (
              <p className="mt-2 text-xs text-green-400">
                All questions answered
              </p>
            )}
          </div>

          {/* Minimum Requirement */}
          <div className="bg-[#0F141A] border border-[#30363F] p-6 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Minimum Requirement</p>
            <p className="text-3xl text-white font-bold">
              {MIN_REQUIRED}
              <span className="text-gray-600 text-lg"> responses</span>
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <p className="text-gray-400 text-sm text-center mb-8">
            {completed} answered • {unanswered} remaining
            {unanswered > 0 && <> • ~{estimatedMinutes} minutes to finish</>}
          </p>

          <p className="text-gray-400 text-sm text-right mb-8 flex gap-2 justify-end">
            Time spent on this assessment:{" "}
            <span className="text-white flex gap-1 items-center">
              <Clock width={14} /> {elapsedMinutes} minutes
            </span>
          </p>
        </div>

        {isEligible ? (
          <div className="mb-8 text-gray-400 border-l-3 border-green-500 pl-4 bg-green-600/10 py-2">
            <div>You have reached the minimum response threshold.</div>
            <div className="mt-1">
              You may submit now or complete the remaining questions for a more
              accurate baseline.
            </div>
          </div>
        ) : (
          <div className="mb-8 text-red-400 border-l-2 border-red-500 pl-4 bg-red-600/10 py-2">
            You have <strong>{unanswered}</strong> unanswered questions. Minimum{" "}
            {MIN_REQUIRED} responses are required before submission.
          </div>
        )}

        <div className="bg-[#0F141A] border border-[#30363F] p-6 rounded-lg mb-8">
          <p className="text-gray-400 font-medium mb-3 flex gap-2">
            <AlertCircle width={16} /> Important Notice
          </p>

          <ul className="text-gray-400 list-disc pl-6 space-y-2">
            <>
              <li>Baseline results cannot be modified after submission</li>
              <li>Retakes require coach approval</li>
              <li>This submission establishes your calibration anchor</li>
            </>
          </ul>
        </div>

        <div className="flex justify-between">
          <button
            onClick={async () => {
              await queryClient.invalidateQueries({
                queryKey: ["assessment-questions"],
              });
              await queryClient.invalidateQueries({
                queryKey: ["assessment-progress"],
              });

              navigate(`${assessmentPath}?page=${resumePage}&fromReview=true`);
            }}
            className="border border-[#30363F] px-6 py-3 rounded text-gray-300 hover:bg-[#1A222C]"
          >
            Back to Assessment
          </button>

          <button
            disabled={!canSubmit || submitMutation.isPending}
            onClick={handleSubmit}
            className={`px-8 py-3 rounded font-semibold transition ${
              isEligible
                ? "bg-gray-200 text-black hover:bg-white"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Baseline "}
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-10">
          Assessment ID: {assessmentId} | Session expires in 45 minutes
        </p>
      </Card>

      <StatusDialog
        open={openDialog}
        onClose={() => setopenDialog(false)}
        icon={
          <div className="w-24 h-24">
            <Lottie animationData={success} loop={false} />
          </div>
        }
        title={"Baseline Submitted"}
        description={
          "Your baseline diagnostic has been successfully submitted. Preparing your results..."
        }
      />
    </>
  );
}
