import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import ClientDashboard from "../pages/client/ClientDashboard";
import CoachDashboard from "../pages/coach/CoachDashboard";
import { Navigate } from "react-router-dom";

export default function RoleDashboard() {

  const role = useSelector((state: RootState) => state.auth.role);

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (role === "client") {
    return <ClientDashboard />;
  }

  if (role === "coach") {
    return <CoachDashboard />;
  }

  return <div>Unauthorized</div>;
}