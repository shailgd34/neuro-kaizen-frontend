import { useState } from "react";
import {
  Users,
  Search,
  Bell,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Plus,
  MessageSquare,
  ClipboardCheck,
  Zap,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  RotateCcw
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import Card from "../../components/ui/Card";

// Mock data
const clients = [
  { id: "1", name: "Alex Thompson", phase: "Weekly", week: 6, status: "Active" },
  { id: "2", name: "Sarah Jenkins", phase: "Baseline", week: 0, status: "Critical" },
  { id: "3", name: "Michael Chen", phase: "Phase 2", week: 12, status: "Drift" },
];

const weeklyTrendData = [
  { week: 'W1', score: 65, cognitive: 70, emotional: 60, behavioral: 65, recovery: 70, performance: 60 },
  { week: 'W2', score: 68, cognitive: 72, emotional: 62, behavioral: 68, recovery: 72, performance: 66 },
  { week: 'W3', score: 62, cognitive: 65, emotional: 58, behavioral: 62, recovery: 60, performance: 65 },
  { week: 'W4', score: 70, cognitive: 75, emotional: 65, behavioral: 70, recovery: 75, performance: 65 },
  { week: 'W5', score: 74, cognitive: 78, emotional: 70, behavioral: 74, recovery: 78, performance: 72 },
  { week: 'W6', score: 78, cognitive: 82, emotional: 75, behavioral: 78, recovery: 82, performance: 75 },
];

const domainData = [
  { name: "Cognitive", score: 82, status: "Stable", delta: +5, trend: "up" },
  { name: "Emotional", score: 75, status: "Stable", delta: +3, trend: "up" },
  { name: "Behavioral", score: 68, status: "Drift", delta: -2, trend: "down" },
  { name: "Recovery", score: 62, status: "At Risk", delta: -8, trend: "down" },
  { name: "Performance", score: 79, status: "Stable", delta: +4, trend: "up" },
];

const activities = [
  { id: 1, type: "submission", title: "Completed weekly assessment", time: "2 hours ago", icon: ClipboardCheck, color: "text-emerald-400" },
  { id: 2, type: "note", title: "New note added by Coach Sarah", time: "5 hours ago", icon: MessageSquare, color: "text-blue-400" },
  { id: 3, type: "phase", title: "Transitioned to Phase 2 protocol", time: "Yesterday", icon: Zap, color: "text-amber-400" },
  { id: 4, type: "missed", title: "Missed recovery check-in", time: "2 days ago", icon: Clock, color: "text-rose-400" },
];

export default function ClientAnalytics() {
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [timeframe, setTimeframe] = useState("8 weeks");

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-[#090C10]/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-white tracking-tight">Client Analytics</h2>
            <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
              Live Insights
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">Deep performance metrics and trend analysis for individual clients.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-secondary transition-colors" />
            <input
              type="text"
              placeholder="Search data..."
              className="w-full sm:w-64 bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:border-secondary/50 transition-all placeholder:text-gray-600"
            />
          </div>

          <div className="relative group w-full sm:w-auto">
            <select
              value={selectedClient.id}
              onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value) || clients[0])}
              className="w-full sm:w-auto appearance-none bg-black/40 border border-white/10 rounded-xl px-5 py-2.5 pr-12 text-xs font-black text-white focus:outline-none focus:border-secondary/50 cursor-pointer transition-all hover:bg-black/60"
            >
              {clients.map(c => <option key={c.id} value={c.id} className="bg-[#090C10]">{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-white transition-colors" />
          </div>

          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
            {["Baseline", "Weekly", "Phase 2"].map(p => (
              <div key={p} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedClient.phase === p ? 'bg-secondary text-black shadow-lg shadow-secondary/20' : 'text-gray-500'}`}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Overall Score", value: "78.4", sub: "NK-KPI Score", trend: "+4.2%", type: "score", color: "secondary" },
          { label: "Current Status", value: "At Risk", sub: "Requires Action", status: "at-risk", type: "status" },
          { label: "Drift Status", value: "Improving", sub: "Recovery Lead", trend: "Strong", type: "drift", color: "emerald-400" },
          { label: "Completion", value: "94%", sub: "Weekly Compliance", trend: "+2%", type: "completion", color: "blue-400" }
        ].map((kpi, i) => (
          <Card key={i} className="p-6 relative group overflow-hidden bg-[#090C10]/40 border-white/5 hover:border-secondary/20 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-secondary/10 transition-all"></div>

            <div className="flex flex-col h-full relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 mb-1">{kpi.label}</span>
              <div className="flex items-end gap-3 mb-2">
                <span className={`text-3xl font-black ${kpi.type === 'score' ? 'text-secondary drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]' : kpi.status === 'at-risk' ? 'text-amber-500' : 'text-white'}`}>
                  {kpi.value}
                </span>
                {kpi.trend && (
                  <span className={`text-[10px] font-bold mb-1.5 ${kpi.trend.includes('+') || kpi.trend === 'Strong' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {kpi.trend}
                  </span>
                )}
              </div>
              <div className="mt-auto flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full ${kpi.status === 'at-risk' ? 'bg-amber-500' : 'bg-gray-700'}`}></div>
                <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">{kpi.sub}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Domain Performance Card */}
      <Card className="p-8 bg-[#090C10]/40 border-white/5">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-white mb-1">Domain Performance</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cross-sectional analysis of performance foundations</p>
          </div>
          <button className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {domainData.map((domain, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-secondary/10 group-hover:text-secondary text-gray-400 transition-all">
                  {domain.name === "Cognitive" && <Brain className="w-4 h-4" />}
                  {domain.name === "Emotional" && <AlertCircle className="w-4 h-4" />}
                  {domain.name === "Behavioral" && <Zap className="w-4 h-4" />}
                  {domain.name === "Recovery" && <RotateCcw className="w-4 h-4" />}
                  {domain.name === "Performance" && <TrendingUp className="w-4 h-4" />}
                </div>
                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${domain.status === 'Stable' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  domain.status === 'Drift' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                  {domain.status}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{domain.name}</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-white">{domain.score}</span>
                  <div className="flex items-center gap-0.5 mb-1">
                    {domain.trend === 'up' ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownRight className="w-3 h-3 text-rose-400" />}
                    <span className={`text-[10px] font-bold ${domain.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {domain.delta >= 0 ? `+${domain.delta}` : domain.delta}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-10 w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyTrendData}>
                    <defs>
                      <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={domain.trend === 'up' ? '#10b981' : '#f43f5e'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={domain.trend === 'up' ? '#10b981' : '#f43f5e'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey={domain.name.toLowerCase()}
                      stroke={domain.trend === 'up' ? '#10b981' : '#f43f5e'}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#grad-${i})`}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 bg-[#090C10]/40 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-white mb-1">Weekly Score Progression</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Aggregate performance trend over current phase</p>
            </div>
            <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
              {["4W", "8W", "All"].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 rounded-md text-[9px] font-black tracking-widest transition-all ${timeframe.startsWith(t[0]) ? 'bg-secondary text-black' : 'text-gray-500 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#EAB308" stopOpacity={0.2} />
                    <stop offset="50%" stopColor="#EAB308" stopOpacity={1} />
                    <stop offset="100%" stopColor="#EAB308" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  hide={true}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090C10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#EAB308', fontWeight: 'bold', fontSize: '12px' }}
                  labelStyle={{ color: '#6b7280', marginBottom: '4px', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#EAB308"
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#EAB308', strokeWidth: 0 }}
                  activeDot={{ r: 6, stroke: '#090C10', strokeWidth: 2, fill: '#EAB308' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 bg-[#090C10]/40 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-white mb-1">Domain Contribution</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Weighted impact of foundations on total score</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition-all">
              <Filter className="w-3 h-3" />
              View Specifics
            </button>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData} layout="vertical" barGap={8}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis type="number" hide={true} />
                <YAxis
                  dataKey="week"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#090C10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="cognitive" stackId="a" fill="#EAB308" radius={[0, 0, 0, 0]} barSize={20} />
                <Bar dataKey="recovery" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Insights Panel */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="p-8 bg-gradient-to-br from-[#090C10]/80 to-secondary/5 border-secondary/10 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-secondary/20 scale-150 opacity-20"><Zap className="w-24 h-24" /></div>

            <div className="mb-6 relative z-10">
              <h4 className="text-lg font-black text-white mb-1 flex items-center gap-2">
                <Zap className="w-5 h-5 text-secondary" />
                NK-AI Insights & Recommended Actions
              </h4>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Autonomous analysis based on latest check-ins</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-4">
                <div className="bg-white/5 border-l-2 border-secondary rounded-r-xl p-4">
                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Primary Issue Identified</p>
                  <p className="text-sm font-bold text-white mb-2">Cognitive Overload & Recovery Deficit</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-medium">Data shows a 12% decline in Cognitive stability correlated with a decrease in deep sleep metrics. Submissions indicate increased subjective fatigue.</p>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Critical Observation</p>
                    <p className="text-xs font-bold text-white">Systemic fatigue pattern emerging in behavioral foundations.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Coach Prescriptions</p>
                <div className="space-y-3">
                  {[
                    "Schedule recovery review session ASAP",
                    "Audit Phase 2 training volume",
                    "Adjust cognitive complexity for Week 7",
                    "Trigger daily biometric check-in"
                  ].map((action, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-secondary/30 flex items-center justify-center text-secondary shrink-0">
                        <Plus className="w-3 h-3" />
                      </div>
                      <p className="text-xs font-bold text-white/90">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-8 bg-[#090C10]/40 border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-white mb-1">Recent Activity</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Audit trail of client interactions and system events</p>
              </div>
              <button className="text-[10px] font-black text-secondary uppercase tracking-widest border-b border-secondary/20 pb-0.5 hover:border-secondary transition-all">
                View Full Audit Log
              </button>
            </div>

            <div className="space-y-8">
              {activities.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex gap-6 relative">
                    {i !== activities.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-[-32px] w-px bg-white/5"></div>
                    )}
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 relative z-10`}>
                      <Icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-bold text-white mb-1">{activity.title}</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-600" />
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{activity.time}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-800"></span>
                        <span className="text-[10px] font-bold text-gray-700">Ref: #{activity.id}932</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Side Action Column */}
        <div className="space-y-8">
          <Card className="p-6 bg-[#090C10]/60 border-secondary/20 shadow-[0_0_40px_rgba(234,179,8,0.03)]">
            <div className="mb-6">
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Health Risk Indicator</h4>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                <div className="w-[60%] bg-emerald-500 transition-all duration-1000"></div>
                <div className="w-[20%] bg-amber-500 transition-all duration-1000"></div>
                <div className="flex-1 bg-white/10"></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Active Alert</span>
                </div>
                <p className="text-xs font-bold text-rose-200">Consistency drop detected in recovery submissions (-22%)</p>
              </div>

              <div className="flex bg-white/5 rounded-xl items-center p-3 justify-between border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-gray-300">Baseline Stability</span>
                </div>
                <span className="text-xs font-black text-white">92%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-[#090C10]/40 border-white/5">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 pb-2 border-b border-white/5">Quick Actions</h4>
            <div className="space-y-3">
              {[
                { label: "New Clinical Note", icon: MessageSquare, color: "text-blue-400" },
                { label: "Assign Protocol Task", icon: ClipboardCheck, color: "text-emerald-400" },
                { label: "Trigger Manual Reminder", icon: Bell, color: "text-amber-400" },
                { label: "Change Intervention Phase", icon: Zap, color: "text-secondary" },
                { label: "Generate PDF Report", icon: ArrowUpRight, color: "text-white" }
              ].map((action, i) => (
                <button key={i} className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-3">
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                    <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-600 -rotate-90" />
                </button>
              ))}
            </div>
          </Card>

          <div className="bg-secondary/5 border border-secondary/10 rounded-2xl p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-white tracking-tight">Growth Projection</p>
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Based on current trajectory, client will reach stabilization by Week 9.</p>
            </div>
            <button className="w-full py-2.5 bg-secondary text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-secondary/80 transition-all">
              Unlock Projection Model
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
