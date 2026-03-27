import StatCard from "./StatCard";

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-5 gap-6">
      <StatCard
        title="Active Clients"
        value={142}
        subtitle="+4 this week"
        color="green"
      />

      <StatCard
        title="In Calibration"
        value={18}
        subtitle="Pending review"
        color="yellow"
      />

      <StatCard
        title="Drift Alerts"
        value={7}
        subtitle="+3 since yesterday"
        color="red"
      />

      <StatCard
        title="Incomplete Submissions"
        value={23}
        subtitle="Weekly cycle"
        color="yellow"
      />

      <StatCard
        title="Pending Invitations"
        value={11}
        subtitle="Awaiting acceptance"
        color="blue"
      />
    </div>
  );
}