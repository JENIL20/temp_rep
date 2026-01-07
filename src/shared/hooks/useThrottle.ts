import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to throttle a value.
 * @param value The value to throttle
 * @param limit The time limit in milliseconds
 * @returns The throttled value
 */
export const useThrottle = <T>(value: T, limit: number): T => {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const lastRan = useRef(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= limit) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, limit - (Date.now() - lastRan.current));

        return () => {
            clearTimeout(handler);
        };
    }, [value, limit]);

    return throttledValue;
};
