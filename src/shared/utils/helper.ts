/**
 * Debounce function to limit the rate at which a function can fire.
 * @param func The function to debounce
 * @param wait The delay in milliseconds
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>): void => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
};

/**
 * Throttle function to ensure a function is called at most once in a specified time period.
 * @param func The function to throttle
 * @param limit The time limit in milliseconds
 */
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>): void => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

/**
 * Format a number as currency (INR by default)
 * @param amount The amount to format
 * @param currency The currency code (default: INR)
 */
export const formatCurrency = (amount: number, currency = 'INR'): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Format a date string into a readable format
 * @param dateString The ISO date string
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Truncate a string with ellipsis
 * @param str The string to truncate
 * @param length The maximum length
 */
export const truncateString = (str: string, length: number): string => {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
};

/**
 * Generate a random ID
 */
export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 9);
};
