import { useState, useEffect } from "react";
import { API } from "../../api";

import Card from "../../components/ui/Card";
import { Lock, Info, CheckCircle2, Save, Settings2 } from "lucide-react";
import { toast } from "react-toastify";


export default function ScoringConfiguration() {
   const [isLoading, setIsLoading] = useState(false);
   const [configVersion, setConfigVersion] = useState("v2.4.1");
   const [lastUpdated, setLastUpdated] = useState("2024-01-15 14:32 UTC");

   const [thresholds, setThresholds] = useState({
      stableMin: "0.00",
      stableMax: "0.15",
      strainMin: "0.15",
      strainMax: "0.35",
      driftMin: "0.35",
      driftMax: "0.60",
      stabilizeMin: "0.60"
   });

   const [calibration, setCalibration] = useState({
      requiredWeeks: "4",
      domainVariance: "0.05",
      nkpiVariance: "0.03"
   });

   useEffect(() => {
     const fetchConfig = async () => {
       try {
         setIsLoading(true);
         const config = await API.admin.getScoringConfig();
         if (config) {
           if (config.thresholds) setThresholds(config.thresholds);
           if (config.calibration) setCalibration(config.calibration);
           if (config.version) setConfigVersion(config.version);
           // If updatedAt exists in API, we can set it here
           // @ts-ignore
           if (config.updatedAt) setLastUpdated(config.updatedAt);
         }
       } catch (error) {
         console.error("Failed to fetch scoring config:", error);
         // toast.error("Failed to load scoring configuration");
       } finally {
         setIsLoading(false);
       }
     };
     fetchConfig();
   }, []);

   const domainWeights = [
      { name: "Cognitive Weight", value: "30", status: "Valid" },
      { name: "Recovery Weight", value: "30", status: "Valid" },
      { name: "Flow Weight", value: "15", status: "Valid" },
      { name: "Identity Weight", value: "15", status: "Valid" },
      { name: "Friction Weight", value: "-10", status: "Valid", subtractive: true },
   ];

   const handleSave = async () => {
      const configPayload = {
         version: configVersion,
         thresholds,
         calibration
      };

      try {
        setIsLoading(true);
        await API.admin.upsertScoringConfig(configPayload);
        toast.success("Configuration updated successfully");
        setLastUpdated(new Date().toISOString());
      } catch (error) {
        console.error("Failed to update scoring config:", error);
        toast.error("Failed to update scoring configuration");
      } finally {
        setIsLoading(false);
      }
   };



   return (
      <div className="text-gray-300 pb-20 animate-in fade-in duration-700">
         <main className="container mx-auto px-6 lg:px-12 py-10 max-w-7xl">

            {/* Header Section */}
            <div className="flex flex-col mb-10">
               <h1 className="text-4xl font-black text-white tracking-tight">Scoring Configuration</h1>
               <p className="text-sm text-gray-500 font-medium mt-1">Logic Version Management</p>
            </div>

            {/* Meta Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <Card className="p-6 bg-[#0B0F1A] border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Current Logic Version</span>
                  <span className="text-xl font-bold text-white">{configVersion}</span>
               </Card>
               <Card className="p-6 bg-[#0B0F1A] border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Last Updated</span>
                  <span className="text-xl font-bold text-white uppercase tabular-nums">{lastUpdated}</span>
               </Card>
               <Card className="p-6 bg-[#0B0F1A] border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Updated By</span>
                  <span className="text-xl font-bold text-white">M. Chen</span>
               </Card>
            </div>

            {/* Global Warning */}
            <div className="mb-10 flex items-start gap-4 p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
               <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
               <p className="text-sm text-blue-400/80 font-medium">
                  Changes apply prospectively only. Historical scores remain frozen to preserve biological baseline Integrity.
               </p>
            </div>

            {/* Domain Weights (LOCKED) */}
            <section className="mb-12">
               <Card className="p-0 overflow-hidden border-white/10 shadow-2xl">
                  <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                     <h2 className="text-xl font-black text-white tracking-tight">Domain Weight Configuration</h2>
                     <p className="text-sm text-gray-500 mt-1 uppercase tracking-tighter font-bold">Configuration locked during MVP calibration period.</p>
                  </div>

                  <div className="p-8">
                     <table className="w-full">
                        <thead>
                           <tr className="text-left text-[10px] text-gray-600 uppercase font-black tracking-widest border-b border-white/5">
                              <th className="pb-6 w-1/2">Domain</th>
                              <th className="pb-6 text-center">Weight (%)</th>
                              <th className="pb-6 text-right px-4">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                           {domainWeights.map((w, i) => (
                              <tr key={i} className="group">
                                 <td className="py-5 text-md font-bold text-gray-300 tracking-tight">{w.name} {w.subtractive && <span className="text-[10px] text-gray-600 ml-2">(Subtractive)</span>}</td>
                                 <td className="py-5">
                                    <div className="flex items-center justify-center gap-3">
                                       <div className="w-24 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-center text-gray-500 font-mono text-sm">
                                          {w.value}
                                       </div>
                                       <Lock className="w-3.5 h-3.5 text-gray-700" />
                                    </div>
                                 </td>
                                 <td className="py-5 text-right px-4">
                                    <div className="inline-flex items-center gap-2 text-emerald-500/80 font-black uppercase text-[10px] italic">
                                       <CheckCircle2 className="w-3 h-3" />
                                       <span>{w.status}</span>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                           <tr className="bg-white/[0.02]">
                              <td className="py-6 px-4 text-sm font-black text-white uppercase tracking-widest">Total Combined Weight</td>
                              <td className="py-6 text-center text-lg font-black text-white tabular-nums">100%</td>
                              <td className="py-6 text-right px-4">
                                 <div className="inline-flex items-center gap-2 text-emerald-400 font-black uppercase text-[10px] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span>Balanced</span>
                                 </div>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </Card>
            </section>

            {/* Lower Config Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

               {/* Drift Thresholds (EDITABLE) */}
               <div className="lg:col-span-7 flex flex-col gap-6">
                  <Card className="h-full border-white/10 shadow-xl">
                     <div className="p-6 border-b border-white/5">
                        <h3 className="text-lg font-black text-white tracking-tight">Drift Classification Thresholds</h3>
                        <p className="text-xs text-gray-500 mt-1">Define deviation boundaries for systemic state classification</p>
                     </div>

                     <div className="p-8 flex flex-col gap-8">
                        {[
                           { label: "Stable", key1: "stableMin", key2: "stableMax" },
                           { label: "Light Strain", key1: "strainMin", key2: "strainMax" },
                           { label: "Systemic Drift", key1: "driftMin", key2: "driftMax" }
                        ].map((row, idx) => (
                           <div key={idx} className="flex flex-col gap-3">
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{row.label}</span>
                              <div className="flex items-center gap-4">
                                 <input
                                    type="text"
                                    value={thresholds[row.key1 as keyof typeof thresholds]}
                                    onChange={(e) => setThresholds({ ...thresholds, [row.key1]: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                 />
                                 <div className="h-0.5 w-4 bg-white/10 shrink-0" />
                                 <input
                                    type="text"
                                    value={thresholds[row.key2 as keyof typeof thresholds]}
                                    onChange={(e) => setThresholds({ ...thresholds, [row.key2]: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                 />
                              </div>
                           </div>
                        ))}

                        <div className="flex flex-col gap-3">
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Stabilisation Required</span>
                           <div className="relative group">
                              <input
                                 type="text"
                                 value={thresholds.stabilizeMin}
                                 onChange={(e) => setThresholds({ ...thresholds, stabilizeMin: e.target.value })}
                                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500/50 pr-12 transition-colors"
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold text-lg">+</div>
                           </div>
                        </div>
                     </div>
                  </Card>
               </div>

               {/* Calibration & Variance (EDITABLE) */}
               <div className="lg:col-span-5 flex flex-col gap-8">
                  <Card className="border-white/10 shadow-xl">
                     <div className="p-6 border-b border-white/5">
                        <h3 className="text-lg font-black text-white tracking-tight">Calibration Window</h3>
                        <p className="text-xs text-gray-500 mt-1">Minimum valid weeks required for baseline calculation</p>
                     </div>
                     <div className="p-8 flex flex-col gap-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Required Valid Weeks</span>
                        <input
                           type="text"
                           value={calibration.requiredWeeks}
                           onChange={(e) => setCalibration({ ...calibration, requiredWeeks: e.target.value })}
                           className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                        <p className="text-[10px] text-gray-600 italic mt-1 font-medium">Weeks with ≥ 3 valid daily data points</p>
                     </div>
                  </Card>

                  <Card className="border-white/10 shadow-xl flex-1">
                     <div className="p-6 border-b border-white/5">
                        <h3 className="text-lg font-black text-white tracking-tight">Variance Floor (σ floor)</h3>
                        <p className="text-xs text-gray-500 mt-1">Minimum standard deviation for stability calculation</p>
                     </div>
                     <div className="p-8 flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Domain Default</span>
                           <input
                              type="text"
                              value={calibration.domainVariance}
                              onChange={(e) => setCalibration({ ...calibration, domainVariance: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50"
                           />
                        </div>
                        <div className="flex flex-col gap-3">
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">NKPI Default</span>
                           <input
                              type="text"
                              value={calibration.nkpiVariance}
                              onChange={(e) => setCalibration({ ...calibration, nkpiVariance: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50"
                           />
                        </div>
                     </div>
                  </Card>
               </div>
            </div>

            {/* Global Action Footer */}
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-[#0B0F1A] border border-white/10 rounded-3xl shadow-3xl">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                     <Settings2 className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium">All changes require administrative approval and audit logging</p>
               </div>

               <div className="flex items-center gap-4 shrink-0">
                  <button className="px-8 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-400 border border-white/5 transition-all">
                     Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                     className={`px-8 py-3.5 gold-gradient text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                     disabled={isLoading}
                  >
                     <Save className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                     {isLoading ? 'Saving...' : 'Save Configuration'}
                  </button>
               </div>
            </div>

         </main>
      </div>
   );
}
