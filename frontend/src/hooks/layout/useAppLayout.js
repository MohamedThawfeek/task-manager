import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { toggleTheme } from "../../redux/slice/ui";
import { logout, syncUser } from "../../redux/slice/auth";
import { markAllRead, setNotifications } from "../../redux/slice/notifications";
import { setProjects } from "../../redux/slice/project";
import { updateProfile } from "../../redux/slice/profile";
import { setTasks } from "../../redux/slice/task";
import { setTeamRows } from "../../redux/slice/team";

import { clearStoredAuth } from "../../service/authStorage";
import api from "../../service/axios";
import { apiPath } from "../../service/path";

import {
  formatNotification,
  formatProject,
  formatUser,
  normalizeTask,
} from "../../utils/apiData";

import {
  closeSidebar as closeSidebarAction,
  openSidebar as openSidebarAction,
} from "../../redux/slice/sidebar";

export default function useAppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { theme } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const { items: notifications } = useSelector((state) => state.notifications);
  const { items: tasks } = useSelector((state) => state.task);
  const { items: projects } = useSelector((state) => state.project);
  const isSidebarOpen = useSelector((state) => state.sidebar.mobileOpen);

  const access = user?.access || "User";
  const isAdmin = access.toLowerCase() === "admin";

  const [noticeOpen, setNoticeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [query, setQuery] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Load profile
  const loadProfile = async () => {
    const response = await api.get(apiPath.profile);
    const profile = formatUser(response.user || {});

    dispatch(syncUser(profile));
    dispatch(updateProfile(profile));
  };

  // Load tasks
  const loadTasks = async () => {
    const url = isAdmin ? apiPath.adminTasks : apiPath.userTasks;

    const response = await api.get(url);

    const tasks = (response.data || []).flatMap((group) =>
      (group.tasks || []).map((task) =>
        normalizeTask({
          ...task,
          status: task.status || group.status,
        }),
      ),
    );

    dispatch(setTasks(tasks));
  };

  // Load projects
  const loadProjects = async () => {
    const url = isAdmin ? apiPath.projects : apiPath.userProjects;

    const response = await api.get(url);

    dispatch(setProjects((response.projects || []).map(formatProject)));
  };

  // Load users
  const loadUsers = async () => {
    const response = await api.get(apiPath.users);

    dispatch(setTeamRows((response.users || []).map(formatUser)));
  };

  // Load notifications
  const loadNotifications = async () => {
    const response = await api.get(apiPath.notifications);

    dispatch(
      setNotifications((response.notifications || []).map(formatNotification)),
    );
  };

  // Initial API calls
  useEffect(() => {
    const loadData = async () => {
      const requests = [
        loadProfile,
        loadTasks,
        loadProjects,
        loadUsers,
        loadNotifications,
      ];

      await Promise.allSettled(requests.map((request) => request()));
    };

    loadData();
  }, [access]);

  // Search tasks and projects
  const results = query.trim()
    ? [
        ...tasks.map((task) => ({
          ...task,
          kind: "Task",
          path: `/tasks/${task.id}`,
        })),

        ...projects.map((project) => ({
          ...project,
          title: project.name,
          kind: "Project",
          path: `/projects/${project.id}`,
        })),
      ]
        .filter((item) =>
          (item.title || "").toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 7)
    : [];

  // Unread notification count
  const unread = notifications.filter((item) => !item.read).length;

  // Mark all notifications as read
  const readAllNotifications = async () => {
    try {
      const unreadItems = notifications.filter((item) => !item.read);

      if (!unreadItems.length) return;

      await Promise.all(
        unreadItems.map((item) =>
          api.patch(apiPath.updateNotification, {
            notification_id: item.id,
          }),
        ),
      );

      dispatch(markAllRead());
    } catch (error) {
      toast.error(error.message || "Unable to update notifications");
    }
  };

  // Mark single notification as read
  const readNotification = async (id) => {
    try {
      await api.patch(apiPath.updateNotification, {
        notification_id: id,
      });

      await loadNotifications();
    } catch (error) {
      toast.error(error.message || "Unable to update notification");
    }
  };

  // Search result navigation
  const chooseResult = (result) => {
    navigate(result.path);
    setQuery("");
    setResultsOpen(false);
  };

  // Logout
  const handleLogout = () => {
    clearStoredAuth();
    dispatch(logout());
    setLogoutPopup(false);

    toast.success("Signed out");
    navigate("/login");
  };

  return {
    navigate,
    theme,
    user,
    notifications,
    unread,
    results,

    isSidebarOpen,
    openSidebar: () => dispatch(openSidebarAction()),
    closeSidebar: () => dispatch(closeSidebarAction()),

    noticeOpen,
    setNoticeOpen,

    profileOpen,
    setProfileOpen,

    logoutPopup,
    setLogoutPopup,

    query,
    setQuery,

    resultsOpen,
    setResultsOpen,

    toggleColorMode: () => dispatch(toggleTheme()),

    readAllNotifications,
    readNotification,
    chooseResult,
    handleLogout,
  };
}
