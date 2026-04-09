import { useSelector } from "react-redux";
import { type RootState } from "../store/store";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBaselineResults } from "../api/baselineApi";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  ClipboardList,
  NotebookPen,
  Shield,
  Settings,
  Grid,
  User,
  RotateCcw,
  ChevronDown,
  History,
  Zap,
  Activity,
  Brain,
  BarChart2,
  GitBranch,
  Bell,
  BookOpen,
} from "lucide-react";

export default function Sidebar() {
  const { role, name } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const { data: resultsData } = useQuery({
    queryKey: ["assessment-results"],
    queryFn: getBaselineResults,
    enabled: role === "client",
    staleTime: 30000,
  });

  const apiData = resultsData?.data;
  const weeklyStatus = apiData?.weeklyStatus;
  const isPhase2Active = weeklyStatus?.phase2Pending === true;
  const isBaselineComplete = apiData?.baseline?.status === "completed";
  const calibrationWeek = apiData?.calibration?.currentWeek;

  // Routing: submitted OR phase2 active (week done) → results | available → check-in form
  const isWeekSubmitted = weeklyStatus?.isCurrentWeekSubmitted === true;
  const weeklyCheckinPath = (isWeekSubmitted || isPhase2Active) ? "/weekly/result" : "/weekly";

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // ─────────────────────────────────────────
  // ADMIN MENU
  // ─────────────────────────────────────────
  const adminMenu = [
    {
      section: "OVERVIEW",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        {
          name: "Client Management",
          icon: Users,
          children: [
            { name: "All Clients", path: "/clients" },
            { name: "Invitations", path: "/invitations" },
          ],
        },
      ],
    },
    {
      section: "ANALYTICS",
      items: [
        { name: "Client Analytics", icon: BarChart2, path: "/analytics" },
        { name: "Drift Engine", icon: GitBranch, path: "/drift" },
        { name: "Contribution Analysis", icon: FileText, path: "/contribution" },
        { name: "Item Responses", icon: ClipboardList, path: "/responses" },
      ],
    },
    {
      section: "GOVERNANCE",
      items: [
        { name: "Weekly Overrides", icon: CalendarCheck, path: "/overrides" },
        { name: "Notes Management", icon: NotebookPen, path: "/notes" },
        { name: "Audit Log", icon: Shield, path: "/audit" },
      ],
    },
    {
      section: "CONFIGURATION",
      items: [
        { name: "Scoring Config", icon: Settings, path: "/scoring" },
        { name: "Reminder Schedule", icon: Bell, path: "/reminders" },
        { name: "MDC Framework", icon: Grid, path: "/mdc" },
        { name: "Baseline Questions", icon: BookOpen, path: "/baselinequestions" },
      ],
    },
    {
      section: "SYSTEM",
      items: [
        { name: "Profile", icon: User, path: "/coach/profile" },
        { name: "Session", icon: RotateCcw, path: "/session" },
        { name: "Settings", icon: Settings, path: "/settings" },
      ],
    },
  ];

  // ─────────────────────────────────────────
  // CLIENT MENU
  // ─────────────────────────────────────────
  const clientMenu = [
    {
      section: "PROTOCOL",
      items: [
        {
          name: "Overview",
          icon: LayoutDashboard,
          path: "/dashboard",
        },
        {
          name: "Baseline Diagnostic",
          icon: Brain,
          path: isBaselineComplete ? "/baseline/results" : "/baseline",
          badge: isBaselineComplete ? "Done" : "Pending",
          badgeColor: isBaselineComplete ? "emerald" : "amber",
        },
        {
          name: "Weekly Check-In",
          icon: CalendarCheck,
          path: weeklyCheckinPath,
          badge: calibrationWeek ? `W${calibrationWeek}` : undefined,
          badgeColor: isWeekSubmitted ? "emerald" : "secondary",
        },
        {
          name: "History Timeline",
          icon: History,
          path: "/history",
        },
        ...(isPhase2Active
          ? [
              {
                name: "Deep Diagnostic",
                icon: Zap,
                path: "/phase2",
                state: { domain: weeklyStatus?.primaryIssue },
                isPriority: true,
              },
            ]
          : []),
      ],
    },
    {
      section: "ACCOUNT",
      items: [
        { name: "Profile", icon: User, path: "/client/profile" },
        { name: "Settings", icon: Settings, path: "/settings" },
      ],
    },
  ];

  const menu = role === "coach" ? adminMenu : clientMenu;

  return (
    <aside className="w-64 bg-[#090C10] border-r border-white/5 flex flex-col h-screen sticky top-0 overflow-hidden">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/5 shrink-0">
        <Link to="/dashboard" className="block">
          <img
            src="/assets/images/logo.png"
            className="w-full object-contain max-h-20"
            alt="Neuro-Kaizen"
          />
        </Link>
      </div>

      

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {menu.map((group, i) => (
          <div key={i}>
            {group.section && (
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.15em] px-3 mb-2">
                {group.section}
              </p>
            )}

            <div className="space-y-0.5">
              {group.items.map((item: any) => {
                const Icon = item.icon;

                // Dropdown item
                if (item.children) {
                  const isOpen = openMenus[item.name];
                  const isChildActive = item.children.some((c: any) =>
                    location.pathname === c.path
                  );

                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-colors group ${
                          isChildActive
                            ? "bg-secondary/10 text-secondary"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={15} className={isChildActive ? "text-secondary" : "text-gray-500 group-hover:text-gray-300"} />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <ChevronDown
                          size={13}
                          className={`text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isOpen && (
                        <div className="ml-4 mt-0.5 pl-3 border-l border-white/5 space-y-0.5">
                          {item.children.map((child: any) => (
                            <NavLink key={child.path} to={child.path}>
                              {({ isActive }) => (
                                <div
                                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                    isActive
                                      ? "text-secondary bg-secondary/10"
                                      : "text-gray-500 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  {child.name}
                                </div>
                              )}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Priority item (Phase 2)
                if (item.isPriority) {
                  return (
                    <NavLink key={item.path} to={item.path} state={item.state}>
                      {({ isActive }) => (
                        <div
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                            isActive
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={15} className="text-rose-400" />
                            <span>{item.name}</span>
                          </div>
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                          </span>
                        </div>
                      )}
                    </NavLink>
                  );
                }

                // Normal item
                return (
                  <NavLink key={item.path} to={item.path}>
                    {({ isActive }) => (
                      <div
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors group ${
                          isActive
                            ? "bg-secondary/10 text-secondary border border-secondary/20"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            size={15}
                            className={isActive ? "text-secondary" : "text-gray-500 group-hover:text-gray-300 transition-colors"}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>

                        {/* Badge */}
                        {item.badge && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              item.badgeColor === "emerald"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : item.badgeColor === "amber"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-secondary/10 text-secondary border border-secondary/20"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User pill */}
      <div className="px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5">
          <div className="w-7 h-7 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
            <span className="text-secondary text-xs font-bold uppercase">
              {name?.[0] ?? "U"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{name}</p>
            <p className="text-gray-500 text-[10px] font-medium capitalize">{role}</p>
          </div>
          <div className="ml-auto">
            <Activity size={12} className="text-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5 shrink-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
            NK-PID Platform
          </span>
          <span className="text-[9px] text-gray-700 font-medium">v1.0.4</span>
        </div>
      </div>
    </aside>
  );
}
