import Card from "../../ui/Card";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Zap, Target } from "lucide-react";
import { DOMAIN_COLORS } from "../../../constants/domains";

type AnalysisDomain = {
  domain: string;
  baseline: number;
  current: number;
  delta: number;
  zScore: number;
  drift: string;
  status: string;
  phase2?: {
    eligible: boolean;
    selected: boolean;
  };
};

type Props = {
  analysisDomains?: AnalysisDomain[];
};

export default function FiveDomainRecord({
  analysisDomains = [],
}: Props) {
  const navigate = useNavigate();

  if (!analysisDomains.length) {
    return (
      <Card>
        <div className="text-gray-500 text-center py-20 italic text-sm">
          Data will appear after your first check-in.
        </div>
      </Card>
    );
  }

  // weakest domain
  const weakest = [...analysisDomains].sort((a, b) => a.zScore - b.zScore)[0];

  return (
    <Card title="Domain Performance" className="p-0 overflow-hidden relative group">
       <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] pointer-events-none" />

       <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex gap-4 md:gap-0 flex-col md:flex-row md:justify-between md:items-center">
         <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <Target size={14} className="text-secondary opacity-60" />
              <span className="text-xs text-secondary font-medium">Update feed</span>
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">System Online</span>
           </div>
         </div>
         <div className="flex items-center justify-between md:justify-end md:gap-8 text-[11px] font-medium text-gray-500 w-full md:w-auto">
            <span className="w-8 text-right hidden sm:inline">Baseline</span>
            <span className="w-8 text-right hidden sm:inline">Current</span>
            <span className="w-10 text-center">Delta</span>
            <span className="w-0 text-center hidden md:inline"></span>
         </div>
       </div>

       <div className="flex flex-col">
          {analysisDomains.map((d, index) => {
            const isWeakest = d.domain === weakest.domain;
            const delta = d.current - d.baseline;

            const deltaColor =
              delta > 0
                ? "text-emerald-400"
                : delta < 0
                ? "text-rose-400"
                : "text-gray-500";

            const statusColor =
              d.status.toLowerCase() === "critical"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : d.status.toLowerCase() === "peak" || d.status.toLowerCase() === "optimizing"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-white/5 text-gray-400 border-white/10";

            return (
              <div
                key={index}
                onClick={() => navigate(`/domain/${d.domain}`)}
                className={`
                  relative px-6 py-3 border-b border-white/5 cursor-pointer
                  hover:bg-white/[0.03] transition-all group/row
                  ${isWeakest ? "bg-rose-500/5" : ""}
                  last:border-0
                `}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-1 h-8 rounded-full transition-all duration-300 ${isWeakest ? "bg-rose-400" : "bg-secondary/20 group-hover/row:bg-secondary"}`} />
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2.5">
                        <span className="text-white font-semibold text-sm">
                          {DOMAIN_COLORS[d.domain]?.label || d.domain}
                        </span>
                        
                        <div className={`px-2 py-0.5 rounded-lg border text-[10px] font-medium ${statusColor}`}>
                          {d.status}
                        </div>

                        {d.phase2?.eligible && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium animate-pulse">
                            <Zap size={10} className="fill-current" />
                            Phase 2 Active
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5 opacity-80">
                        {d.drift} — {d.zScore.toFixed(2)} σ
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-10 text-sm text-gray-500 font-medium">
                        <span className="w-8 text-right opacity-40">{Math.round(d.baseline)}</span>
                        <span className="w-8 text-right text-white font-bold">{Math.round(d.current)}</span>
                        <div className={`w-10 text-center text-xs font-bold px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 ${deltaColor}`}>
                           {delta > 0 ? "+" : ""}{Math.round(delta)}
                        </div>
                     </div>
                     <ChevronRight size={16} className="text-gray-600 group-hover/row:text-white transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
       </div>
    </Card>
  );
}