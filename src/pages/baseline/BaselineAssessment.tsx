import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DOMAIN_COLORS } from "../../constants/domains";
import { getBaselineResults, getAssessmentQuestions, submitAnswer } from "../../api/baselineApi";
import QuestionRow from "../../features/baseline/components/QuestionRow";
import AssessmentNavigation from "../../features/baseline/components/AssessmentNavigation";
import { getDraftStatusConfig } from "../../features/baseline/utils/status";

type ApiResponse = {
  data: any[];
  page: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
  nextDisabled: boolean;
  previousDisabled: boolean;
  isSubmitted: boolean;
  // Note: progress and draftStatus are fetched via the state API now
};

export default function BaselineAssessment(){
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const basePath = "/baseline";
  const assessmentPath = `${basePath}/assessment`;

  const pageParam = params.get("page");
  const page = pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : 1;

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saveStatus, setSaveStatus] = useState<"" | "Saving" | "Saved">("");
  const storageKey = "baseline_start_time";

  const [startTime] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? Number(stored) : Date.now();
  });

  const [, setElapsedSeconds] = useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["assessment-questions", page],
    queryFn: () => getAssessmentQuestions(page, "baseline"),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: stateData } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: () => getBaselineResults(),
  });

  const apiState = stateData?.data || stateData;

  useEffect(() => {
    if (data?.isSubmitted === true || apiState?.isBaselineSubmitted) {
      navigate(`${basePath}/results`);
    }
  }, [data?.isSubmitted, apiState?.isBaselineSubmitted, basePath, navigate]);

  const questions = data?.data || [];
  const draftStatus = apiState?.draftStatus || "draft";
  const currentStatus = getDraftStatusConfig(draftStatus);

  useEffect(() => {
    if (!questions.length || isLoading) return;

    const prefilled = Object.fromEntries(
      questions
        .filter((q: any) => q.answer !== null)
        .map((q: any) => [q.id, Number(q.answer)]),
    );

    setAnswers((prev) => ({
      ...prefilled,
      ...prev,
    }));
  }, [questions, isLoading]);

  const saveAnswer = useMutation({
    mutationFn: (payload: any) => submitAnswer({ ...payload, type: "baseline" })
  });

  const handleAnswer = (id: string, value: number, domain: string) => {
    setSaveStatus("Saving");

    setAnswers((prev) => ({ ...prev, [id]: value }));

    saveAnswer.mutate(
      { questionId: id, answer: value, domain },
      {
        onSuccess: () => {
          setSaveStatus("Saved");

          queryClient.invalidateQueries({
            queryKey: ["assessment-questions"],
          });

          setTimeout(() => setSaveStatus(""), 800);
        },
      },
    );
  };

  const handleNext = () => {
    if (!data?.nextDisabled && data?.nextPage) {
      const container = document.getElementById("dashboard-scroll");
      container?.scrollTo({ top: 0 });

      navigate(`${assessmentPath}?page=${data.nextPage}`);
    } else {
      navigate(`${basePath}/review`);
    }
  };

  const handleBack = () => {
    if (!data?.previousDisabled && data?.previousPage) {
      const container = document.getElementById("dashboard-scroll");
      container?.scrollTo({ top: 0 });

      navigate(`${assessmentPath}?page=${data.previousPage}`);
    }
  };

  const handleSaveAndExit = () => navigate("/dashboard");
  const handleReview = () => navigate(`${basePath}/review`);
  
  const completed = apiState?.progress?.completed || 0;
  const total = apiState?.progress?.total || 200;
  const minRequired = 180;
  const canReview = completed >= minRequired;
  const QUESTIONS_PER_PAGE = questions.length || 10; // fallback

  // calculate page user should be on
  const resumePage = Math.floor(completed / QUESTIONS_PER_PAGE) + 1;

  const progress = Math.round((completed / total) * 100);
  const progressPercent = (completed / total) * 100;

  const isAlmostDone = progressPercent >= 85;

  useEffect(() => {
    if (!data || isLoading) return;

    const hasPageParam = params.get("page");

    if (!hasPageParam && completed > 0) {
      navigate(`${assessmentPath}?page=${resumePage}`, { replace: true });
    }
  }, [
    data,
    isLoading,
    completed,
    resumePage,
    navigate,
    assessmentPath,
    params,
  ]);

  const sectionDomains = Array.from(
    new Set(questions.map((q: any) => q.domain).filter(Boolean)),
  );

  useEffect(() => {
    if (apiState?.progress?.completed === 0) {
      setAnswers({});
    }
  }, [apiState?.progress?.completed]);

  const TIME_PER_QUESTION = 7;

  const spentSeconds = completed * TIME_PER_QUESTION;

  const spentMinutes = Math.floor(spentSeconds / 60);

  const spentDisplay =
    spentMinutes < 1
      ? `${spentSeconds}s`
      : `${spentMinutes}m ${spentSeconds % 60}s`;

  useEffect(() => {
    const remainingQuestions = total - completed;

    const remainingSeconds = remainingQuestions * TIME_PER_QUESTION;

    const minutes = Math.ceil(remainingSeconds / 60);

    setEstimatedMinutes(minutes);
  }, [completed, total]);

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex flex-col h-full mx-auto px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl text-white font-semibold">
          Baseline Diagnostic (DCP™)
        </h4>

        <div className="text-sm text-gray-400 flex gap-6">
          <span>
            Draft Status:{" "}
            <span className={currentStatus.color}>{currentStatus.label}</span>
          </span>

          {saveStatus && (
            <span>
              Auto-saving…{" "}
              <span
                className={
                  saveStatus === "Saving" ? "text-yellow-400" : "text-green-400"
                }
              >
                {saveStatus}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Section card */}
      <div className="bg-cardBg border border-borderColor rounded-sm p-6">
        <div className="flex justify-between text-sm">
          <h6>
            Section {data?.page} of {data?.totalPages}
          </h6>
          <span>Progress: {progress}% complete</span>
        </div>

        <div className="w-full h-2 bg-gray-700 rounded mt-3">
          <div
            className="h-2 bg-green-500 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between mt-4 text-sm text-gray-400">
          <div className="flex gap-2">
            <span>Domain:</span>
            {sectionDomains.map((d) => {
              const config = DOMAIN_COLORS[d];
              if (!config) return null;

              return (
                <span
                  key={d}
                  className="px-2 py-1 text-xs font-semibold rounded"
                  style={{
                    backgroundColor: `${config.color}22`,
                    color: config.color,
                    border: `1px solid ${config.color}`,
                  }}
                >
                  {config.label}
                </span>
              );
            })}
          </div>

          <div className="flex gap-6">
            <span>
              Time spent: <span className="text-white">{spentDisplay}</span>
            </span>

            <span>
              Remaining:{" "}
              <span className="text-white">~{estimatedMinutes} min</span>
            </span>
            {isAlmostDone && (
              <p className="text-xs text-green-400 mt-2">
                You’re almost done — just a few more questions.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="flex-1 mt-8 space-y-2 px-2 pb-8">
        {isLoading ? (
          <div className="text-center py-20 text-gray-400">
            Loading assessment questions...
          </div>
        ) : error ? (
          <div className="text-red-400 text-center py-10">
            Failed to load assessment questions.
          </div>
        ) : (
          questions.map((q: any) => (
            <QuestionRow
              key={q.id}
              question={{
                ...q,
                answer:
                  answers[q.id] !== undefined
                    ? answers[q.id]
                    : q.answer !== null
                      ? Number(q.answer)
                      : null,
              }}
              onAnswer={(id, value) => handleAnswer(id, value, q.domain)}
            />
          ))
        )}

        <div className="text-xs text-gray-500 text-center mt-4">
          Minimum {minRequired} responses required to submit baseline.
        </div>
      </div>

      <AssessmentNavigation
        onBack={handleBack}
        onNext={handleNext}
        onSave={handleSaveAndExit}
        isLast={data?.nextDisabled}
        isFirst={data?.previousDisabled}
        showReviewButton={canReview}
        onReview={handleReview}
      />
    </div>
  );
}
