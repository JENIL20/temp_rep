import { lazy } from "react";
import { paths } from "./path";

// ---------- Lazy-loaded Components ----------
const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const ForgotPassword = lazy(() => import("../features/auth/pages/ForgetPassword"));
const ResetPassword = lazy(() => import("../features/auth/pages/ResetPassword"));
const Dashboard = lazy(() => import("../features/dashboard/pages/Dashboard"));

const Courses = lazy(() => import("../features/dashboard/pages/Courses"));
const CourseDetails = lazy(() => import("../features/dashboard/pages/CourseDetails"));
const Categories = lazy(() => import("../features/dashboard/pages/Categories"));
// const UserProfile = lazy(() => import("../features/users/pages/UserProfile"));
// const AdminPanel = lazy(() => import("../features/admin/pages/AdminPanel"));
// const Unauthorized = lazy(() => import("../components/common/Unauthorized"));
// const ModerationPanel = lazy(() => import("../features/moderation/pages/ModerationPanel"));

// ---------- Auth Routes ----------
export const AuthRoutes = [
  {
    path: paths.auth.login,
    name: "Login",
    element: Login,
  },
  {
    path: paths.auth.register,
    name: "Register",
    element: Register,
  },
  {
    path: paths.auth.forgot_password,
    name: "Forgot Password",
    element: ForgotPassword,
  },
  {
    path: paths.auth.reset_password,
    name: "Reset Password",
    element: ResetPassword,
  },
];

// ---------- Protected Routes ----------
export const ProtectedRoutes = [
  {
    path: paths.web.dashboard,
    name: "Dashboard",
    element: Dashboard,
    permissions: [],
  },
  {
    path: paths.web.courses,
    name: "Dashboard",
    element: Courses,
    permissions: [],
  },
  {
    path: paths.web.categories,
    name: "Categories",
    element: Categories,
    permissions: [],
  },
  {
    path: paths.web.courseDetails,
    name: "Course Details",
    element: CourseDetails,
    permissions: [],
  },
  // {
  //   path: paths.web.admin,
  //   name: "Admin Panel",
  //   element: AdminPanel,
  //   permissions: ["admin"],
  // },
  // {
  //   path: paths.web.moderation,
  //   name: "Moderation Panel",
  //   element: ModerationPanel,
  //   permissions: ["admin", "moderator"],
  // },
  // {
  //   path: paths.web.unauthorized,
  //   name: "Unauthorized",
  //   element: Unauthorized,
  //   permissions: [],
  // },
];
