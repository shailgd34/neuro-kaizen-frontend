import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import Card from "../../ui/Card";

type TrendItem = {
  week: number;
  nkpi: number;
};

type Props = {
  trend: TrendItem[];
  mode: "analysis";
};

const TrendChart = ({ trend }: Props) => {
  const categories = trend.map((item) => `W${item.week}`);
  const scores = trend.map((item) => item.nkpi);

  // trend direction
  const first = scores[0] ?? 0;
  const last = scores[scores.length - 1] ?? 0;
  const isImproving = last >= first;

  const lineColor = isImproving ? "#22C55E" : "#EF4444";

  // rolling average
  const rollingAvg = scores.map((_, i, arr) => {
    const prev = arr[i - 1] ?? arr[i];
    return Number(((prev + arr[i]) / 2).toFixed(2));
  });

  const options: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
    },

    stroke: {
      curve: "smooth",
      width: [2, 2],
      dashArray: [0, 5],
    },

    colors: [lineColor, "#6B7280"],

    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        gradientToColors: ["#1F2937"],
        opacityFrom: 0.25,
        opacityTo: 0.02,
      },
    },

    grid: {
      borderColor: "#1F2937",
      strokeDashArray: 4,
      padding: { left: 10, right: 10 },
    },

    xaxis: {
      categories,
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "11px",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    yaxis: {
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "11px",
        },
        formatter: (val) => val.toFixed(0),
      },
    },

    tooltip: {
      theme: "dark",
    },

    markers: {
      size: 0,
      hover: { size: 4 },
    },

    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: "NKPI",
      data: scores,
    },
    {
      name: "Rolling Avg",
      data: rollingAvg,
    },
  ];

  return (
    <Card>
      <div className="mb-4 px-5 pt-5">
        <p className="text-sm text-gray-400">
          Performance Trend Analysis
        </p>

        <p className="text-xs text-gray-500 mt-1">
          Weekly NKPI trend with rolling average smoothing
        </p>
      </div>

      <div className="px-2 pb-4">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={280}
        />
      </div>
    </Card>
  );
};

export default TrendChart;