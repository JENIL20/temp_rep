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
    courseAddVideo: "/courses/:id/add-video",
    courseEditVideo: "/courses/:id/videos/:videoId/edit",
    courseDocuments: "/courses/:id/documents",

    // User Course Routes
    myCourses: "/my-courses",

    // Certificate Routes
    certificates: "/certificates",

    // Admin Routes
    rolesManagement: "/admin/roles",
    rolePermissions: "/admin/roles/:roleId/permissions",
    assignRoles: "/admin/assign-roles",
    userPermissions: "/admin/users/:userId/permissions",
    permissionsManagement: "/admin/permissions",
    usersManagement: "/admin/users",
  },
};
