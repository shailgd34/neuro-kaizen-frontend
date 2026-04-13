import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getClientFullReport } from "../../api/adminApi";
import Card from "../../components/ui/Card";
import { 
  ChevronLeft, 
  Download, 
  Search, 
  Filter, 
  AlertCircle, 
  History, 
  ArrowLeft,
  Info,
  Calendar,
  Layers,
  Activity,
  Zap,
  Target
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

type ReportView = 'baseline' | number; // baseline or week number

export default function ResponseExplorer() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [reportView, setReportView] = useState<ReportView>('baseline');
  
  // Local pagination for responses table
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ["client-full-report", clientId],
    queryFn: () => getClientFullReport(clientId!),
    enabled: !!clientId,
  });

  const activeData = useMemo(() => {
    if (!data) return null;
    if (reportView === 'baseline') {
      return {
        responses: data.baseline.responses,
        nkpi: data.baseline.score.nkpi_score,
        date: data.baseline.score.submitted_at,
        isBaseline: true
      };
    } else {
      const weekData = data.weekly.find(w => w.week === reportView);
      return weekData ? {
        responses: weekData.responses,
        nkpi: weekData.nkpi.toString(),
        date: "Weekly Assessment",
        isBaseline: false
      } : null;
    }
  }, [data, reportView]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white font-black uppercase tracking-[0.2em] text-xs">Synchronizing Biometrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Signal Loss Detected</h2>
        <button onClick={() => navigate(-1)} className="mt-6 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-all">
          Return to Registry
        </button>
      </div>
    );
  }

  const domains = Array.from(new Set(activeData?.responses.map(r => r.domain) || []));

  const filteredResponses = (activeData?.responses || []).filter(r => {
    const matchesSearch = r.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = selectedDomain === "all" || r.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const paginatedResponses = filteredResponses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const StatBox = ({ label, value, subLabel, icon: Icon, colorClass = "text-secondary" }: { label: string, value: string | number, subLabel?: string, icon?: any, colorClass?: string }) => (
    <Card className="flex-1 bg-[#0B0F1A]/50 border-white/5 backdrop-blur-xl relative overflow-hidden group">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
           {Icon && <Icon className={`w-3 h-3 ${colorClass}`} />}
           <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
        </div>
        <div className="flex items-baseline gap-2">
           <span className="text-3xl font-black text-white tracking-tight">{value}</span>
           {subLabel && <span className="text-[10px] font-bold text-gray-600 uppercase italic">{subLabel}</span>}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full min-h-screen bg-[#050608]">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
             <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest group">
               <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
               Client Registry
             </button>
             <div>
               <div className="flex items-center gap-4">
                 <h1 className="text-4xl font-black text-white tracking-tight">Response Explorer</h1>
                 <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest italic leading-none">Intelligence Hub</span>
                 </div>
               </div>
               <div className="flex items-center gap-4 mt-2">
                 <span className="text-sm font-bold text-gray-400">Client: <span className="text-white">{data.client?.name || "Biometric Entity"}</span></span>
                 <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                 <span className="text-xs font-mono text-gray-500">ID: {clientId?.split('-')[0]}...</span>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex bg-[#0B0F1A] border border-white/5 p-1 rounded-2xl shadow-2xl">
                <button 
                  onClick={() => { setReportView('baseline'); setCurrentPage(1); }}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportView === 'baseline' ? 'bg-secondary text-black shadow-[0_0_20px_rgba(var(--secondary-rgb),0.2)]' : 'text-gray-500 hover:text-white'}`}
                >
                   Baseline
                </button>
                {data.weekly.map(w => (
                  <button 
                    key={w.week}
                    onClick={() => { setReportView(w.week); setCurrentPage(1); }}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportView === w.week ? 'bg-secondary text-black shadow-[0_0_20px_rgba(var(--secondary-rgb),0.2)]' : 'text-gray-500 hover:text-white'}`}
                  >
                     W{w.week}
                  </button>
                ))}
             </div>
             <button className="flex items-center gap-2.5 px-6 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/90 transition-all shadow-xl">
                <Download className="w-4 h-4" />
                Export
             </button>
          </div>
        </div>

        {/* Global Summary Alert */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           <Card className="lg:col-span-8 bg-secondary/5 border-secondary/20 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-secondary/10 rounded-2xl border border-secondary/20 text-secondary">
                    <AlertCircle className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Diagnostic Summary</h4>
                    <p className="text-lg font-bold text-white mt-1 leading-relaxed">{data.summary}</p>
                 </div>
              </div>
           </Card>
           <Card className="lg:col-span-4 bg-[#141517] border-white/5 p-6 space-y-3">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                 <Zap className="w-3 h-3 text-secondary" />
                 Key Recommendation
              </h4>
              <p className="text-sm font-bold text-gray-300 italic">"{data.recommendations[0]}"</p>
           </Card>
        </div>

        {/* Dynamic Multi-Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatBox 
             label="NKPI Performance" 
             value={parseFloat(activeData?.nkpi || "0").toFixed(1)} 
             subLabel="Current Score" 
             icon={Activity} 
           />
           <StatBox 
             label="Primary Health" 
             value={data.primaryIssue?.score.toFixed(1) || "N/A"} 
             subLabel={data.primaryIssue?.domain || "Stable"} 
             icon={Target} 
             colorClass={data.primaryIssue?.status === 'Critical' ? 'text-rose-500' : 'text-emerald-500'}
           />
           <StatBox 
             label="Assessment State" 
             value={reportView === 'baseline' ? 'BASELINE' : `WEEK ${reportView}`} 
             subLabel="Protocol Mode" 
             icon={Layers} 
             colorClass="text-secondary"
           />
           <StatBox 
             label="Signal Date" 
             value={activeData?.date ? new Date(activeData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "System"} 
             subLabel="Biometic Log" 
             icon={Calendar} 
             colorClass="text-gray-400"
           />
        </div>

        {/* Explorer Board */}
        <Card className="p-0 border-white/10 bg-[#0B0F1A]/40 backdrop-blur-2xl overflow-hidden shadow-3xl">
          
          {/* Internal Navigation & Filtering */}
          <div className="p-8 border-b border-white/5 bg-white/[0.01]">
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex flex-col gap-2">
                   <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                     {reportView === 'baseline' ? 'Baseline Protocol' : `Week ${reportView} Differential`}
                     <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] italic">— {activeData?.responses.length} Biometric Units</span>
                   </h3>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-4">
                   <div className="relative w-full lg:w-48">
                      <select 
                        value={selectedDomain}
                        onChange={(e) => { setSelectedDomain(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-secondary/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="all">Global Domains</option>
                        {domains.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                   </div>

                   <div className="relative w-full lg:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                      <input 
                        type="text"
                        placeholder="Heuristic search..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-secondary/50 transition-all placeholder:text-gray-800"
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full border-collapse">
                <thead>
                   <tr className="bg-black/40 border-b border-white/5">
                      <th className="text-left py-5 px-8 text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Module Index</th>
                      <th className="text-left py-5 px-6 text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Biometric Domain</th>
                      <th className="text-left py-5 px-6 text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] min-w-[400px]">Item Statement</th>
                      <th className="text-center py-5 px-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Response</th>
                      <th className="text-right py-5 px-8 text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                   {paginatedResponses.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="py-24 text-center">
                           <div className="flex flex-col items-center gap-4 opacity-10">
                              <History className="w-16 h-16 text-white" />
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Biological Signal Nullified</p>
                           </div>
                        </td>
                     </tr>
                   ) : (
                     paginatedResponses.map((res, idx) => (
                       <tr key={idx} className="group hover:bg-white/[0.01] transition-colors border-l-2 border-transparent hover:border-secondary">
                          <td className="py-5 px-8">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-mono text-gray-700 font-bold group-hover:text-secondary transition-colors">UNIT-{(currentPage - 1) * itemsPerPage + idx + 1}</span>
                             </div>
                          </td>
                          <td className="py-5 px-6">
                             <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                               res.domain === 'cognitive' ? 'text-secondary/80 bg-secondary/5' :
                               res.domain === 'recovery' ? 'text-sky-400/80 bg-sky-400/5' :
                               res.domain === 'flow' ? 'text-amber-400/80 bg-amber-400/5' :
                               'text-gray-400 bg-white/5'
                             }`}>
                                {res.domain}
                             </span>
                          </td>
                          <td className="py-5 px-6">
                             <p className="text-sm font-bold text-gray-400 leading-relaxed group-hover:text-white transition-colors">
                               {res.text}
                             </p>
                          </td>
                          <td className="py-5 px-4 text-center">
                             <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl font-black text-sm border shadow-2xl transition-all group-hover:scale-110 ${
                               parseInt(res.answer) <= 3 
                                 ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                                 : parseInt(res.answer) >= 6
                                 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                 : 'bg-secondary/10 border-secondary/20 text-secondary'
                             }`}>
                               {res.answer}
                             </div>
                          </td>
                          <td className="py-5 px-8 text-right">
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 italic">Verified Log</span>
                                <Info className="w-3 h-3 text-secondary" />
                             </div>
                          </td>
                       </tr>
                     ))
                   )}
                </tbody>
             </table>
          </div>

          {/* Table Footer / Navigation */}
          <div className="p-8 border-t border-white/5 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Biometric Flow Control</span>
                <span className="text-xs font-bold text-gray-500 italic">
                  Showing {Math.min((currentPage-1)*itemsPerPage + 1, filteredResponses.length)}–{Math.min(currentPage*itemsPerPage, filteredResponses.length)} of {filteredResponses.length} Unit Data
                </span>
             </div>
             
             <div className="flex items-center gap-3">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1.5">
                   {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                     <button
                       key={i}
                       onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                       className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${
                         currentPage === i + 1 
                           ? 'bg-secondary text-black shadow-lg shadow-secondary/20 scale-110' 
                           : 'bg-white/5 text-gray-500 hover:bg-white/10'
                       }`}
                     >
                       {i + 1}
                     </button>
                   ))}
                   {totalPages > 5 && <span className="text-gray-700 px-2">...</span>}
                </div>

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  className="px-5 py-2.5 bg-secondary/10 border border-secondary/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-secondary/20 disabled:opacity-20 transition-all font-mono"
                >
                  Next
                </button>
             </div>
          </div>

        </Card>

      </div>
    </div>
  );
}
