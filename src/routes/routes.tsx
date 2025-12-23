import { lazy, LazyExoticComponent, ComponentType } from "react";
import { paths } from "./path";

// ---------- Lazy-loaded Components ----------
const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const ForgotPassword = lazy(() => import("../features/auth/pages/ForgetPassword"));
const ResetPassword = lazy(() => import("../features/auth/pages/ResetPassword"));
const Dashboard = lazy(() => import("../features/dashboard/pages/Dashboard"));

const Courses = lazy(() => import("../features/dashboard/pages/Courses"));
const CreateCourse = lazy(() => import("../features/dashboard/pages/CreateCourse"));
const CourseDetails = lazy(() => import("../features/dashboard/pages/CourseDetails"));
const CourseVideos = lazy(() => import("../features/dashboard/pages/CourseVideos"));
const CourseDocuments = lazy(() => import("../features/dashboard/pages/CourseDocuments"));
const Categories = lazy(() => import("../features/dashboard/pages/Categories"));
const MyCourses = lazy(() => import("../features/dashboard/pages/MyCourses"));
const Certificates = lazy(() => import("../features/dashboard/pages/Certificates"));
const RolesManagement = lazy(() => import("../features/dashboard/pages/RolesManagement"));
// const UserProfile = lazy(() => import("../features/users/pages/UserProfile"));
// const AdminPanel = lazy(() => import("../features/admin/pages/AdminPanel"));
// const Unauthorized = lazy(() => import("../components/common/Unauthorized"));
// const ModerationPanel = lazy(() => import("../features/moderation/pages/ModerationPanel"));

export interface RouteConfig {
  path: string;
  name: string;
  element: LazyExoticComponent<ComponentType<any>>;
  permissions?: string[];
}

// ---------- Auth Routes ----------
export const AuthRoutes: RouteConfig[] = [
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
export const ProtectedRoutes: RouteConfig[] = [
  {
    path: paths.web.dashboard,
    name: "Dashboard",
    element: Dashboard,
    permissions: [],
  },
  {
    path: paths.web.courses,
    name: "Courses",
    element: Courses,
    permissions: [],
  },
  {
    path: paths.web.courseCreate,
    name: "Create Course",
    element: CreateCourse,
    permissions: [],
  },
  {
    path: paths.web.courseEdit,
    name: "Edit Course",
    element: CreateCourse,
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
  {
    path: paths.web.courseVideos,
    name: "Course Videos",
    element: CourseVideos,
    permissions: [],
  },
  {
    path: paths.web.courseDocuments,
    name: "Course Documents",
    element: CourseDocuments,
    permissions: [],
  },
  {
    path: paths.web.myCourses,
    name: "My Courses",
    element: MyCourses,
    permissions: [],
  },
  {
    path: paths.web.certificates,
    name: "Certificates",
    element: Certificates,
    permissions: [],
  },
  {
    path: paths.web.rolesManagement,
    name: "Roles Management",
    element: RolesManagement,
    permissions: ["admin"],
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
