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
const AddCourseVideo = lazy(() => import("../domains/course/pages/AddCourseVideo"));
const CourseDocuments = lazy(() => import("../domains/course/pages/CourseDocuments"));
const Categories = lazy(() => import("../domains/category/pages/Categories"));
const MyCourses = lazy(() => import("../domains/course/pages/MyCourses"));
const Certificates = lazy(() => import("../domains/certificate/pages/Certificates"));

const RolesManagement = lazy(() => import("../domains/role/pages/RolesManagement"));
const RolePermissionPage = lazy(() => import("../domains/role/pages/RolePermissionPage"));
const AssignRoles = lazy(() => import("../domains/role/pages/AssignRoles"));
const AssignRoleModules = lazy(() => import("../domains/role/pages/AssignRoleModules"));
const UserPermissionPage = lazy(() => import("../domains/role/pages/UserPermissionPage"));

const Profile = lazy(() => import("../domains/user/pages/Profile"));
const UserList = lazy(() => import("../domains/user/pages/UserList"));
const Organizations = lazy(() => import("../domains/organization/pages/Organizations"));
const Groups = lazy(() => import("../domains/group/pages/Groups"));
const ManageGroupCourses = lazy(() => import("../domains/group/pages/ManageGroupCourses"));
const Unauthorized = lazy(() => import("../shared/components/common/Unauthorized"));

// ---------- Route Config Type ----------
export interface RouteConfig {
  path: string;
  name: string;
  element: LazyExoticComponent<ComponentType<any>>;
  /**
   * Module code the user must have access to.
   * Maps to the keys in UserPermissions (UPPER_SNAKE, case-insensitive).
   * Omit for public-within-auth routes (dashboard, profile, etc.)
   */
  requiredModule?: string;
  /**
   * The specific action required (view | create | update | delete).
   * Defaults to 'view' check (canView) when omitted.
   */
  requiredPermission?: string;
  /** @deprecated use requiredModule + requiredPermission instead */
  permissions?: string[];
}

// ---------- Auth Routes (no login required) ----------
export const AuthRoutes: RouteConfig[] = [
  { path: paths.auth.login, name: "Login", element: Login },
  { path: paths.auth.register, name: "Register", element: Register },
  { path: paths.auth.forgot_password, name: "Forgot Password", element: ForgotPassword },
  { path: paths.auth.reset_password, name: "Reset Password", element: ResetPassword },
];

// ---------- Protected Routes (login required) ----------
export const ProtectedRoutes: RouteConfig[] = [
  // ── Always accessible (any logged-in user) ──────────────────────────────
  {
    path: paths.web.dashboard,
    name: "Dashboard",
    element: Dashboard,
  },
  {
    path: paths.web.profile,
    name: "Profile",
    element: Profile,
  },
  {
    path: paths.web.unauthorized,
    name: "Unauthorized",
    element: Unauthorized,
  },

  // ── Courses (MODULE: COURSES) ────────────────────────────────────────────
  {
    path: paths.web.courses,
    name: "Courses",
    element: Courses,
    requiredModule: "COURSE_MANAGEMENT",
    requiredPermission: "course_view",
  },
  {
    path: paths.web.courseDetails,
    name: "Course Details",
    element: CourseDetails,
    requiredModule: "COURSE_MANAGEMENT",
    requiredPermission: "course_view",
  },
  {
    path: paths.web.courseCreate,
    name: "Create Course",
    element: CreateCourse,
    requiredModule: "COURSE_MANAGEMENT",
    requiredPermission: "course_add",
  },
  {
    path: paths.web.courseEdit,
    name: "Edit Course",
    element: CreateCourse,
    requiredModule: "COURSE_MANAGEMENT",
    requiredPermission: "course_edit",
  },
  {
    path: paths.web.courseVideos,
    name: "Course Videos",
    element: CourseVideos,
    requiredModule: "COURSE_MANAGEMENT",
    requiredPermission: "course_view",
  },
  {
    path: paths.web.courseAddVideo,
    name: "Add Course Video",
    element: AddCourseVideo,
    requiredModule: "COURSE_MANAGEMENT",
    requiredPermission: "course_add",
  },
  {
    path: paths.web.courseEditVideo,
    name: "Edit Course Video",
    element: AddCourseVideo,
    requiredModule: "COURSE_MANAGEMENT",
    requiredPermission: "course_edit",
  },
  {
    path: paths.web.courseDocuments,
    name: "Course Documents",
    element: CourseDocuments,
    requiredModule: "COURSE_MANAGEMENT",
    requiredPermission: "course_view",
  },
  {
    path: paths.web.myCourses,
    name: "My Courses",
    element: MyCourses,
    requiredModule: "COURSE_MANAGEMENT",
    requiredPermission: "course_view",
  },

  // ── Categories (MODULE: CATEGORIES) ─────────────────────────────────────
  {
    path: paths.web.categories,
    name: "Categories",
    element: Categories,
    requiredModule: "CATEGORY_MANAGEMENT",
    requiredPermission: "category_view",
  },

  // ── Certificates (MODULE: CERTIFICATES) ─────────────────────────────────
  {
    path: paths.web.certificates,
    name: "Certificates",
    element: Certificates,
    requiredModule: "CERTIFICATE_MANAGEMENT",
    requiredPermission: "certificate_view",
  },

  // ── Roles & Permissions (MODULE: ROLES) ──────────────────────────────────
  {
    path: paths.web.rolesManagement,
    name: "Roles Management",
    element: RolesManagement,
    requiredModule: "ROLE_MANAGEMENT",
    requiredPermission: "role_view",
  },
  {
    path: paths.web.rolePermissions,
    name: "Role Permissions",
    element: RolePermissionPage,
    requiredModule: "ROLE_MANAGEMENT",
    requiredPermission: "role_edit",
  },
  {
    path: paths.web.roleModulesAssign,
    name: "Assign Role Modules",
    element: AssignRoleModules,
    requiredModule: "ROLE_MANAGEMENT",
    requiredPermission: "role_edit",
  },
  {
    path: paths.web.assignRoles,
    name: "Assign Roles",
    element: AssignRoles,
    requiredModule: "ROLE_MANAGEMENT",
    requiredPermission: "role_assign",
  },

  // ── Users (MODULE: USERS) ────────────────────────────────────────────────
  {
    path: paths.web.usersManagement,
    name: "Users Management",
    element: UserList,
    requiredModule: "USER_MANAGEMENT",
    requiredPermission: "user_view",
  },
  {
    path: paths.web.userPermissions,
    name: "User Permissions",
    element: UserPermissionPage,
    requiredModule: "USER_MANAGEMENT",
    requiredPermission: "user_edit",
  },

  // ── Organizations (MODULE: ORGANIZATIONS) ────────────────────────────────
  {
    path: paths.web.organizations,
    name: "Organizations",
    element: Organizations,
    requiredModule: "ORGANIZATION_MANAGEMENT",
    requiredPermission: "organization_view",
  },

  // ── Groups (MODULE: GROUPS) ──────────────────────────────────────────────
  {
    path: paths.web.groups,
    name: "Groups",
    element: Groups,
    requiredModule: "GROUP_MANAGEMENT",
    requiredPermission: "group_view",
  },
  {
    path: paths.web.manageGroupCourses,
    name: "Manage Group Courses",
    element: ManageGroupCourses,
    requiredModule: "GROUP_MANAGEMENT",
    requiredPermission: "group_edit",
  },
];
