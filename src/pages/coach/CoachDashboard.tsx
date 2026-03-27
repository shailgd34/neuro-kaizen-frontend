import StatsGrid from "../../components/coach/Dashboard/StatsGrid";
import DriftAlertsTable from "../../components/coach/Dashboard/DriftAlertsTable";
import ConfigurationStatus from "../../components/coach/Dashboard/ConfigurationStatus";
import WeeklySubmissionStatus from "../../components/coach/Dashboard/WeeklySubmissionStatus";

export default function dashboard() {
  return (
    <div className="flex flex-col gap-8">

      <StatsGrid />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <DriftAlertsTable />
        </div>

        <ConfigurationStatus />
      </div>

      <WeeklySubmissionStatus />

    </div>
  );
}