import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import PermissionBasedRoute from "./RoleBasedRoutes";
import { paths } from "./path";
import { AuthRoutes, ProtectedRoutes } from './routes';
import Wrapper from "@/shared/components/layout/Wrapper";

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ── Auth Routes (public) ─────────────────────────────── */}
          {AuthRoutes.map(({ path, element: Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}

          {/* ── Protected Routes (login required) ───────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Wrapper />}>
              {ProtectedRoutes.map(({ path, element: Element, requiredModule, requiredPermission }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    requiredModule ? (
                      // Module-gated route: redirect to /unauthorized if no permission
                      <PermissionBasedRoute
                        requiredModule={requiredModule}
                        requiredPermission={requiredPermission}
                      >
                        <Element />
                      </PermissionBasedRoute>
                    ) : (
                      // Open-to-all-authenticated-users route (dashboard, profile, unauthorized page)
                      <Element />
                    )
                  }
                />
              ))}
            </Route>
            <Route path="/" element={<Navigate to={paths.web.dashboard} />} />
          </Route>

          {/* ── 404 ─────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to={paths.web.dashboard} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;