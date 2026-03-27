import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  return (
    <div className="flex bg-primary h-screen overflow-hidden">

      {/* Sidebar fixed */}
      <Sidebar />

      <div className="flex flex-col flex-1 h-screen">

        {/* Topbar fixed */}
        <Topbar />

        {/* Scrollable content area */}
        <main id="dashboard-scroll" className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}