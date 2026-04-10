import Card from "../../ui/Card";
import { type ClientFullDetails } from "../../../api/clientApi";

interface DriftTabProps {
  data: ClientFullDetails;
}

export default function DriftTab({ data }: DriftTabProps) {
  // Get latest biometric entry
  const latestMetric = data.calibration?.weeklyMetrics?.[data.calibration.weeklyMetrics.length - 1];
  
  // 1. Metadata Header Content
  const metadata = [
    { label: "Client Name", value: data.client?.name || "Anonymous Alpha" },
    { label: "Current NKPI", value: data.nkpi.toFixed(2) },
    { label: "Drift Classification", value: data.primaryIssue?.drift || "Adaptive Strain", color: "text-amber-500" },
    { label: "Calibration Status", value: data.calibration?.status === 'active' ? 'ACTIVE' : 'LOCKED', color: "text-emerald-400" },
    { label: "Scoring Version", value: "v2.4.1" },
  ];

  // 2. Metrics & Parameters
  const coreMetrics = [
    { metric: "Z_base", value: 2.14, threshold: 2.50, status: "NORMAL" },
    { metric: "Z_roll", value: 2.67, threshold: 2.50, status: "AMBER" },
    { metric: "Z_combo", value: 2.58, threshold: 2.50, status: "AMBER" }
  ];

  const varianceParams = [
    { parameter: "μ_base", value: data.baseline?.score || 76.82, unit: "pts" },
    { parameter: "σ_base", value: 0.82, unit: "pts" },
    { parameter: "σ_eff", value: 0.58, unit: "pts" },
    { parameter: "α_floor", value: 0.25, unit: "pts" }
  ];

  const domainAnalysis = latestMetric?.domains?.map(d => ({
    domain: d.domain,
    zBase: (d.baseline / 25).toFixed(2),
    zRoll: (d.score / 25).toFixed(2),
    zCombo: d.zScore.toFixed(2),
    volatility: (Math.abs(d.delta) / 10).toFixed(2),
    classification: d.drift.toUpperCase()
  })) || [];


  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* HUD Metadata Row */}
      <Card className="py-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-white/10">
           {metadata.map((item, i) => (
             <div key={i} className="flex flex-col px-6 py-4 md:py-0 text-center md:text-left">
                <span className="text-xs text-gray-400 uppercase font-black tracking-widest mb-1.5">{item.label}</span>
                <span className={`text-lg font-bold uppercase tabular-nums ${item.color || 'text-white'}`}>{item.value}</span>
             </div>
           ))}
        </div>
      </Card>

      {/* Side-by-Side Detail Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card title="Core Drift Metrics">
            <div className="flex flex-col gap-8">
               <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-gray-500 uppercase font-black text-left">
                       <th className="py-4 px-2">Metric</th>
                       <th className="py-4 text-center">Value</th>
                       <th className="py-4 text-center">Threshold</th>
                       <th className="py-4 text-right px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coreMetrics.map((m, idx) => (
                      <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01]">
                        <td className="py-4 px-2 font-mono text-gray-300">{m.metric}</td>
                        <td className="py-4 text-center font-bold text-white tabular-nums">{m.value.toFixed(2)}</td>
                        <td className="py-4 text-center text-gray-500 font-mono italic tabular-nums">{m.threshold.toFixed(2)}</td>
                        <td className={`py-4 text-right px-2 font-black italic ${
                          m.status === 'NORMAL' ? 'text-emerald-400' : 'text-amber-500'
                        }`}>
                          {m.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
               <div className="flex flex-col gap-2.5 pt-6 border-t border-white/10">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Threshold Ranges</span>
                  <div className="flex flex-col gap-2 text-xs text-gray-500 font-mono bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center"><span className="font-bold">Normal Range:</span> <span className="text-emerald-500/80">Z &lt; 2.50</span></div>
                    <div className="flex justify-between items-center"><span className="font-bold">Amber Range:</span> <span className="text-amber-500/80">2.50 ≤ Z &lt; 3.00</span></div>
                    <div className="flex justify-between items-center"><span className="font-bold text-rose-800">Red Range:</span> <span className="text-rose-700/80 font-bold">Z ≥ 3.00</span></div>
                  </div>
               </div>
            </div>
         </Card>

         <Card title="Variance Parameters">
            <div className="flex flex-col gap-8">
               <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-gray-500 uppercase font-black text-left">
                       <th className="py-4 px-2">Parameter</th>
                       <th className="py-4 text-center">Value</th>
                       <th className="py-4 text-right px-2">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {varianceParams.map((p, idx) => (
                      <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01]">
                        <td className="py-4 px-2 font-mono text-gray-300">{p.parameter}</td>
                        <td className="py-4 text-center font-bold text-white tabular-nums">{p.value.toFixed(2)}</td>
                        <td className="py-4 text-right px-2 text-gray-500 italic font-mono">{p.unit}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
               <div className="p-6 bg-blue-500/[0.03] rounded-2xl border border-blue-500/10">
                  <span className="text-[10px] text-blue-400/80 font-black uppercase tracking-[0.2em] mb-2 block">Calculation Engine Notes</span>
                  <p className="text-xs text-gray-500 leading-relaxed font-mono italic">
                    σ_eff = max(σ_base, α_floor) <br/>
                    Z_combo = weighted composite of Z_base and Z_roll <br/>
                    Analysis window: 4-week rolling interval
                  </p>
               </div>
            </div>
         </Card>
      </div>

      {/* Domain-Level Analysis */}
      <Card title="Domain-Level Z-Score Analysis">
         <div className="overflow-x-auto">
            <table className="w-full text-sm">
               <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-500 uppercase font-black text-left">
                     <th className="py-6 px-4">Biometric Domain</th>
                     <th className="py-6 text-center">Z_base</th>
                     <th className="py-6 text-center">Z_roll</th>
                     <th className="py-6 text-center font-bold text-gray-400">Z_combo</th>
                     <th className="py-6 text-center">Volatility Index</th>
                     <th className="py-6 text-right px-4">Classification</th>
                  </tr>
               </thead>
               <tbody>
                  {domainAnalysis.map((row, idx) => (
                     <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                        <td className="py-5 px-4 text-gray-300 font-bold capitalize text-md">{row.domain}</td>
                        <td className="py-5 text-center font-mono text-gray-500 tabular-nums">{row.zBase}</td>
                        <td className="py-5 text-center font-mono text-gray-500 tabular-nums">{row.zRoll}</td>
                        <td className="py-5 text-center font-mono font-black text-white text-md tabular-nums bg-white/[0.01]">{row.zCombo}</td>
                        <td className="py-5 text-center font-mono text-gray-500 italic tabular-nums">{row.volatility}</td>
                        <td className={`py-5 text-right px-4 font-black italic text-xs ${
                           row.classification === 'STABLE' || row.classification === 'NORMAL' ? 'text-emerald-400/80' : 
                           row.classification === 'SYSTEMIC DRIFT' ? 'text-rose-500/80' : 
                           'text-amber-500/80'
                        }`}>
                           {row.classification}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>

      {/* Escalation Logic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
         <div className="flex flex-col gap-6">
            <h6 className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mb-1">Escalation Logic Protocols</h6>
            <div className="flex flex-col gap-4">
               {[
                 { color: 'bg-amber-500', text: "Amber classification requires 2 consecutive weeks above threshold." },
                 { color: 'bg-rose-500', text: "Red classification triggers immediate escalation at severe threshold (Z ≥ 3.00)." },
                 { color: 'bg-emerald-500', text: "Normal status requires Z_combo below 2.50 for 1 full week to clear." }
               ].map((rule, idx) => (
                 <div key={idx} className="flex gap-5 items-center p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors">
                    <div className={`w-2 h-2 shrink-0 rounded-full shadow-[0_0_8px] ${
                      rule.color === 'bg-amber-500' ? 'shadow-amber-500' : 
                      rule.color === 'bg-rose-500' ? 'shadow-rose-500' : 'shadow-emerald-500'
                    } ${rule.color}`} />
                    <p className="text-sm text-gray-400 font-medium leading-tight">{rule.text}</p>
                 </div>
               ))}
            </div>
         </div>
         <div className="flex flex-col gap-6">
            <h6 className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mb-1">Current Escalation State Summary</h6>
            <div className="p-8 bg-amber-500/[0.03] border border-amber-500/10 rounded-3xl flex flex-col gap-6 shadow-2xl">
               <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-xs text-gray-500 uppercase font-black">Escalation Status</span>
                  <span className="text-sm font-black text-amber-500 italic uppercase bg-amber-500/10 px-3 py-1 rounded-lg">AMBER - Week 1</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase">Interval Persistence</span>
                  <span className="text-sm font-black text-white tabular-nums">1 / 2 weeks</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase">Next Review Date</span>
                  <span className="text-sm font-bold text-gray-300 font-mono">2026-04-17</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase">Admin Protocol</span>
                  <span className="text-sm font-black text-amber-500 uppercase tracking-widest">Active Monitoring</span>
               </div>
               <p className="mt-4 text-xs text-gray-500 italic leading-relaxed pt-5 border-t border-white/5">
                 <span className="text-amber-500 mr-2 font-black">!</span> 
                 Note: If variance persists above threshold for another protocol window, intervention will be automatically escalated to the governance tier.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
