import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AppLayout from './layouts/AppLayout'
import { EmptyState, LoadingScreen } from './components/common'

const AuthPage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.AuthPage })))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ProjectsPage = lazy(() => import('./pages/Projects').then((m) => ({ default: m.ProjectsPage })))
const ProjectDetailsPage = lazy(() => import('./pages/Projects').then((m) => ({ default: m.ProjectDetailsPage })))
const TasksPage = lazy(() => import('./pages/Tasks').then((m) => ({ default: m.TasksPage })))
const TaskDetailsPage = lazy(() => import('./pages/Tasks').then((m) => ({ default: m.TaskDetailsPage })))
const TaskFormPage = lazy(() => import('./pages/Tasks').then((m) => ({ default: m.TaskFormPage })))
const CalendarPage = lazy(() => import('./pages/Calendar'))
const TeamPage = lazy(() => import('./pages/Team'))
const ReportsPage = lazy(() => import('./pages/Reports'))
const SettingsPage = lazy(() => import('./pages/Settings'))
const ProfilePage = lazy(() => import('./pages/Profile'))

function Protected() {
  const token = useSelector((s) => s.auth.token)
  return token ? <AppLayout /> : <Navigate to="/login" replace />
}

export default function App() {
  return <Suspense fallback={<LoadingScreen />}><Routes>
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
    <Route element={<Protected />}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/tasks/new" element={<TaskFormPage />} />
      <Route path="/tasks/:id" element={<TaskDetailsPage />} />
      <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetailsPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<div className="card"><EmptyState title="Page not found" message="The page you requested does not exist." action={<a className="primary-btn" href="/dashboard">Go to Dashboard</a>} /></div>} />
    </Route>
  </Routes></Suspense>
}
