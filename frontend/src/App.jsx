import { Suspense } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { EmptyState, LoadingScreen } from "./components/common";
import AppLayout from "./layouts/AppLayout";
import { privateRoutes, publicRoutes } from "./routes";

function ProtectedRoute() {
  const token = useSelector((state) => state.auth.token);
  return token ? <AppLayout /> : <Navigate to="/login" replace />;
}

function NotFound() {
  return (
    <div className="card">
      <EmptyState
        title="Page not found"
        message="The page you requested does not exist."
        action={
          <a className="primary-btn" href="/dashboard">
            Go to Dashboard
          </a>
        }
      />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {publicRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          {privateRoutes.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
