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
  const categories = trend.map((item) => `Week ${item.week}`);
  const scores = trend.map((item) => item.nkpi);

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
      animations: {
        enabled: true,
        speed: 800,
      }
    },

    stroke: {
      curve: "smooth",
      width: [3, 2],
      dashArray: [0, 4],
    },

    colors: ["#EDDC90", "#4B5563"],

    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        opacityFrom: 0.1,
        opacityTo: 0,
      },
    },

    grid: {
      borderColor: "rgba(255,255,255,0.05)",
      strokeDashArray: 4,
      padding: { left: 10, right: 10 },
    },

    xaxis: {
      categories,
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "11px",
          fontWeight: 500
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
          fontWeight: 500
        },
        formatter: (val) => val.toFixed(0),
      },
    },

    tooltip: {
      theme: "dark",
      style: {
        fontSize: '11px',
      }
    },

    markers: {
      size: 0,
      hover: { size: 4 },
    },

    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '11px',
      labels: {
        colors: '#6B7280'
      },
      markers: {
      }
    },
  };

  const series = [
    {
      name: "Score",
      data: scores,
    },
    {
      name: "Trend",
      data: rollingAvg,
    },
  ];

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-6 pb-2">
        <h6 className="text-white font-bold text-lg mb-1">Performance Trend</h6>
        <p className="text-xs text-gray-500 font-medium">Progress over time</p>
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