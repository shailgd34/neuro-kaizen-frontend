import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import InvitePage from "../pages/auth/InvitePage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

import DashboardLayout from "../layouts/DashboardLayout";
import RoleDashboard from "../components/RoleDashboard";
import ClientManagement from "../pages/coach/ClientManagement";
import InviteManagement from "../pages/coach/InvitationsManagement";
import BaselineIntro from "../pages/baseline/BaselineIntro";
import BaselineAssessment from "../pages/baseline/BaselineAssessment";
import BaselineReview from "../pages/baseline/BaselineReview";
import BaselineResults from "../pages/baseline/BaselineResults";
import QuestionBaseline from "../pages/coach/QuestionBaseline";

import ErrorPage from "../pages/ErrorPage";
import WeeklyHistory from "../pages/weekly/WeeklyHistory";
import WeeklyResult from "../pages/weekly/WeeklyResult";
import ProfileManagement from "../pages/client/ProfileManagement";
import PerformanceDashboard from "../pages/client/PerformanceDashboard";
import DomainDetails from "../pages/client/DomainDetails";

import WeeklyCheckin from "../pages/weekly/WeeklyCheckin";
import ProfileManage from "../pages/coach/ProfileManage";

export default function AppRoutes() {
  const token = sessionStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Root route */}
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Auth pages */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              token ? <Navigate to="/dashboard" replace /> : <LoginPage />
            }
          />

          <Route path="/signup" element={<SignupPage />} />
          <Route path="/invite" element={<InvitePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>

        {/* Dashboard */}
        <Route element={<ProtectedRoute allowedRoles={["client", "coach"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<RoleDashboard />} />
            
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["coach"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/clients" element={<ClientManagement />} />
            <Route path="/invitations" element={<InviteManagement />} />
            <Route path="/baselinequestions" element={<QuestionBaseline />} />
            <Route path="/coach/profile" element={<ProfileManage />} />
          </Route>
        </Route>





        <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
          <Route element={<DashboardLayout />}>
            {/* Baseline Assessment */}
            <Route path="/baseline" element={<BaselineIntro />} />
            <Route
              path="/baseline/assessment"
              element={<BaselineAssessment />}
            />
            <Route path="/baseline/review" element={<BaselineReview />} />
            <Route
              path="performance-analytics"
              element={<PerformanceDashboard />}
            />
            <Route path="/baseline/results" element={<BaselineResults />} />

            {/* Weekly (NEW CLEAN SYSTEM) */}
            <Route path="/weekly" element={<WeeklyCheckin />} />
            <Route path="/weekly/result" element={<WeeklyResult />} />
            <Route path="/history" element={<WeeklyHistory />} />
            <Route path="/domain/:domainId" element={<DomainDetails />} />
            
            <Route path="/client/profile" element={<ProfileManagement />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
