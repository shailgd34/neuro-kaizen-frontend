import Card from "../../ui/Card";
import PerformanceSummary from "./PerformanceSummary";
import BaselineSidebar from "./Sidebar";
import { Eye } from "lucide-react";

import { useSearchParams } from "react-router-dom";
import { type ClientFullDetails } from "../../../api/clientApi";

interface OverviewTabProps {
  data: ClientFullDetails;
}

export default function OverviewTab({ data }: OverviewTabProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleViewWeek = (week: number) => {
    setSearchParams({ ...Object.fromEntries(searchParams), week: week.toString() });
  };

  // Map new API structure to metadata
  const metadata = {
    baselineDate: data.baseline?.completedAt ? new Date(data.baseline.completedAt).toLocaleDateString() : "Pending",
    itemsCompleted: data.progress ? `${data.progress.completed} / ${data.progress.total}` : "Pending",
    completionPercentage: data.progress ? Math.round((data.progress.completed / data.progress.total) * 100) : 0,
    calibrationWindow: data.calibration ? `Week ${data.calibration.currentWeek} of ${data.calibration.totalWeeks}` : "Processing",
    baselineAnchor: "Protocol V1",
    anchorVersion: "1.2.0"
  };


  const domainScores = data.baseline?.domains?.map(b => ({
    label: b.domain.charAt(0).toUpperCase() + b.domain.slice(1),
    score: Math.round(b.score),
    color: b.domain === 'cognitive' ? '#3B82F6' :
      b.domain === 'flow' ? '#10B981' :
        b.domain === 'friction' ? '#F59E0B' :
          b.domain === 'identity' ? '#8B5CF6' : '#EC4899'
  })) || [];

  // Map weeklyMetrics from the calibration object for the trend chart
  const trend = data.calibration?.weeklyMetrics?.map(m => ({
    week: m.week,
    nkpi: m.nkpi_score
  })) || [];

  return (
    <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Main Content Column */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

        {/* Primary Driver Card (using new primaryIssue mapping) */}
        {data.primaryIssue && (
          <Card className="border-amber-500/20 bg-amber-500/5! p-6 shadow-lg">
            <div className="flex flex-col gap-2">
              <h6 className="text-xs uppercase font-black text-amber-500 tracking-[0.2em]">Current Performance Driver</h6>
              <h4 className="text-2xl font-bold text-white capitalize tracking-tight">{data.primaryIssue.domain} {data.primaryIssue.delta < 0 ? 'Strain' : 'Expansion'}</h4>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                Status: <span className="text-amber-400 font-black uppercase text-xs">{data.primaryIssue.status}</span> —
                {data.primaryIssue.deltaStatus}: <span className="text-white font-bold">{Math.abs(data.primaryIssue.delta).toFixed(1)}pts</span> variance from baseline profile.
              </p>
            </div>
          </Card>
        )}


        {/* Performance Summary */}
        <section className="flex flex-col gap-3">

          <PerformanceSummary
            nkpiScore={data.nkpi || 0}
            trend={trend}
            domainScores={domainScores}
          />
        </section>

        {/* Weekly Tracking History */}
        <Card title="Weekly Protocol Submissions">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 text-left uppercase tracking-tighter text-xs">
                  <th className="py-5 px-4 font-black">Week #</th>
                  <th className="py-5 font-black">Submission Date</th>
                  <th className="py-5 text-center font-black">Protocol NKPI</th>
                  <th className="py-5 text-center font-black">Overall Status</th>
                  <th className="py-5 text-right font-black px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.calibration?.weeklyMetrics?.map((m, idx) => (
                  <tr key={idx} className="border-b border-white/5 last:border-0 text-gray-300 hover:bg-white/[0.03] transition-colors group">
                    <td className="py-5 px-4 font-black text-gray-400 text-md">W{m.week}</td>
                    <td className="py-5 text-gray-400 font-medium">{m.submittedAt ? new Date(m.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                    <td className="py-5 text-center text-white font-bold text-lg tabular-nums">{m.nkpi_score?.toFixed(1)}</td>
                    <td className="py-5 text-center">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${m.analysis?.summary?.overallStatus?.toLowerCase() === 'stable' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                        m.analysis?.summary?.overallStatus?.toLowerCase() === 'critical' ? 'bg-red-500/10 text-rose-500 border border-rose-500/10' :
                          'bg-amber-500/10 text-yellow-500 border border-amber-500/10'
                        }`}>
                        {m.analysis?.summary?.overallStatus}
                      </span>
                    </td>
                    <td className="py-5 text-right px-4">
                      <button
                        onClick={() => handleViewWeek(m.week)}
                        className="flex items-center gap-2 ml-auto px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-xs font-black uppercase tracking-tight text-blue-400 group-hover:bg-blue-500/10"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Analysis Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* Sidebar Column */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <BaselineSidebar metadata={metadata} />
      </div>
    </div>
  );
}
