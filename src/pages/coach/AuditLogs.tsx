import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../../api/adminApi";
import Card from "../../components/ui/Card";
import Pagination from "../../components/ui/Pagination";
import { 
  Shield, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Database,
  Globe,
  Terminal,
  Zap
} from "lucide-react";
import { useState } from "react";

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page],
    queryFn: () => getAuditLogs(page, limit),
  });

  const logs = data?.data || [];
  const total = data?.total || 0;

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-20 animate-in fade-in duration-700 bg-[#050608] min-h-screen">
      <main className="container mx-auto px-6 lg:px-12 py-10 max-w-[1920px]">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-secondary/10 rounded-lg">
                  <Shield className="w-6 h-6 text-secondary" />
               </div>
               <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] italic">Security Intelligence</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Administrative Audit Logs</h1>
            <p className="text-gray-500 mt-2 font-medium max-w-2xl text-sm">
               Monitoring immutable protocol transitions and administrative access vectors for compliance and integrity.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter by action, user or entity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#0B0F1A] border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-white focus:outline-none focus:border-secondary/50 transition-all w-80 shadow-2xl placeholder:text-gray-700"
                />
             </div>
             <button className="p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all shadow-xl">
                <Filter className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <Card className="bg-emerald-500/[0.02] border-emerald-500/10 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                 <Zap className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Total Operations</p>
                 <p className="text-xl font-black text-white">{total}</p>
              </div>
           </Card>
           <Card className="bg-secondary/[0.02] border-secondary/10 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                 <Terminal className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Latest Vector</p>
                 <p className="text-xl font-black text-white">{logs[0]?.action || 'N/A'}</p>
              </div>
           </Card>
           <Card className="bg-purple-500/[0.02] border-purple-500/10 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                 <Globe className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Network Stability</p>
                 <p className="text-xl font-black text-white">Verified</p>
              </div>
           </Card>
        </div>

        {/* Log Table */}
        <Card className="p-0 border-white/10 bg-[#0B0F1A]/30 backdrop-blur-2xl overflow-hidden shadow-3xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/5">
                  <th className="py-6 px-8 text-left text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Temporal Marker</th>
                  <th className="py-6 px-6 text-left text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Identity Hub</th>
                  <th className="py-6 px-6 text-left text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Operational Logic</th>
                  <th className="py-6 px-6 text-left text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] min-w-[300px]">Signal description</th>
                  <th className="py-6 px-8 text-right text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Node Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="py-10 px-8"><div className="h-6 bg-white/5 rounded-lg w-full"></div></td>
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-10">
                         <Database className="w-20 h-20 text-white" />
                         <p className="text-xs font-black uppercase tracking-[0.5em] text-white">Data Stream Nullified</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="group hover:bg-white/[0.01] transition-colors border-l-2 border-transparent hover:border-secondary">
                      <td className="py-6 px-8">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-white flex items-center gap-2">
                             <Calendar className="w-3 h-3 text-secondary" />
                             {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-gray-600 font-mono tracking-tighter flex items-center gap-2">
                             <Clock className="w-3 h-3" />
                             {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-secondary/10 group-hover:border-secondary/20 transition-all">
                               <UserIcon className="w-4 h-4 text-gray-500 group-hover:text-secondary group-hover:fill-secondary/20 transition-all" />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{log.user}</span>
                               <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mt-1">{log.role}</span>
                            </div>
                         </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-black text-white tracking-widest uppercase italic leading-none">{log.action}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest w-fit border ${
                            log.entity === 'System' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                            log.entity === 'Client' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                            'bg-white/5 text-gray-500 border-white/5'
                          }`}>
                             {log.entity}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                         <p className="text-sm font-bold text-gray-500 leading-relaxed font-mono tracking-tighter hover:text-gray-300 transition-colors">
                            {log.description}
                         </p>
                         <span className="text-[9px] text-gray-700 mt-1 block">ID ref: {log.entityId}</span>
                      </td>
                      <td className="py-6 px-8 text-right">
                         <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 shadow-inner">
                             <Globe className="w-3.5 h-3.5 text-gray-600" />
                             <span className="text-[10px] font-mono font-bold text-gray-400 tracking-tighter">{log.ip}</span>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Global Pagination */}
        {!isLoading && total > limit && (
          <div className="mt-8 flex justify-end">
            <Pagination 
              page={page}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </main>
    </div>
  );
}
