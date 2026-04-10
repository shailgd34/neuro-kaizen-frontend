import { useSearchParams, Link } from "react-router-dom";
import { ChevronLeft, Info, Activity, PieChart } from "lucide-react";

interface ClientDetailsHeaderProps {
  name: string;
  email: string;
  nkpiScore: number;
  driftStatus: string;
  accountStatus: string;
  calibrationStatus: string;
  clientId: string;
  tabsVisible: {
    overview: boolean;
    drift: boolean;
    contribution: boolean;
  };
  highlights: {
    drift: boolean;
    contribution: boolean;
  };
}


export default function ClientDetailsHeader({
  name,
  email,
  nkpiScore,
  driftStatus,
  accountStatus,
  calibrationStatus,
  clientId,
  tabsVisible,
  highlights,
}: ClientDetailsHeaderProps) {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const getDriftColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("red") || s.includes("critical") || s.includes("risk")) return "text-red-500";
    if (s.includes("amber") || s.includes("warning") || s.includes("strain") || s.includes("at risk")) return "text-yellow-500";
    return "text-emerald-500";
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Info, visible: tabsVisible.overview },
    { 
      id: "drift", 
      label: "Drift", 
      icon: Activity, 
      visible: tabsVisible.drift,
      highlight: highlights.drift
    },
    { 
      id: "contribution", 
      label: "Contribution", 
      icon: PieChart, 
      visible: tabsVisible.contribution,
      highlight: highlights.contribution
    },
  ];


  const StatItem = ({ label, value, colorClass = "text-white" }: { label: string, value: string | number, colorClass?: string }) => (
    <div className="flex flex-col gap-0.5 min-w-[120px]">
       <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{label}</span>
       <span className={`text-sm font-bold ${colorClass}`}>{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 mb-8 pt-4">
      {/* 1. Header: Back Button, Name, Email, Status Badge */}
      <div className="flex flex-col gap-4">
        <Link to="/clients" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors w-fit group">
           <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
           Back to Listings
        </Link>
        
        <div className="flex justify-between items-start">
           <div className="flex flex-col">
              <div className="flex items-center gap-4">
                 <h1 className="text-3xl font-bold text-white capitalize">{name}</h1>
                 <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${
                   accountStatus?.toLowerCase() === 'active' 
                   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                   : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                 }`}>
                    {accountStatus || 'Active'}
                 </span>
              </div>
              <p className="text-sm text-gray-500 mt-1 font-light italic">{email}</p>
           </div>
        </div>
      </div>

      {/* 2. Metadata Stats Row (Fixed at Top) */}
      <div className="flex flex-wrap gap-y-6 gap-x-12 p-8 bg-[#0B0F1A]/40 border border-white/5 rounded-2xl backdrop-blur-sm relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/40" />
         
         <StatItem label="Account Status" value={accountStatus} colorClass="text-emerald-500 uppercase italic font-black" />
         <StatItem label="Drift Status" value={driftStatus} colorClass={`${getDriftColor(driftStatus)} uppercase italic font-black`} />
         <StatItem label="NKPI Score" value={nkpiScore.toFixed(1)} />
         <StatItem label="Calibration Status" value={calibrationStatus} />
         <StatItem label="Baseline Completion" value="Mar 15, 2024" />
         <StatItem label="Last Submission" value="Dec 28, 2024" />

         <div className="w-full mt-4 flex items-center gap-2 border-t border-white/[0.03] pt-4">
            <span className="text-[9px] text-amber-500/80 font-black uppercase tracking-widest">Notes:</span>
            <span className="text-[10px] text-gray-600 font-medium italic">Full drift logic activates after calibration window completes.</span>
         </div>
      </div>

      {/* 3. Tab Bar (Below Header/Stats Row) */}
      <nav className="flex bg-[#0B0F1A] p-1 rounded-xl border border-white/5 w-fit">
        {tabs.filter(t => t.visible).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={`/clients/${clientId}${tab.id === "overview" ? "" : `?tab=${tab.id}`}`}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-xs font-bold transition-all relative ${
                isActive
                  ? "bg-white/10 text-white shadow-lg ring-1 ring-white/10"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : ''}`} />
              {tab.label}
              {tab.id !== 'overview' && tab.highlight && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

