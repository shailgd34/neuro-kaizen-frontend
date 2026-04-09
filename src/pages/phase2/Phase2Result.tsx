import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, CheckCircle, ArrowRight, BrainCircuit } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { getBaselineResults } from "../../api/baselineApi";

export default function Phase2Result() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: () => getBaselineResults(),
  });

  const apiData = data?.data || data;

  if (isLoading || !apiData) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-400">
        Loading Diagnostic Results...
      </div>
    );
  }

  // Find latest metric
  const weeklyMetrics = apiData.calibration?.weeklyMetrics || [];
  const latestMetric = [...weeklyMetrics].sort((a: any, b: any) => b.week - a.week)[0];

  const activePhase2 = latestMetric?.phase2;
  const targetDomain = activePhase2?.targetDomain || "Unknown";
  
  // Find the exact domain score from Phase 2
  const currentScore = activePhase2?.score || 0;

  // Let's determine if this specific test was a pass or fail
  const passed = currentScore >= 60;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-20 animate-in fade-in zoom-in-95 duration-700">
      <Card className="relative overflow-hidden text-center p-10 bg-[#0A0D11] border-white/5 shadow-2xl">
        {/* Dynamic Backgrounds based on Pass/Fail */}
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full mix-blend-screen opacity-30 ${passed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <div className={`absolute bottom-0 left-0 w-64 h-64 blur-[100px] rounded-full mix-blend-screen opacity-20 ${passed ? 'bg-secondary' : 'bg-red-500'}`} />

        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${passed ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
            {passed ? (
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            )}
          </div>

          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Diagnostic Complete
          </h2>
          <p className="text-gray-400 text-sm mb-10">
            We've analyzed your responses for the <span className="text-white font-medium capitalize">{targetDomain}</span> domain.
          </p>

          <div className="grid grid-cols-2 gap-4 w-full mb-10">
            <div className="bg-white/5 border border-white/5 rounded-xl p-6">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Evaluated Domain</p>
              <div className="flex items-center justify-center gap-2 text-white font-medium text-lg capitalize">
                <BrainCircuit className="w-5 h-5 text-secondary" />
                {targetDomain}
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/5 rounded-xl p-6">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Phase 2 Score</p>
              <div className={`text-4xl font-bold font-mono tracking-tighter ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentScore}
              </div>
            </div>
          </div>

          {passed ? (
            <div className="w-full">
              <p className="text-emerald-400 text-sm font-medium mb-6 bg-emerald-500/10 py-3 rounded-lg border border-emerald-500/20">
                You have successfully stabilized this domain above the 60 point threshold.
              </p>
              <Button 
                variant="goldDark" 
                className="w-full h-12 text-sm font-bold flex items-center justify-center gap-2"
                onClick={() => navigate("/weekly/result")}
              >
                Return to Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full">
              <p className="text-rose-400 text-sm font-medium mb-6 bg-rose-500/10 py-3 rounded-lg border border-rose-500/20">
                Your score remains below the functional threshold. Further diagnostic evaluation is required for the next subscale.
              </p>
              <Button 
                className="w-full h-12 text-sm font-bold bg-white text-black hover:bg-gray-200 flex items-center justify-center gap-2 group"
                onClick={() => navigate("/phase2")}
              >
                Continue Deep Diagnostic <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
}
