export const APP_CONFIG = {
    name: 'LMS',
    subtitle: 'Academy',
    description: 'Learning Management System',
    logo: {
        icon: 'GraduationCap', // We can map this to a Lucide icon
        alt: 'LMS Logo'
    }
};

export const PAGE_TITLES: Record<string, string> = {
    '/': 'Home',
    '/login': 'Login',
    '/register': 'Register',
    '/dashboard': 'Dashboard',
    '/profile': 'Profile',
    '/courses': 'Courses',
    '/my-courses': 'My Courses',
    '/categories': 'Categories',
    '/certificates': 'Certificates',
    '/admin/roles': 'Roles & Permissions',
    '/projects': 'Projects',
    '/settings': 'Settings',
    '/forgot-password': 'Forgot Password',
    '/reset-password': 'Reset Password',
};
