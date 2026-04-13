import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getClientsListing } from "../../api/adminApi";
import type { ClientListingItem } from "../../api/adminApi";
import Card from "../ui/Card";
import { User, Mail, Activity, Target, Zap, ChevronRight, Search, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import Pagination from "../ui/Pagination";

export default function ClientsListingTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ["clients-listing", page, debouncedSearch],
    queryFn: () => getClientsListing(page, limit, debouncedSearch),
  });

  const clientsData = data?.data || [];
  const total = data?.total || 0;

  // Local filter as fallback if API search isn't filtering correctly
  const clients = clientsData.filter(client => 
    !debouncedSearch || 
    client.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    client.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="font-black text-white tracking-tight">Client Directory</h4>
          <p className="text-gray-500 text-sm mt-1">Monitor all active protocols and diagnostics</p>
        </div>

        <div className="relative group max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F1A] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-secondary/50 transition-all shadow-xl"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-white/10 shadow-2xl bg-[#0B0F1A]/50 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="text-left py-5 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Client Identity</th>
                <th className="text-center py-5 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">State / Mode</th>
                <th className="text-center py-5 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Diagnostic Progress</th>
                <th className="text-center py-5 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Calibration</th>
                <th className="text-center py-5 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Phase 2</th>
                <th className="text-right py-5 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-8 px-6">
                      <div className="h-12 bg-white/5 rounded-xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Target className="w-12 h-12" />
                      <p className="text-xs font-black uppercase tracking-widest">No active protocols found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr
                    key={client.clientId}
                    className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => navigate(`/clients/${client.clientId}`)}
                  >
                    {/* Identity */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-inner group-hover:scale-110 transition-transform">
                          <User className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-white truncate">{client.name}</span>
                          <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" />
                            {client.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Mode / State */}
                    <td className="py-5 px-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${client.mode === 'baseline' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}>
                          {client.mode}
                        </span>
                        <span className="text-[10px] text-gray-600 font-medium uppercase tracking-widest">
                          {client.userState.replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="py-5 px-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                          <div
                            className="h-full bg-secondary shadow-[0_0_8px_rgba(var(--secondary-rgb),0.5)] transition-all duration-1000"
                            style={{ width: `${(client.progress.completed / client.progress.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-gray-500 tracking-tighter">
                          {client.progress.completed} / {client.progress.total} UNIT
                        </span>
                      </div>
                    </td>

                    {/* Calibration */}
                    <td className="py-5 px-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: client.weeks.totalWeeks }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-3 rounded-sm border ${i < client.weeks.completedWeeks
                                  ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.3)]'
                                  : 'bg-white/5 border-white/10'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-600 font-bold mt-1.5 uppercase tabular-nums">
                          WEEKS {client.weeks.completedWeeks}/{client.weeks.totalWeeks}
                        </span>
                      </div>
                    </td>

                    {/* Phase 2 */}
                    <td className="py-5 px-4 text-center">
                      {client.phase2.active ? (
                        <div className="inline-flex flex-col items-center gap-1">
                          <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-pulse">
                            <Zap className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                          </div>
                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Active</span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-center gap-1 opacity-20">
                          <Activity className="w-4 h-4 text-gray-500" />
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Idle</span>
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-5 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                           title="Explore Responses"
                           className="p-2.5 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary/20 transition-all group/btn"
                           onClick={(e) => {
                             e.stopPropagation();
                             navigate(`/responses/${client.clientId}`);
                           }}
                        >
                           <FileText className="w-4 h-4" />
                        </button>
                        <button 
                           title="View Lifecycle"
                           className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group/btn"
                           onClick={(e) => {
                             e.stopPropagation();
                             navigate(`/clients/${client.clientId}`);
                           }}
                        >
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {!isLoading && total > limit && (
        <Pagination 
          page={page}
          total={total}
          limit={limit}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
