import { useParams, useSearchParams } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { getClientFullDetails } from "../../api/clientApi";

import ClientDetailsHeader from "../../components/coach/ClientDetails/ClientDetailsHeader";
import OverviewTab from "../../components/coach/ClientDetails/OverviewTab";
import DriftTab from "../../components/coach/ClientDetails/DriftTab";
import ContributionTab from "../../components/coach/ClientDetails/ContributionTab";
import NotesSection from "../../components/coach/ClientDetails/NotesSection";
import WeeklyDetailView from "../../components/coach/ClientDetails/WeeklyDetailView";



export default function ClientDetails() {
  const { clientId } = useParams<{ clientId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const selectedWeek = searchParams.get("week");


  const { data, isLoading, error } = useQuery({
    queryKey: ["client-details", clientId],
    queryFn: () => getClientFullDetails(clientId!),
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 animate-pulse">Initializing NKPI Snapshot...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="p-4 bg-red-500/10 rounded-full">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-white">Data Link Disconnected</h2>
        <p className="text-gray-500 text-center max-w-md italic">
          The server responded with an invalid structure. Verification of client lifecycle integrity failed.
        </p>
      </div>
    );
  }

  // Derive stage-based values from the new "Reliable API" structure
  const calibrationProgress = `Week ${data.calibration?.currentWeek || 0} of ${data.calibration?.totalWeeks || 6}`;


  // High-level highlights using the new primaryIssue/secondaryIssue fields
  const highlights = {
    drift: data.primaryIssue?.status?.toLowerCase() === 'critical' ||
      data.primaryIssue?.status?.toLowerCase() === 'at risk' ||
      data.secondaryIssue?.status?.toLowerCase() === 'critical',
    contribution: data.primaryIssue?.delta < -5.0 // More sensitive highlight for contribution loss
  };

  const notes = [
    {
      id: "1",
      date: data.lastUpdate ? new Date(data.lastUpdate).toLocaleDateString() : new Date().toLocaleDateString(),
      author: "Biometric Insight",
      content: data.summary || "Performance analysis synchronized.",
      isPrivate: false
    }
  ];

  const renderTabContent = () => {
    // Priority 1: Weekly Detail Drill-down
    if (selectedWeek) {
      const weekNum = parseInt(selectedWeek);
      const weekData = data.calibration?.weeklyMetrics?.find(m => m.week === weekNum);

      if (weekData) {
        return (
          <WeeklyDetailView
            weekData={weekData}
            onBack={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete("week");
              setSearchParams(newParams);
            }}
          />
        );
      }
    }

    // Priority 2: Standard Tab views
    switch (activeTab) {
      case "drift":
        return <DriftTab data={data} />;
      case "contribution":
        return <ContributionTab data={data} />;
      case "overview":
      default:
        return <OverviewTab data={data} />;
    }
  };


  return (
    <div className="">
      <main className="container mx-auto px-4 lg:px-8">
        <ClientDetailsHeader
          name={data.client?.name || "Anonymous Client"}
          email={data.client?.email || "No contact info"}
          nkpiScore={data.nkpi || 0}
          driftStatus={data.primaryIssue?.status || "Analyzing"}
          accountStatus={data.userState || "Active"}
          calibrationStatus={calibrationProgress}
          clientId={clientId!}
          tabsVisible={{ overview: true, drift: true, contribution: true }}
          highlights={highlights}
        />

        <div className="mt-8 flex flex-col gap-8">
          {renderTabContent()}

          <div className="border-t border-white/5 pt-8">
            <NotesSection notes={notes} />
          </div>
        </div>
      </main>
    </div>
  );
}
