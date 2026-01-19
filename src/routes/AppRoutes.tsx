import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import RoleBasedRoute from "./RoleBasedRoutes"; // Import added
import { paths } from "./path";
import { AuthRoutes, ProtectedRoutes } from './routes';
import Wrapper from "@/shared/components/layout/Wrapper";

const LoadingFallback = () => <div>Loading...</div>;

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ---------- Auth Routes ---------- */}
          {AuthRoutes.map(({ path, element: Element }) => (
            <Route
              key={path}
              path={path}
              element={<Element />}
            />

          ))}


          {/* ---------- Protected Routes ---------- */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Wrapper />}>
              {ProtectedRoutes.map(({ path, element: Element, permissions = [] }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    permissions.length > 0 ? (
                      <RoleBasedRoute allowedRoles={permissions} >
                        <Element />
                      </RoleBasedRoute>
                    ) : (
                      <Element />
                    )
                  }
                />
              ))}
            </Route>
            <Route path="/" element={<Navigate to={paths.web.dashboard} />} />
          </Route>

          {/* ---------- 404 ---------- */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;