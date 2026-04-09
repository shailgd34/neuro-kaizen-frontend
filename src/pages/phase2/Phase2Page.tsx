import { useState, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity, ShieldAlert } from "lucide-react";

import {
  getBaselineResults,
  getAssessmentQuestions,
  submitAnswer,
  updateDomainScore
} from "../../api/baselineApi";
import QuestionRow from "../../features/baseline/components/QuestionRow";
import AssessmentNavigation from "../../features/baseline/components/AssessmentNavigation";
import { DOMAIN_COLORS } from "../../constants/domains";
import { toast } from "react-toastify";

export default function Phase2Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<"" | "Saving" | "Saved">("");

  // ─── 1. FETCH RESULTS STATE ───────────────────────────────────────────────
  const { data: resultsData, isLoading: isResultsLoading } = useQuery({
    queryKey: ["assessment-results"],
    queryFn: getBaselineResults,
  });

  const apiData = resultsData?.data;
  const [searchParams, setSearchParams] = useSearchParams();
  const phase2 = apiData?.phase2;
  const calibration = apiData?.calibration;
  const currWeek = calibration?.currentWeek || 1;

  // 1. Priority: URL param -> 2. Source of truth: apiData -> 3. Fallback: 1
  const currentPage: number = Number(searchParams.get("page")) || phase2?.currentPage || 1;

  // Domain can come from router state (instantly) or apiData (source of truth)
  const rawTargetDomain: string | null = (
    location.state?.domain ||
    phase2?.targetDomain ||
    apiData?.primaryIssue?.domain ||
    apiData?.weeklyStatus?.primaryIssue ||
    null
  );

  const finalDomain = useMemo(() => {
    if (!rawTargetDomain) return undefined;

    // 1. Match by key (case-insensitive)
    const domainKey = Object.keys(DOMAIN_COLORS).find(
      k => k.toLowerCase() === rawTargetDomain.toLowerCase()
    );
    if (domainKey) return domainKey;

    // 2. Match by label (case-insensitive)
    const entry = Object.entries(DOMAIN_COLORS).find(
      ([, cfg]) => cfg.label?.toLowerCase() === rawTargetDomain.toLowerCase()
    );
    return entry ? entry[0] : rawTargetDomain;
  }, [rawTargetDomain]);

  const isActuallyTriggered = !!phase2?.triggered || !!apiData?.weeklyStatus?.phase2Pending || !!location.state?.domain;

  // Fetch if we have a trigger. If domain comes from state, don't wait for results fetch!
  const shouldFetch = isActuallyTriggered && !!finalDomain && (!!location.state?.domain || !isResultsLoading);

  // ─── 2. FETCH QUESTIONS FOR TARGET DOMAIN ────────────────────────────────
  const {
    data: questionsData,
    isLoading: isQuestionsLoading,
  } = useQuery({
    queryKey: ["phase2-questions", finalDomain, currentPage, currWeek],
    enabled: shouldFetch,
    staleTime: 0,
    queryFn: () =>
      getAssessmentQuestions(1, "weekly", currWeek, finalDomain, 50),
  });

  const subscales = useMemo(() => {
    if (!questionsData) return [];

    // 1. Get all questions from the 50 fetched
    const allFetched = (questionsData as any).questions;
    if (!Array.isArray(allFetched)) return [];

    // 2. Strict Frontend Pagination (10 per page)
    const start = (currentPage - 1) * 10;
    const pageQuestions = allFetched.slice(start, start + 10);

    // 3. Group by subscale for display
    const groups: any[] = [];
    pageQuestions.forEach(q => {
      let group = groups.find(g => g.subscale === q.subscale);
      if (!group) {
        group = { subscale: q.subscale, questions: [] };
        groups.push(group);
      }
      group.questions.push(q);
    });

    return groups;
  }, [questionsData, currentPage]);

  // Total count of questions currently visible (should be <= 10)
  const questions = useMemo(() => {
    return subscales.flatMap((s: any) => s.questions || []);
  }, [subscales]);

  const totalCount = (questionsData as any)?.total || 0;
  const totalPages: number = (questionsData as any)?.totalPages || Math.ceil(totalCount / 10) || 1;
  const allQuestions = (questionsData as any)?.questions || [];

  // Robust local calculation for progress
  const completedCount = allQuestions.filter((q: any) => q.answer !== null && q.answer !== undefined && q.answer !== "").length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const MIN_REQUIRED = Math.ceil(totalCount * 0.9);
  const isEligible = completedCount >= MIN_REQUIRED;

  const isPhase2Pending = apiData?.weeklyStatus?.phase2Pending;
  const statusConfig = {
    label: isPhase2Pending ? "Active Diagnostic" : "Update Required",
    color: isPhase2Pending ? "text-secondary" : "text-rose-400"
  };

  // ─── 3. AUTO-SAVE ANSWER ────────────────────────────────────────────────
  const saveAnswerMutation = useMutation({
    mutationFn: (payload: {
      questionId: string;
      answer: number;
      domain: string;
      type: "weekly";
    }) => submitAnswer(payload),
    onSuccess: () => {
      setSaveStatus("Saved");
      queryClient.invalidateQueries({ queryKey: ["phase2-questions"] });
      setTimeout(() => setSaveStatus(""), 1500);
    },
  });

  const handleAnswer = (questionId: string, answer: number) => {
    setSaveStatus("Saving");
    saveAnswerMutation.mutate({
      questionId,
      answer,
      domain: finalDomain || "",
      type: "weekly",
    });
  };

  // ─── 4. PAGE NAVIGATION ────────────────────────────────────────────────
  const handleNext = () => {
    if (currentPage < totalPages) {
      setSearchParams({ page: (currentPage + 1).toString() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setSearchParams({ page: (currentPage - 1).toString() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ─── 5. FINALIZE PROTOCOL ──────────────────────────────────────────────
  const finalizeMutation = useMutation({
    mutationFn: async () => {
      const domain = finalDomain || "";
      const week = currWeek;

      if (!domain) {
        throw new Error("Target domain is missing. Cannot finalize diagnostic.");
      }

      console.log(`🚀 Finalizing Phase 2... Triggering Update for: ${domain}, Week: ${week}`);

      // ONLY call the domain update API as requested for Phase 2
      const result = await updateDomainScore({ week, domain });
      
      console.log("✅ Domain Update API Success!");
      return result;
    },
    onSuccess: () => {
      console.log("🎯 Phase 2 Finalized. Redirecting to results...");
      toast.success("Diagnostic Completed");
      queryClient.invalidateQueries({ queryKey: ["assessment-results"] });
      queryClient.invalidateQueries({ queryKey: ["client-scores"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      navigate("/phase2/result");
    },
    onError: (err: any) => {
      console.error("❌ Phase 2 Submission Error:", err);
      toast.error(err.message || "Failed to complete diagnostic.");
    }
  });

  if (isResultsLoading || isQuestionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <Activity className="w-10 h-10 text-secondary animate-pulse mb-4" />
        <p className="text-sm font-medium">Synchronizing telemetry...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/5 pt-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-sm bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h4 className="text-white font-bold leading-none">
              Deep Diagnostic Protocol
            </h4>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              Analyzing root causes: Section {currentPage} of {totalPages}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1 text-sm">
              <span className="text-gray-400">Status:</span>
              <span className={statusConfig.color}>{statusConfig.label}</span>
            </div>
            {saveStatus && (
              <span className={`text-[10px] font-bold uppercase tracking-wider ${saveStatus === "Saving" ? "text-yellow-400" : "text-green-400"}`}>
                {saveStatus === "Saving" ? "Saving..." : "Saved"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Protocol Metrics Card */}
      <div className="bg-cardBg border border-borderColor rounded-sm p-6 mb-8">
        <div className="flex justify-between text-sm">
          <h6 className="text-white">
            Current Section Progress
          </h6>
          <span className="text-gray-400 font-medium">{progressPercent}% complete</span>
        </div>

        <div className="w-full h-2 bg-gray-700/50 rounded mt-3 overflow-hidden">
          <div
            className="h-2 bg-green-500 rounded transition-all duration-700 shadow-[0_0_8px_rgba(34,197,94,0.3)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between mt-4 text-sm text-gray-400">
          <div className="flex gap-2">
            <span>Focused Domain:</span>
            {finalDomain && DOMAIN_COLORS[finalDomain] && (
              <span
                className="px-2 py-1 text-[10px] font-bold uppercase rounded border tracking-wider"
                style={{
                  backgroundColor: `${DOMAIN_COLORS[finalDomain].color}22`,
                  color: DOMAIN_COLORS[finalDomain].color,
                  borderColor: `${DOMAIN_COLORS[finalDomain].color}44`,
                }}
              >
                {DOMAIN_COLORS[finalDomain].label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Questions Stack */}
      <div className="flex-1 space-y-4 px-2 pb-8">
        {questions.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-sm">
            <p className="text-gray-500 text-sm">No diagnostic questions found for this domain.</p>
          </div>
        ) : (
          questions.map((q: any) => (
            <QuestionRow
              key={q.id}
              question={{
                ...q,
                answer: q.answer ? Number(q.answer) : null,
                question_no: ((questionsData as any).questions || []).indexOf(q) + 1,
              }}
              onAnswer={handleAnswer}
            />
          ))
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col gap-4 pt-8 border-t border-white/5">
        {currentPage === totalPages && !isEligible && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-xs text-red-400 flex items-center justify-center gap-2">
            <span>Minimum Requirement: {MIN_REQUIRED} answers ({90}% completion). Please answer {MIN_REQUIRED - completedCount} more questions to submit.</span>
          </div>
        )}
      </div>

      <AssessmentNavigation
        onBack={handleBack}
        onNext={handleNext}
        onReview={() => finalizeMutation.mutate()}
        onSave={() => navigate("/dashboard")}
        isLast={currentPage === totalPages}
        isFirst={currentPage === 1}
        disableSubmit={!isEligible}
        nextLabel={currentPage === totalPages ? "Complete Diagnostic" : "Next Section"}
      />
    </div>
  );
}
