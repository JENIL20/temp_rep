import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { APP_CONFIG, PAGE_TITLES } from '../../config/app.config';

export const usePageTitle = () => {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        // Handle dynamic routes (e.g., /courses/123)
        let title = PAGE_TITLES[path];

        if (!title) {
            // Try to match dynamic routes
            if (path.startsWith('/courses/')) {
                title = 'Course Details';
            } else if (path.startsWith('/admin/')) {
                title = 'Admin';
            } else {
                title = 'LMS';
            }
        }

        document.title = `${title} | ${APP_CONFIG.name} ${APP_CONFIG.subtitle}`;
    }, [location]);
};
