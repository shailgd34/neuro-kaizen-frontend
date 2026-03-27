import { X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getDraftStatusConfig } from "../../../features/baseline/utils/status";
import Card from "../../ui/Card";

export type RunningAssessment = {
  type?: "baseline" | "weekly"; // made optional (important fix)
  week?: number;
  answered?: number;
  total?: number;
  status: "pending" | "draft" | "completed";
};

type Props = {
  runningAssessment?: RunningAssessment;
};

export default function AssessmentBanner({ runningAssessment }: Props) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  if (!runningAssessment || !visible) return null;
  if (runningAssessment.status === "completed") return null;

  // ✅ SAFE DEFAULTS (important fix)
  const type = runningAssessment.type || "baseline";
  const week = runningAssessment.week;
  const answered = runningAssessment.answered ?? 0;
  const total =
    runningAssessment.total ??
    (type === "baseline" ? 200 : 30); // fallback

  const status = runningAssessment.status;

  const percent = total ? Math.round((answered / total) * 100) : 0;
  const statusConfig = getDraftStatusConfig(status);

  const isDraft = status === "draft";

  const QUESTIONS_PER_PAGE = 8;
  const currentPage = Math.floor(answered / QUESTIONS_PER_PAGE) + 1;

  // -------------------------------
  // 🔹 TITLE
  // -------------------------------
  const title =
    type === "baseline"
      ? "Baseline Assessment"
      : `Weekly Check-in • Week ${week || "-"}`;

  // -------------------------------
  // 🔹 DESCRIPTION + CTA
  // -------------------------------
  let description = "";
  let buttonText = "";
  let route = "";

  if (type === "baseline") {
    description = isDraft
      ? "Continue your baseline assessment to unlock your dashboard."
      : "Start your baseline assessment to unlock your dashboard.";

    buttonText = isDraft ? "Continue Assessment" : "Start Assessment";
    route = "/baseline/assessment";
  }

  if (type === "weekly") {
    description = isDraft
      ? "Continue your weekly check-in."
      : "Start your weekly check-in to track your progress.";

    buttonText = isDraft ? "Continue Check-in" : "Start Check-in";
    route = "/weekly-tracking/checkin";
  }

  // -------------------------------
  // 🔹 UI
  // -------------------------------
  return (
    <Card className="p-6 mb-8 flex justify-between items-start transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]">
      <div className="flex gap-4 w-full">
        {/* ICON */}
        <div className="mt-1">
          <AlertCircle className="text-yellow-400" size={20} />
        </div>

        <div className="w-full">
          {/* TITLE + STATUS */}
          <div className="flex items-center gap-3 mb-2">
            <p className="font-semibold text-white tracking-tight">
              {title}
            </p>

            <span
              className={`
                text-xs px-2 py-1 rounded-full
                bg-white/5 border border-white/10
                ${statusConfig.color}
              `}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* DESCRIPTION */}
          <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            {description}
          </p>

          {/* PROGRESS TEXT */}
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>
              {type === "baseline"
                ? `${answered} / ${total} questions completed`
                : `${answered} / ${total} responses completed`}
            </span>

            <span className="text-gray-400 font-medium">
              {percent}%
            </span>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full bg-white/6 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-500 bg-linear-to-r from-yellow-400 to-yellow-300"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* CTA */}
          <button
            onClick={() =>
              navigate(route, {
                state: { page: currentPage },
              })
            }
            className="text-sm font-medium text-yellow-400 hover:text-white transition-colors"
          >
            {buttonText} →
          </button>
        </div>
      </div>

      {/* CLOSE */}
      <button
        onClick={() => setVisible(false)}
        className="text-gray-500 hover:text-gray-300 ml-4 transition-colors"
      >
        <X size={18} />
      </button>
    </Card>
  );
}