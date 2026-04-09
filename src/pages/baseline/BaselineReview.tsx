import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Card from "../../components/ui/Card";
import { AlertCircle, Clock, ChevronRight, ArrowLeft } from "lucide-react";
import {
  getAssessmentQuestions,
  submitAssessment,
  getBaselineResults,
} from "../../api/baselineApi";
import { getAssessmentStartTime } from "../../constants/assessmentTime";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import StatusDialog from "../../components/ui/StatusDialog";
import Lottie from "lottie-react";
import success from "../../lottie/success02.json";
import Button from "../../components/ui/Button";

export default function BaselineReview() {
  const [openDialog, setopenDialog] = useState(false);
  const navigate = useNavigate();
  const basePath = "/baseline";
  const assessmentPath = `${basePath}/assessment`;

  const { data: questionsData, isLoading: isQuestionsLoading } = useQuery({
    queryKey: ["assessment-progress"],
    queryFn: () => getAssessmentQuestions(1, "baseline"),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: stateData, isLoading: isStateLoading } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: () => getBaselineResults(),
  });

  const isLoading = isQuestionsLoading || isStateLoading;
  const apiState = stateData?.data || stateData;

  const completed = apiState?.progress?.completed || 0;
  const total = apiState?.progress?.total || 200;
  const MIN_REQUIRED = Math.ceil(total * 0.9);

  const assessmentId = questionsData?.assignmentId || questionsData?.assessmentId || "N/A";

  const submitMutation = useMutation({
    mutationFn: () => submitAssessment("baseline"),
    onSuccess: () => {
      setopenDialog(true);
      const storageKey = "baseline_start_time";
      localStorage.removeItem(storageKey);
      toast.success("Assessment submitted successfully");
    },
    onError: () => {
      toast.error("Failed to submit assessment. Please try again.");
    }
  });

  const isSubmitted = apiState?.isBaselineSubmitted || questionsData?.isSubmitted;
  useEffect(() => {
    if (!isLoading && isSubmitted) {
      navigate(`${basePath}/results`, { replace: true });
    }
  }, [isLoading, isSubmitted, navigate]);

  useEffect(() => {
    if (!openDialog) return;
    const timer = setTimeout(() => {
      navigate(`${basePath}/results`);
    }, 2500);
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

  const unanswered = total - completed;
  const progress = Math.round((completed / total) * 100);
  const QUESTIONS_PER_PAGE = 10;
  const resumePage = Math.floor(completed / QUESTIONS_PER_PAGE) + 1;

  const isEligible = completed >= MIN_REQUIRED;

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
    <Card className="max-w-4xl mx-auto py-8 px-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h4 className="text-white font-bold mb-2">Final Review</h4>
        <p className="text-gray-400 text-sm">
          Please review your progress before completing the assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white/2 border-white/5 p-5">
          <p className="text-gray-500 text-xs font-medium mb-1">Completion</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-white font-bold">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-secondary rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </Card>

        <Card className="bg-white/2 border-white/5 p-5">
          <p className="text-gray-500 text-xs font-medium mb-1">Total Answered</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-white font-bold">{completed}</span>
            <span className="text-gray-500 text-sm">/ {total}</span>
          </div>
          {unanswered > 0 ? (
            <button
              onClick={() => navigate(`${assessmentPath}?page=${resumePage}&fromReview=true`)}
              className="mt-3 text-[11px] text-secondary hover:underline font-medium flex items-center gap-1"
            >
              Continue answering ({unanswered} left) <ChevronRight size={12} />
            </button>
          ) : (
            <p className="mt-3 text-[11px] text-emerald-400 font-medium">All questions complete</p>
          )}
        </Card>

        <Card className="bg-white/2 border-white/5 p-5">
          <p className="text-gray-500 text-xs font-medium mb-1">Time Spent</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-white font-bold">{elapsedMinutes}</span>
            <span className="text-gray-500 text-sm">minutes</span>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[11px] text-gray-500">
            <Clock size={12} /> Live tracking active
          </div>
        </Card>
      </div>

      {isEligible ? (
        <div className="mb-8 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircleIcon size={12} className="text-black" />
          </div>
          <p className="text-sm text-emerald-100 leading-relaxed">
            You have met the minimum requirement of {MIN_REQUIRED} responses. You can submit now or keep answering for better accuracy.
          </p>
        </div>
      ) : (
        <div className="mb-8 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-3">
          <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-100 leading-relaxed">
            You have {unanswered} questions left. You need at least {MIN_REQUIRED} responses to submit your assessment.
          </p>
        </div>
      )}

      <Card className="bg-white/2 border-white/5 p-6 mb-8">
        <h6 className="text-white font-semibold mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-secondary" /> Important Info
        </h6>
        <ul className="text-sm text-gray-400 space-y-3 pl-1">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary/40 mt-1.5 shrink-0" />
            Once submitted, your baseline cannot be changed.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary/40 mt-1.5 shrink-0" />
            These results set the foundation for your performance tracking.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary/40 mt-1.5 shrink-0" />
            Results will be available immediately after submission.
          </li>
        </ul>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-between pt-4 border-t border-white/5">
        <Button
          variant="outline"
          onClick={() => navigate(`${assessmentPath}?page=${resumePage}&fromReview=true`)}
          className="order-2 sm:order-1"
        >
          <ArrowLeft size={16} /> Back to questions
        </Button>

        <Button
          variant="goldDark"
          disabled={!isEligible || submitMutation.isPending}
          onClick={handleSubmit}
          className="order-1 sm:order-2 min-w-50"
        >
          {submitMutation.isPending ? "Submitting..." : "Submit assessment"}
        </Button>
      </div>

      <p className="text-center text-[10px] text-gray-600 mt-12">
        ID: {assessmentId}
      </p>

      <StatusDialog
        open={openDialog}
        onClose={() => {}}
        icon={
          <div className="w-20 h-20">
            <Lottie animationData={success} loop={false} />
          </div>
        }
        title="Assessment Submitted"
        description="Your assessment has been successfully submitted. We are now preparing your results."
      />
    </Card>
  );
}

function CheckCircleIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
