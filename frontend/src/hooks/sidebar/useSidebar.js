import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { closeSidebar, toggleSidebarDropdown } from "../../redux/slice/sidebar";

import menuItems from "../../elements/Sidebar/sidemenu";

export default function useSidebar() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const access = useSelector((state) => state.auth.user?.access || "User");
  const openDropdown = useSelector((state) => state.sidebar.openDropdown);

  const dropdownKeys = [
    "dropdown1",
    "dropdown2",
    "dropdown3",
    "dropdown4",
    "dropdown5",
  ];

  // Check user access
  const hasAccess = (item) => !item.access || item.access.includes(access);

  // Filter menu based on user access
  const items = menuItems.filter(hasAccess).map((item) => {
    const menu = { ...item };

    dropdownKeys.forEach((key) => {
      if (menu[key]) {
        menu[key] = menu[key].filter(hasAccess);
      }
    });

    return menu;
  });

  // Get dropdown children
  const getChildren = (item) => dropdownKeys.flatMap((key) => item[key] || []);

  // Check active path
  const matchesPath = (path) => {
    if (!path) return false;

    const current = pathname.toLowerCase().replace(/\/$/, "") || "/";
    const target = path.toLowerCase().replace(/\/$/, "") || "/";

    return current === target || current.startsWith(`${target}/`);
  };

  // Check active menu
  const isActive = (item) => {
    const paths = [
      item.path,
      ...(item.activePaths || []),
      ...getChildren(item).map((child) => child.path),
    ];

    return paths.some(matchesPath);
  };

  // Check dropdown open
  const isDropdownOpen = (item) =>
    openDropdown === item.name ||
    getChildren(item).some((child) => matchesPath(child.path));

  return {
    items,
    getChildren,
    isActive,
    isDropdownOpen,
    closeSidebar: () => dispatch(closeSidebar()),
    toggleDropdown: (name) => dispatch(toggleSidebarDropdown(name)),
  };
}
