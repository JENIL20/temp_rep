import { lazy, LazyExoticComponent, ComponentType } from "react";
import { paths } from "./path";

// ---------- Lazy-loaded Components ----------
const Login = lazy(() => import("../domains/auth/pages/Login"));
const Register = lazy(() => import("../domains/auth/pages/Register"));
const ForgotPassword = lazy(() => import("../domains/auth/pages/ForgetPassword"));
const ResetPassword = lazy(() => import("../domains/auth/pages/ResetPassword"));
const Dashboard = lazy(() => import("../domains/dashboard/pages/Dashboard"));

const Courses = lazy(() => import("../domains/course/pages/Courses"));
const CreateCourse = lazy(() => import("../domains/course/pages/CreateCourse"));
const CourseDetails = lazy(() => import("../domains/course/pages/CourseDetails"));
const CourseVideos = lazy(() => import("../domains/course/pages/CourseVideos"));
const CourseDocuments = lazy(() => import("../domains/course/pages/CourseDocuments"));
const Categories = lazy(() => import("../domains/category/pages/Categories"));
const MyCourses = lazy(() => import("../domains/course/pages/MyCourses"));
const Certificates = lazy(() => import("../domains/certificate/pages/Certificates"));
const RolesManagement = lazy(() => import("../domains/role/pages/RolesManagement"));
const Profile = lazy(() => import("../domains/user/pages/Profile"));

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
    path: paths.web.profile,
    name: "Profile",
    element: Profile,
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
