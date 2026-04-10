import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { ArrowLeft, Calendar, Info, TrendingUp, AlertTriangle } from "lucide-react";
import { type WeeklyMetricEntry } from "../../../api/clientApi";

interface WeeklyDetailViewProps {
  weekData: WeeklyMetricEntry;
  onBack: () => void;
}

export default function WeeklyDetailView({ weekData, onBack }: WeeklyDetailViewProps) {
  const summary = weekData.analysis.summary;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="outlineWhite" onClick={onBack} className="h-12 w-12 p-0 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-gray-300">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold text-white tracking-tight">Week {weekData.week} Analysis</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <Calendar className="w-4 h-4" />
              <span>Submitted on {new Date(weekData.submittedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>
          </div>
        </div>

        <div className={`px-6 py-2.5 rounded-2xl border font-black uppercase tracking-[0.2em] text-xs ${
          summary.overallStatus.toLowerCase() === 'stable' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
          summary.overallStatus.toLowerCase() === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
          'bg-amber-500/10 border-amber-500/20 text-amber-500'
        }`}>
          Status: {summary.overallStatus}
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="flex flex-col items-center py-10 shadow-xl">
           <span className="text-xs text-gray-400 uppercase font-black tracking-widest mb-3">Protocol NKPI Score</span>
           <span className="text-6xl font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{weekData.nkpi_score.toFixed(1)}</span>
           <div className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-400">
             <TrendingUp className="w-4 h-4" />
             <span className="uppercase tracking-widest">Real-time Snapshot</span>
           </div>
        </Card>

        <Card className="md:col-span-2 flex flex-col gap-6 p-8">
           <h4 className="text-xs uppercase font-black text-gray-500 tracking-[0.2em] mb-1">Performance Intelligence Summary</h4>
           <div className="flex items-start gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                 <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex flex-col gap-3">
                 <p className="text-lg font-bold text-gray-100 leading-tight">{summary.primaryIssueText}</p>
                 <p className="text-sm text-gray-500 italic leading-relaxed">"{summary.secondaryIssueText}"</p>
              </div>
           </div>
           <div className="mt-2 grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                 <span className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Primary Variance Factor</span>
                 <span className="text-sm font-black text-white capitalize flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {summary.primaryIssue.domain} ({summary.primaryIssue.status})
                 </span>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Secondary Influence</span>
                 <span className="text-sm font-bold text-gray-400 capitalize bg-white/5 px-3 py-1 rounded-lg self-start">
                    {summary.secondaryIssue?.domain || "N/A"}
                 </span>
              </div>
           </div>
        </Card>
      </div>

      {/* Domain Matrix for this week */}
      <Card title="Comparative Domain Matrix (Weekly Variance vs Baseline)">
         <div className="overflow-x-auto">
            <table className="w-full text-sm">
               <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-500 uppercase font-black text-left">
                     <th className="py-6 px-4">Biometric Domain</th>
                     <th className="py-6 text-center">Week Score</th>
                     <th className="py-6 text-center">Δ vs Baseline Anchor</th>
                     <th className="py-6 text-center">Drift State</th>
                     <th className="py-6 text-right px-4">Admin Intervention</th>
                  </tr>
               </thead>
               <tbody>
                  {weekData.domains.map((d, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                        <td className="py-5 px-4 font-bold text-gray-200 capitalize text-md">{d.domain}</td>
                        <td className="py-5 text-center font-mono text-white text-lg font-bold tabular-nums">{d.score}</td>
                        <td className={`py-5 text-center font-mono font-black text-lg tabular-nums ${d.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                           {d.delta > 0 ? '+' : ''}{d.delta.toFixed(1)}
                        </td>
                        <td className={`py-5 text-center font-black italic uppercase text-xs ${
                           d.drift.toLowerCase() === 'stable' ? 'text-emerald-500/80' : 'text-amber-500/80'
                        }`}>
                           {d.drift}
                        </td>
                        <td className="py-5 text-right px-4">
                           <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                             d.triggerPhase2 ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 'bg-white/5 text-gray-600'
                           }`}>
                             {d.triggerPhase2 ? 'MANDATORY ACTION' : 'STABLE'}
                           </span>
                        </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>

      {/* Contextual Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
         <Card title="Protocol Reflection & Diagnostics">
            <div className="p-6 bg-black/40 rounded-2xl border border-white/5 h-full min-h-[160px] flex flex-col gap-3">
               <h6 className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Coach Commentary</h6>
               <p className="text-md text-gray-400 italic leading-relaxed">
                 "{weekData.reflection || "No clinical reflection recorded for this protocol window. biometrics suggest stability."}"
               </p>
            </div>
         </Card>
         <Card title="System Intervention Status">
            <div className="flex flex-col gap-6">
               {weekData.phase2.triggered ? (
                 <div className="p-6 bg-rose-500/[0.03] border border-rose-500/20 rounded-3xl flex items-start gap-4 shadow-xl">
                    <Info className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-2">
                       <span className="text-sm font-black text-rose-400 uppercase tracking-widest">Phase 2 Triggered</span>
                       <p className="text-sm text-gray-400 leading-relaxed">System variance in **{weekData.phase2.targetDomain}** has exceeded the safe threshold. Administrative intervention is required.</p>
                       <div className="flex items-center gap-4 mt-3 pt-4 border-t border-rose-500/10">
                          <span className="text-[10px] text-rose-900 uppercase font-black bg-rose-500/10 px-3 py-1 rounded">Target: {weekData.phase2.targetDomain}</span>
                          <span className="text-[10px] text-rose-900 uppercase font-black bg-rose-500/10 px-3 py-1 rounded">Subscale: {weekData.phase2.subscale}</span>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="p-6 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-3xl flex items-start gap-4 shadow-xl">
                    <TrendingUp className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-2">
                       <span className="text-sm font-black text-emerald-400 uppercase tracking-widest">Stable Protocol Window</span>
                       <p className="text-sm text-gray-400 leading-relaxed">All domain components remain within baseline tolerance for this weekly window. No intervention required.</p>
                    </div>
                 </div>
               )}
            </div>
         </Card>
      </div>

    </div>
  );
}
