import {
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

export const menuItems = [
  { path: "/dashboard", name: "Dashboard", icon: <LayoutDashboard size={19} strokeWidth={1.8} /> },
  { path: "/tasks", name: "My Tasks", icon: <ClipboardList size={19} strokeWidth={1.8} /> },
  { path: "/projects", name: "Projects", icon: <FolderKanban size={19} strokeWidth={1.8} /> },
  { path: "/calendar", name: "Calendar", icon: <CalendarDays size={19} strokeWidth={1.8} /> },
  { path: "/team", name: "Team", icon: <Users size={19} strokeWidth={1.8} /> },
  { path: "/reports", name: "Reports", icon: <ChartNoAxesCombined size={19} strokeWidth={1.8} /> },
  { path: "/settings", name: "Settings", icon: <Settings size={19} strokeWidth={1.8} />, activePaths: ["/profile"] },
];

export default menuItems;
