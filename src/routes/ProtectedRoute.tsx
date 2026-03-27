import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

interface Props {
  allowedRoles?: ("client" | "coach")[];
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { token, role } = useSelector((state: RootState) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role as any)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}