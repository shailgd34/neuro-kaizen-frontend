import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ChevronLeft, TrendingUp, TrendingDown, Target, Brain, Zap } from "lucide-react";
import Card from "../../components/ui/Card";
import { getDomainDetails } from "./../../api/DashboardApi";

/* ================= HELPERS ================= */

const formatDrift = (status: string) => {
  switch (status?.toLowerCase()) {
    case "adaptive_strain":
      return "Adaptive Strain";
    case "stable":
      return "Stable";
    case "decline":
      return "Decline";
    case "recovery":
      return "Recovery";
    default:
      return status;
  }
};

const formatTrend = (trend: string) => {
  if (trend === "down") return "Slight Decline";
  if (trend === "up") return "Improving";
  return "Stable";
};

/* ================= COMPONENT ================= */

const DomainDetails = () => {
  const { domainId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["domain-details", domainId],
    queryFn: () => getDomainDetails(domainId as string),
    enabled: !!domainId,
  });

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <Zap className="w-8 h-8 text-secondary animate-pulse mb-4" />
        Analyzing domain intelligence...
      </div>
    );
  }

  const { snapshot, metrics, timeseries, insight, domainName } = data;
  const isPositive = snapshot.delta > 0;
  const isNegative = snapshot.delta < 0;

  return (
    <div className="mx-auto px-6 lg:px-10 py-8 animate-in fade-in zoom-in-95 duration-700">
      
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-secondary text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
            <Brain className="w-3 h-3" /> Core Dimension
          </span>
          <h4 className="text-3xl text-white font-bold tracking-tight capitalize">{domainName || domainId}</h4>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 lg:gap-10 items-stretch">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <Card className="p-8 relative overflow-hidden flex-1 group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <Target className="w-32 h-32 text-secondary" />
             </div>

             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">Current Calibration</p>
             
             <div className="flex items-baseline gap-4 mt-2 mb-6">
               <p className="text-6xl font-mono font-bold text-white tracking-tighter shadow-sm">{snapshot.currentScore}</p>
               <span className={`text-sm font-bold px-2 py-1 rounded ${isPositive ? "bg-emerald-500/10 text-emerald-400" : isNegative ? "bg-rose-500/10 text-rose-400" : "bg-white/5 text-gray-400"}`}>
                 {isPositive ? "+" : ""}{snapshot.delta}
               </span>
             </div>
             
             <div className="space-y-4">
               <div className="flex justify-between items-center pb-4 border-b border-white/5">
                 <span className="text-xs text-gray-500 font-medium">Baseline Reference</span>
                 <span className="text-sm text-gray-300 font-bold">{snapshot.baselineScore}</span>
               </div>
               <div className="flex justify-between items-center pb-4 border-b border-white/5">
                 <span className="text-xs text-gray-500 font-medium">Calculated Drift</span>
                 <span className="text-sm text-secondary font-bold">{formatDrift(snapshot.driftStatus)}</span>
               </div>
             </div>
          </Card>

          <Card className="p-8 flex-1">
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">Velocity Signals</p>
             <div className="space-y-5">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                    {metrics.trend === "up" ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-gray-400" />}
                    Macro Trend
                  </div>
                  <span className="text-sm text-white font-bold">{formatTrend(metrics.trend)}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs text-gray-500">Volatility Signature</span>
                  <span className="text-sm text-white font-medium capitalize">{metrics.volatility}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs text-gray-500">Rolling Trajectory</span>
                  <span className="text-sm text-white font-medium">{metrics.rollingAverage}</span>
                </div>
             </div>
          </Card>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <Card className="p-8 h-full flex flex-col group relative">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Longitudinal Analysis</p>
            <p className="text-sm text-gray-400 font-medium mb-8">Visualization of dimension performance against baseline thresholds</p>

            <div className="flex-1 w-full min-h-[300px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeseries} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="lineGoldGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8F5E25" />
                      <stop offset="100%" stopColor="#EDDC90" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} strokeDasharray="4 4" />

                  <XAxis
                    dataKey="week"
                    stroke="#4B5563"
                    tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `Week ${val}`}
                    dy={15}
                  />

                  <YAxis
                    stroke="#4B5563"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    tickCount={6}
                    dx={-10}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#11161D",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#fff",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      padding: "10px"
                    }}
                    labelStyle={{ color: "#6B7280", marginBottom: "4px", fontWeight: 600 }}
                    cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
                  />

                  {/* Primary Score Line */}
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="url(#lineGoldGradient)"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#11161D", stroke: "#EDDC90" }}
                    activeDot={{ r: 6, stroke: "#EDDC90", strokeWidth: 3, fill: "#11161D" }}
                  />

                  {/* Rolling Average Line */}
                  <Line
                    type="monotone"
                    dataKey="rollingAverage"
                    stroke="rgba(255,255,255,0.1)"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="text-[11px] text-gray-500 font-medium">Domain Score</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 border-b-2 border-dashed border-white/20" />
                <span className="text-[11px] text-gray-500 font-medium">Rolling Base</span>
              </div>
            </div>
          </Card>

          {/* ================= INSIGHT ================= */}
          <Card className="p-8 bg-gradient-to-br from-[#0A0D11] to-secondary/5 border-secondary/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-secondary/10 to-transparent pointer-events-none" />
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-4">Deep Diagnostic Insight</p>
            <p className="text-sm text-gray-200 leading-relaxed font-medium max-w-2xl relative z-10">
              {insight.summary || "Sufficient data patterns indicate structural equilibrium. Continue adhering to the baseline protocol to maintain the current trajectory."}
            </p>
            <p className="text-[10px] text-gray-500 mt-4 uppercase tracking-wider font-bold">
              Updated: {insight.lastUpdated || "Recently"}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DomainDetails;
