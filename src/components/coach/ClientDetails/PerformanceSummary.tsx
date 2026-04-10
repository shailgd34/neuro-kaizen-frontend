import ReactApexChart from "react-apexcharts";
import Card from "../../ui/Card";
import type { ApexOptions } from "apexcharts";

interface DomainScore {
  label: string;
  score: number;
  color: string;
}

interface PerformanceSummaryProps {
  nkpiScore: number;
  trend: { week: number; nkpi: number }[];
  domainScores: DomainScore[];
}

export default function PerformanceSummary({ nkpiScore, trend, domainScores }: PerformanceSummaryProps) {
  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      sparkline: { enabled: false },
      animations: { enabled: true, speed: 800 },
      background: 'transparent',
    },
    colors: ["#3B82F6"],
    stroke: {
      curve: "smooth",
      width: 3,
      lineCap: 'round',
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        opacityFrom: 0.6,
        opacityTo: 0.05,
        stops: [0, 100],
        colorStops: [
          { offset: 0, color: '#3B82F6', opacity: 0.4 },
          { offset: 100, color: '#3B82F6', opacity: 0 }
        ]
      },
    },
    markers: {
      size: 5,
      colors: ["#3B82F6"],
      strokeColors: "#0B0F1A",
      strokeWidth: 2,
      hover: { size: 7 }
    },
    grid: {
      show: true,
      borderColor: "rgba(255,255,255,0.03)",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories: trend.map(t => `W${t.week}`),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: 'rgba(255,255,255,0.2)', fontSize: '11px', fontWeight: 600 }
      }
    },
    yaxis: {
      show: false,
    },
    tooltip: {
      theme: 'dark',
      x: { show: true },
      y: { title: { formatter: () => 'NKPI:' } }
    },
  };

  const chartSeries = [
    {
      name: "NKPI Score",
      data: trend.map((t) => t.nkpi),
    },
  ];

  return (
    <Card className="bg-[#0B0F1A] border-white/5 p-8 shadow-2xl">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">Performance Summary</h3>
        <span className="text-[8px] bg-white/5 text-gray-500 px-2 py-0.5 rounded border border-white/5 uppercase italic">NKPI Biometric Tracking</span>
      </div>
      <div className="flex flex-col xl:flex-row items-center gap-12">


        {/* Left: NKPI Big Display */}
        <div className="flex flex-col items-center shrink-0">
          <span className="text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            {nkpiScore.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400 uppercase font-black tracking-[0.2em] mt-2">Global NKPI</span>
        </div>

        {/* Center: Hero Area Chart */}
        <div className="flex-1 w-full min-h-[160px] flex items-center px-4 border-x border-white/5 relative">
          <div className="w-full h-32">
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height="100%"
              width="100%"
            />
          </div>
        </div>

        {/* Right: Domain Horizontal Bars */}
        <div className="w-full xl:w-72 flex flex-col gap-4">
          <h6 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.1em] mb-1">Domain Distribution</h6>
          {domainScores.map((domain, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs uppercase font-bold tracking-tight">
                <span className="text-gray-400">{domain.label}</span>
                <span className="text-white tabular-nums">{domain.score}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${domain.score}%`,
                    backgroundColor: domain.color,
                    boxShadow: `0 0 12px ${domain.color}30`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
