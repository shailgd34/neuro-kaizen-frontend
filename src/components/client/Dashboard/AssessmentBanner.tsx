import { useNavigate } from "react-router-dom";
import { ChevronRight, Target, Activity } from "lucide-react";
import Button from "../../ui/Button";

type Assessment = {
  type: "baseline" | "weekly";
  week: number;
  answered: number;
  total: number;
  status: "draft" | "pending";
};

type Props = {
  runningAssessment?: Assessment;
};

export default function AssessmentBanner({ runningAssessment }: Props) {
  const navigate = useNavigate();

  if (!runningAssessment) return null;

  const progress = Math.round((runningAssessment.answered / runningAssessment.total) * 100);
  const isBaseline = runningAssessment.type === "baseline";

  return (
    <div className="relative group overflow-hidden bg-cardBg border border-white/5 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:border-secondary/20">
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6 flex-1 w-full lg:w-auto">
          <div className="relative shrink-0">
             <div className="relative w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shadow-lg">
                {isBaseline ? <Target size={24} className="text-secondary" /> : <Activity size={24} className="text-emerald-500" />}
             </div>
          </div>

          <div className="flex-1">
             <div className="flex items-center gap-3 mb-1">
                <span className="text-secondary text-xs font-medium">
                   Assessment in progress
                </span>
                <span className="text-gray-600 text-xs">•</span>
                <span className="text-gray-500 text-xs font-medium">
                   {isBaseline ? "Foundation assessment" : `Week ${runningAssessment.week} check-in`}
                </span>
             </div>
             
             <h5 className="text-white font-bold mb-4">
                {isBaseline ? "Continue your baseline assessment" : "Resume your weekly check-in"}
             </h5>

             <div className="flex flex-col gap-2 max-w-xl">
                <div className="flex justify-between items-end mb-1">
                   <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-bold">{progress}% Complete</span>
                      <span className="text-gray-500 text-[11px] font-medium">
                         {runningAssessment.answered} / {runningAssessment.total} questions
                      </span>
                   </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                   <div 
                      className="h-full bg-secondary rounded-full transition-all duration-1000 relative"
                      style={{ width: `${progress}%` }}
                   />
                </div>
             </div>
          </div>
        </div>

        <Button
          variant="goldDark"
          onClick={() => navigate(isBaseline ? "/baseline" : "/weekly")}
          className="flex-1 lg:flex-none h-11 px-8 text-xs font-medium flex items-center justify-center gap-2"
        >
          Resume <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}