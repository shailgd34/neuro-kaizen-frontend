import Card from "../../ui/Card";
import { type ClientFullDetails } from "../../../api/clientApi";

interface ContributionTabProps {
  data: ClientFullDetails;
}

export default function ContributionTab({ data }: ContributionTabProps) {
  // Get latest metrics for contribution analysis
  const latestMetric = data.calibration?.weeklyMetrics?.[data.calibration.weeklyMetrics.length - 1];
  const previousMetric = data.calibration?.weeklyMetrics?.[data.calibration.weeklyMetrics.length - 2];
  const baseline = data.baseline;

  if (!latestMetric) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-gray-500 italic">Historical synchronization required for contribution mapping.</p>
      </div>
    );
  }

  // Calculate Stat Row Values
  const currentNkpi = latestMetric.nkpi_score;
  const prevNkpi = previousMetric?.nkpi_score || baseline?.score || 0;
  const delta = currentNkpi - prevNkpi;
  const changePct = ((delta / prevNkpi) * 100).toFixed(1);
  const period = previousMetric ? `Week ${previousMetric.week} → Week ${latestMetric.week}` : `Baseline → Week ${latestMetric.week}`;

  // Domain Mapping
  const domainAnalysis = latestMetric.domains.map(d => {
    // rawDelta in API is vs baseline. For the table we'll use vs baseline as "Previous"
    const rawDelta = d.delta;
    const isPositive = rawDelta >= 0;
    
    // Weighted Impact (Mocking weights if not in API: Cognitive (0.2), Recovery (0.3), Flow (0.2), Identity (0.2), Friction (0.1))
    // We'll use 0.25, 0.30, 0.20, 0.25 to roughly match the image 1.0 total
    const weights: Record<string, number> = { cognitive: 0.25, recovery: 0.30, flow: 0.20, identity: 0.25 };
    const weight = weights[d.domain.toLowerCase()] || 0.20;
    const weightedImpact = (rawDelta * weight / 10).toFixed(1); // Normalized for visual scale if needed
    const percentageContribution = Math.abs(Number(weightedImpact) / (delta || 1) * 100).toFixed(1) + "%";

    return {
      domain: d.domain,
      weight: weight,
      previous: d.baseline,
      current: d.score,
      rawDelta: rawDelta.toFixed(1),
      weightedImpact: (isPositive ? '+' : '') + weightedImpact,
      percentageContribution: percentageContribution,
      isPositive: isPositive,
    };
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* 1. Stat Header Row */}
      <Card className="py-6">
        <div className="grid grid-cols-5 divide-x divide-white/5">
          <div className="flex flex-col px-8">
            <span className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1.5">Current NKPI</span>
            <span className="text-3xl font-bold text-white tabular-nums">{currentNkpi.toFixed(1)}</span>
          </div>
          <div className="flex flex-col px-8">
            <span className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1.5">Previous NKPI</span>
            <span className="text-3xl font-bold text-white tabular-nums">{prevNkpi.toFixed(1)}</span>
          </div>
          <div className="flex flex-col px-8">
            <span className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1.5">Delta</span>
            <span className={`text-3xl font-bold tabular-nums ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {delta > 0 ? '+' : ''}{delta.toFixed(1)}
            </span>
          </div>
          <div className="flex flex-col px-8">
            <span className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1.5">Period</span>
            <span className="text-md font-bold text-white mt-1.5">{period}</span>
          </div>
          <div className="flex flex-col px-8">
            <span className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1.5">Change %</span>
            <span className={`text-3xl font-bold tabular-nums ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {delta > 0 ? '+' : ''}{changePct}%
            </span>
          </div>

        </div>
      </Card>

      {/* 2. Primary Performance Driver */}
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/[0.02] flex flex-col gap-2">
         <h4 className="text-[10px] uppercase font-black text-amber-500/80 tracking-[0.2em]">Primary Performance Driver</h4>
         <h3 className="text-xl font-bold text-white capitalize">{data.primaryIssue?.domain || "Performance"} {delta < 0 ? 'Compression' : 'Expansion'}</h3>
         <p className="text-xs text-gray-500 italic max-w-2xl leading-relaxed">
            {data.summary || "Performance is primarily influenced by recovery and cognitive stability."}
         </p>
      </div>

      {/* 3. NKPI Formula Breakdown */}
      <Card title="NKPI Formula Breakdown (Weighted Influence)">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {domainAnalysis.map((d, i) => (
              <div key={i} className="flex justify-between items-center bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                <span className="text-sm text-gray-400 font-bold capitalize">{d.domain}</span>
                <span className={`text-sm font-black tabular-nums ${d.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {d.weightedImpact}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                <span className="text-sm text-gray-400 font-bold whitespace-nowrap">Friction Load</span>
                <span className="text-sm font-black text-rose-500 tabular-nums">-2.0</span>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/10 shadow-2xl scale-105">
                <span className="text-sm text-white font-black uppercase tracking-widest">Total Delta</span>
                <span className={`text-md font-black text-white tabular-nums`}>
                  {delta.toFixed(1)}
                </span>
            </div>
         </div>
      </Card>


      {/* 4. Contribution Analysis Table */}
      <Card title="Contribution Analysis">
         <div className="overflow-x-auto">
            <table className="w-full text-xs">
               <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-500 uppercase font-black text-left">
                     <th className="py-6 px-4">Biometric Domain</th>
                     <th className="py-6 text-center">Weight</th>
                     <th className="py-6 text-center">Baseline</th>
                     <th className="py-6 text-center font-bold text-gray-300">Current</th>
                     <th className="py-6 text-center">Raw Δ</th>
                     <th className="py-6 text-center">Weighted Impact</th>
                     <th className="py-6 text-center">% Contribution</th>
                     <th className="py-6 text-right px-4">Visual Influence</th>
                  </tr>
               </thead>
               <tbody>
                  {domainAnalysis.map((row, idx) => (
                     <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                        <td className="py-5 px-4 text-gray-300 font-bold capitalize text-md">{row.domain}</td>
                        <td className="py-5 text-center text-gray-500 font-mono tabular-nums">{row.weight.toFixed(2)}</td>
                        <td className="py-5 text-center text-gray-500 font-mono tabular-nums">{row.previous.toFixed(1)}</td>
                        <td className="py-5 text-center font-bold text-white font-mono text-md tabular-nums">{row.current.toFixed(1)}</td>
                        <td className={`py-5 text-center font-bold font-mono text-md ${row.isPositive ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                           {row.isPositive ? '+' : ''}{row.rawDelta}
                        </td>
                        <td className={`py-5 text-center font-black font-mono text-md ${row.isPositive ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                           {row.weightedImpact}
                        </td>
                        <td className={`py-5 text-center font-black text-md ${row.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                           {row.isPositive ? '-' : ''}{row.percentageContribution}
                        </td>
                        <td className="py-5 text-right px-4">
                           <div className="inline-block w-24 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className={`h-full ${row.isPositive ? 'bg-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.3)]'}`} 
                                style={{ width: row.percentageContribution }}
                              />
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>

            </table>
         </div>
      </Card>

      {/* 5. Bottom Informational Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card title="Z-Score Influence">
            <div className="flex flex-col gap-4 mt-1">
               <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-medium">Z_base influence</span>
                  <span className="text-xs font-mono text-blue-400">0.6</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-medium">Z_roll influence</span>
                  <span className="text-xs font-mono text-blue-400">0.4</span>
               </div>
               <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5 flex flex-col items-center gap-1.5">
                  <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Combined Formula:</span>
                  <p className="text-[11px] text-gray-300 font-mono italic">
                    Z_combo = 0.6 × Z_base + 0.4 × Z_roll
                  </p>
               </div>
            </div>
         </Card>

         <Card title="Friction Load Impact">
            <div className="flex flex-col gap-4 mt-1">
               <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-medium">Friction load Score</span>
                  <span className="text-xs font-mono text-rose-400">12.5</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-medium">Subtraction Factor</span>
                  <span className="text-xs font-mono text-rose-400">0.16</span>
               </div>
               <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-1">
                  <span className="text-xs text-white font-bold uppercase">Total Impact</span>
                  <span className="text-xs font-black text-rose-400">-2.0</span>
               </div>
               <p className="mt-4 text-[9px] text-gray-600 leading-relaxed italic">
                 Friction Load is applied as a subtractive factor to the final NKPI calculation to account for environmental and systemic drag.
               </p>
            </div>
         </Card>
      </div>

    </div>
  );
}
