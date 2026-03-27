import Card from "../../ui/Card";

const data = [
  {
    client: "Meridian Capital Group",
    completion: 100,
    status: "Complete",
  },
  {
    client: "Northgate Asset Mgmt",
    completion: 72,
    status: "Partial",
  },
  {
    client: "Solaris Wealth Advisors",
    completion: 45,
    status: "Incomplete",
  },
];

export default function WeeklySubmissionStatus() {
  return (
    <Card title="Weekly Submission Status">
      <table className="w-full text-sm">
        <thead className="border-b border-borderColor text-gray-400">
          <tr>
            <th className="text-left py-3">Client</th>
            <th>Completion</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-borderColor">
              <td className="py-3 text-gray-300">{row.client}</td>

              <td>
                <div className="w-full bg-gray-700 rounded h-2">
                  <div
                    className="bg-green-400 h-2 rounded"
                    style={{ width: `${row.completion}%` }}
                  />
                </div>
              </td>

              <td className="text-gray-300">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}