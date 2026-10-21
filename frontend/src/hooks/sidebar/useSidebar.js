import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { closeSidebar, toggleSidebarDropdown } from "../../redux/slice/sidebar";
import menuItems from "../../elements/Sidebar/sidemenu";

const dropdownKeys = ["dropdown1", "dropdown2", "dropdown3", "dropdown4", "dropdown5"];

function normalizePath(path = "/") {
  const normalized = path.toLowerCase().replace(/\/$/, "");
  return normalized || "/";
}

function matchesPath(pathname, target) {
  const current = normalizePath(pathname);
  const expected = normalizePath(target);
  return current === expected || current.startsWith(`${expected}/`);
}

function getChildren(item) {
  return dropdownKeys.flatMap((key) => item[key] || []);
}

export default function useSidebar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const access = useSelector((state) => state.auth.user?.access || "User");
  const openDropdown = useSelector((state) => state.sidebar.openDropdown);

  const items = useMemo(() => menuItems
    .filter((item) => !item.access || item.access.includes(access))
    .map((item) => {
      const nextItem = { ...item };
      dropdownKeys.forEach((key) => {
        if (nextItem[key]) {
          nextItem[key] = nextItem[key].filter((child) => !child.access || child.access.includes(access));
        }
      });
      return nextItem;
    }), [access]);

  const isActive = (item) => {
    const paths = [item.path, ...(item.activePaths || [])].filter(Boolean);
    const childPaths = getChildren(item).map((child) => child.path);
    return [...paths, ...childPaths].some((path) => matchesPath(location.pathname, path));
  };

  const isDropdownOpen = (item) => openDropdown === item.name
    || getChildren(item).some((child) => matchesPath(location.pathname, child.path));

  return {
    items,
    location,
    getChildren,
    isActive,
    isDropdownOpen,
    closeSidebar: () => dispatch(closeSidebar()),
    toggleDropdown: (name) => dispatch(toggleSidebarDropdown(name)),
  };
}
