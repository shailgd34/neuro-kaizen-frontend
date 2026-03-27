import Card from "../../ui/Card";

export default function ConfigurationStatus() {
  return (
    <Card title="Configuration Status">
      <div className="flex flex-col gap-6">

        <div>
          <p className="text-sm text-gray-400">Scoring Version</p>
          <p className="text-lg text-white font-semibold">v4.2.1</p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Drift Threshold</p>
          <p className="text-yellow-400 font-semibold">1.50%</p>
        </div>

        <div>
          <p className="text-sm text-gray-400">MDC Status</p>
          <p className="text-green-400 font-semibold">Operational</p>
        </div>

      </div>
    </Card>
  );
}