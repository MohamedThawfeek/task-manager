import { lazy } from "react";

const LoginPage = lazy(() => import("../pages/auth/Login"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPassword"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const ProjectsPage = lazy(() => import("../pages/projects/Projects"));
const ProjectDetailsPage = lazy(
  () => import("../pages/projects/ProjectDetails"),
);
const TasksPage = lazy(() => import("../pages/tasks/Tasks"));
const TaskDetailsPage = lazy(() => import("../pages/tasks/TaskDetails"));
const TaskFormPage = lazy(() => import("../pages/tasks/TaskForm"));
const CalendarPage = lazy(() => import("../pages/Calendar"));
const TeamPage = lazy(() => import("../pages/Team"));
const ReportsPage = lazy(() => import("../pages/Reports"));
const SettingsPage = lazy(() => import("../pages/Settings"));
const ProfilePage = lazy(() => import("../pages/Profile"));

export const publicRoutes = [
  { path: "/login", component: LoginPage },
  { path: "/forgot-password", component: ForgotPasswordPage },
  { path: "/reset-password", component: ResetPasswordPage },
];

export const privateRoutes = [
  { path: "/dashboard", component: Dashboard },
  { path: "/tasks", component: TasksPage },
  { path: "/tasks/new", component: TaskFormPage },
  { path: "/tasks/:id", component: TaskDetailsPage },
  { path: "/tasks/:id/edit", component: TaskFormPage },
  { path: "/projects", component: ProjectsPage },
  { path: "/projects/:id", component: ProjectDetailsPage },
  { path: "/calendar", component: CalendarPage },
  { path: "/team", component: TeamPage },
  { path: "/reports", component: ReportsPage },
  { path: "/settings", component: SettingsPage },
  { path: "/profile", component: ProfilePage },
];
