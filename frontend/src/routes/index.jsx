import { lazy } from 'react'

const AuthPage = lazy(() => (
  import('../pages/AuthPages').then((module) => ({ default: module.AuthPage }))
))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const ProjectsPage = lazy(() => (
  import('../pages/Projects').then((module) => ({ default: module.ProjectsPage }))
))
const ProjectDetailsPage = lazy(() => (
  import('../pages/Projects').then((module) => ({ default: module.ProjectDetailsPage }))
))
const TasksPage = lazy(() => (
  import('../pages/Tasks').then((module) => ({ default: module.TasksPage }))
))
const TaskDetailsPage = lazy(() => (
  import('../pages/Tasks').then((module) => ({ default: module.TaskDetailsPage }))
))
const TaskFormPage = lazy(() => (
  import('../pages/Tasks').then((module) => ({ default: module.TaskFormPage }))
))
const CalendarPage = lazy(() => import('../pages/Calendar'))
const TeamPage = lazy(() => import('../pages/Team'))
const ReportsPage = lazy(() => import('../pages/Reports'))
const SettingsPage = lazy(() => import('../pages/Settings'))
const ProfilePage = lazy(() => import('../pages/Profile'))

export const publicRoutes = [
  { path: '/login', component: AuthPage, props: { mode: 'login' } },
  { path: '/register', component: AuthPage, props: { mode: 'register' } },
  { path: '/forgot-password', component: AuthPage, props: { mode: 'forgot' } },
  { path: '/reset-password', component: AuthPage, props: { mode: 'reset' } },
]

export const privateRoutes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/tasks', component: TasksPage },
  { path: '/tasks/new', component: TaskFormPage },
  { path: '/tasks/:id', component: TaskDetailsPage },
  { path: '/tasks/:id/edit', component: TaskFormPage },
  { path: '/projects', component: ProjectsPage },
  { path: '/projects/:id', component: ProjectDetailsPage },
  { path: '/calendar', component: CalendarPage },
  { path: '/team', component: TeamPage },
  { path: '/reports', component: ReportsPage },
  { path: '/settings', component: SettingsPage },
  { path: '/profile', component: ProfilePage },
]
