import Card from "../../ui/Card";

const data = [
  {
    client: "Meridian Capital Group",
    status: "CRITICAL",
    delta: "+4.82%",
    date: "2025-07-14 06:31",
  },
  {
    client: "Vantage Equity Partners",
    status: "CRITICAL",
    delta: "+3.67%",
    date: "2025-07-14 05:18",
  },
  {
    client: "Northgate Asset Mgmt",
    status: "ELEVATED",
    delta: "+2.14%",
    date: "2025-07-13 22:47",
  },
];

export default function DriftAlertsTable() {
  return (
    <Card title="Recent Drift Alerts">
      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-borderColor">
          <tr>
            <th className="text-left py-3">Client Name</th>
            <th>Status</th>
            <th>Delta</th>
            <th>Last Updated</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b border-borderColor text-gray-300"
            >
              <td className="py-3">{row.client}</td>

              <td>
                <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded">
                  {row.status}
                </span>
              </td>

              <td className="text-red-400">{row.delta}</td>

              <td>{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}