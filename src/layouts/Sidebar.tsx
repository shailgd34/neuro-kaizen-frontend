import { useSelector } from "react-redux";
import { type RootState } from "../store/store";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Link as LinkIcon,
  FileText,
  ClipboardList,
  NotebookPen,
  Shield,
  Settings,
  Clock,
  Grid,
  User,
  RotateCcw,
  ChevronDown,
  CalendarArrowDown,
} from "lucide-react";

export default function Sidebar() {
  const { role } = useSelector((state: RootState) => state.auth);

  const [openMenu, setOpenMenu] = useState(false);

  const adminMenu = [
    {
      section: "",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
          path: "/dashboard",
        },
        {
          name: "Client Management",
          icon: Users,
          children: [
            { name: "Clients", path: "/clients" },
            { name: "Invitations", path: "/invitations" },
          ],
        },
      ],
    },
    {
      section: "ANALYTICS",
      items: [
        { name: "Client Analytics", icon: Calendar, path: "/analytics" },
        { name: "Drift Engine", icon: LinkIcon, path: "/drift" },
        {
          name: "Contribution Analysis",
          icon: FileText,
          path: "/contribution",
        },
        { name: "Item Responses", icon: ClipboardList, path: "/responses" },
      ],
    },
    {
      section: "GOVERNANCE",
      items: [
        { name: "Weekly Overrides", icon: Calendar, path: "/overrides" },
        { name: "Notes Management", icon: NotebookPen, path: "/notes" },
        { name: "Audit Log", icon: Shield, path: "/audit" },
      ],
    },
    {
      section: "CONFIGURATION",
      items: [
        { name: "Scoring Configuration", icon: Settings, path: "/scoring" },
        { name: "Reminder Scheduling", icon: Clock, path: "/reminders" },
        { name: "MDC Framework", icon: Grid, path: "/mdc" },
        { name: "Baseline Questions", icon: Grid, path: "/baselinequestions" },
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

  const clientMenu = [
    {
      section: "",
      items: [
        { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
        { name: "Baseline Diagnostic", icon: Users, path: "/baseline" },
        { name: "Weekly Check-Ins", icon: CalendarArrowDown, path: "/weekly" },
        { name: "Weekly History", icon: Users, path: "/history" },

        
        // { name: "Domain Analysis", icon: LinkIcon, path: "/domain-analysis" },
        { name: "Profile", icon: User, path: "/client/profile" },
        { name: "Settings", icon: Settings, path: "/settings" },
      ],
    },
  ];

  const menu = role === "coach" ? adminMenu : clientMenu;

  return (
    <aside className="w-64 bg-[#0F1720]  border-[#2A3441] border-r flex flex-col h-screen">
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="text-center pt-6 pb-8 px-4">
          <Link to="/dashboard">
            <img
              src="/assets/images/logo.png"
              className="mx-auto w-full object-cover cursor-pointer"
              alt="Logo"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-4 flex flex-col gap-3 overflow-y-auto flex-1">
          {menu.map((group, i) => (
            <div key={i}>
              {group.section && (
                <p className="text-[11px] text-gray-500 mb-1 px-2 tracking-wider">
                  {group.section}
                </p>
              )}

              <div className="flex flex-col">
                {group.items.map((item: any) => {
                  const Icon = item.icon;

                  if (item.children) {
                    const isOpen = openMenu === item.name;

                    return (
                      <div key={item.name}>
                        <button
                          onClick={() => setOpenMenu(isOpen ? null : item.name)}
                          className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-gray-300 hover:bg-[#1A222C]"
                        >
                          <div className="flex items-center gap-2">
                            <Icon size={18} />
                            {item.name}
                          </div>

                          <ChevronDown
                            size={16}
                            className={`transition ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="ml-8 mt-1 flex flex-col gap-1 border-l border-[#30363F] pl-1">
                            {item.children.map((child: any) => (
                              <NavLink key={child.path} to={child.path}>
                                {({ isActive }) => (
                                  <div
                                    className={`flex items-center gap-3 px-3 py-2 text-sm transition
            ${
              isActive
                ? "bg-[#1A2230] text-secondary border border-[#263040]"
                : "text-gray-300 hover:bg-[#1A222C] hover:text-white"
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

                  return (
                    <NavLink key={item.path} to={item.path}>
                      {({ isActive }) => (
                        <div
                          className={`flex items-center gap-2 px-3 py-2.5  text-sm transition
      ${
        isActive
          ? "bg-[#1A2230] text-secondary border border-[#263040]"
          : "text-gray-300 hover:bg-[#1A222C] hover:text-white"
      }`}
                        >
                          <Icon
                            size={18}
                            className={
                              isActive ? "text-secondary" : "text-gray-400"
                            }
                          />
                          {item.name}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
