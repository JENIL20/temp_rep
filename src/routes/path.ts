export const paths = {
  auth: {
    login: "/login",
    register: "/register",
    forgot_password: "/forgot-password",
    reset_password: "/reset-password",
  },
  web: {
    dashboard: "/dashboard",
    profile: "/profile",
    admin: "/admin",
    moderation: "/moderation",
    unauthorized: "/unauthorized",

    // Category Routes
    categories: "/categories",
    categoryCreate: "/categories/create",
    categoryEdit: "/categories/edit/:id",

    // Course Routes
    courses: "/courses",
    courseCreate: "/courses/create",
    courseDetails: "/courses/:id",
    courseEdit: "/courses/edit/:id",
    courseVideos: "/courses/:id/videos",
    courseDocuments: "/courses/:id/documents",

    // User Course Routes
    myCourses: "/my-courses",

    // Certificate Routes
    certificates: "/certificates",

    // Admin Routes
    rolesManagement: "/admin/roles",
    permissionsManagement: "/admin/permissions",
    usersManagement: "/admin/users",
  },
};
