import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, Settings, User, ChevronDown, Shield, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { logout } from "../store/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "../api/profileApi";

// ─────────────────────────────────────────
// Logout Confirmation Modal (inline, no StatusDialog)
// ─────────────────────────────────────────
function LogoutModal({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-[#0C1018] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-rose-500/10 blur-[60px] pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X size={14} className="text-gray-400" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <LogOut size={28} className="text-rose-400" />
          </div>

          <h5 className="text-white font-bold text-xl mb-2 tracking-tight">Sign out?</h5>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
            You'll be signed out of your Neural Kaizen session. Your progress is saved automatically.
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={onConfirm}
              className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-rose-500/20"
            >
              Yes, sign out
            </button>
            <button
              onClick={onCancel}
              className="w-full h-11 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-sm font-semibold transition-colors"
            >
              Stay logged in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Page title resolver
// ─────────────────────────────────────────
function usePageTitle() {
  const location = useLocation();
  const map: Record<string, string> = {
    "/dashboard": "Overview",
    "/baseline": "Baseline Diagnostic",
    "/baseline/assessment": "Baseline Assessment",
    "/baseline/review": "Baseline Review",
    "/baseline/results": "Baseline Results",
    "/weekly": "Weekly Check-In",
    "/weekly/result": "Weekly Results",
    "/history": "History Timeline",
    "/phase2": "Deep Diagnostic",
    "/client/profile": "Profile",
    "/settings": "Settings",
    "/clients": "Client Management",
    "/invitations": "Invitations",
    "/baselinequestions": "Baseline Questions",
    "/analytics": "Analytics",
    "/coach/profile": "Profile",
  };

  const path = location.pathname;
  if (path.startsWith("/domain/")) return "Domain Details";
  
  return map[path] || "Dashboard";
}

// ─────────────────────────────────────────
// Topbar
// ─────────────────────────────────────────
export default function Topbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pageTitle = usePageTitle();

  const auth = useSelector((state: RootState) => state.auth);
  const role = auth.role;
  const name = auth.name || sessionStorage.getItem("name") || "User";
  const email = auth.email || sessionStorage.getItem("email") || "";

  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    staleTime: 60000,
  });

  const BASE_URL = import.meta.env.VITE_PROFILE_URL;
  const apiImage = data?.data?.client?.profile_image;
  const imageUrl = apiImage
    ? apiImage.startsWith("http") ? apiImage : `${BASE_URL}/${apiImage}`
    : null;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setLogoutOpen(false);
    setDropdownOpen(false);
    // Clear all cached data and session
    queryClient.clear();
    sessionStorage.clear();
    localStorage.removeItem("token");
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate(role === "coach" ? "/coach/profile" : "/client/profile");
  };

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 bg-[#090C10]/95 backdrop-blur-xl border-b border-white/5">

        {/* Left — page title */}
        <div className="flex items-center gap-3">
          <div>
            <h6 className="text-white font-bold text-base tracking-tight leading-none">{pageTitle}</h6>
            
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-3">

          {/* Notification bell */}
          <button className="relative p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-colors">
            <Bell size={16} className="text-gray-400" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-secondary rounded-full" />
          </button>

          {/* Settings shortcut */}
          <button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-colors"
          >
            <Settings size={16} className="text-gray-400" />
          </button>

          {/* Profile dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen((p) => !p)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-colors group"
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-secondary/20 flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} className="w-full h-full object-cover" alt={name} />
                ) : (
                  <span className="text-secondary text-xs font-black">{initials}</span>
                )}
              </div>

              <div className="text-left hidden sm:block">
                <p className="text-white text-xs font-semibold leading-none">{name}</p>
                <p className="text-gray-500 text-[10px] mt-0.5 capitalize">{role}</p>
              </div>

              <ChevronDown
                size={13}
                className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0C1018] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">

                {/* User info header */}
                <div className="px-4 py-3 border-b border-white/5 bg-white/3">
                  <p className="text-white text-xs font-bold truncate">{name}</p>
                  <p className="text-gray-500 text-[10px] truncate mt-0.5">{email}</p>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={handleProfile}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors font-medium"
                  >
                    <User size={14} className="text-gray-500" />
                    View Profile
                  </button>

                  <button
                    onClick={() => { navigate("/settings"); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors font-medium"
                  >
                    <Settings size={14} className="text-gray-500" />
                    Settings
                  </button>

                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors font-medium">
                    <Shield size={14} className="text-gray-500" />
                    Security
                  </button>
                </div>

                <div className="p-1.5 border-t border-white/5">
                  <button
                    onClick={() => { setDropdownOpen(false); setLogoutOpen(true); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors font-bold"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout confirmation modal */}
      <LogoutModal
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
