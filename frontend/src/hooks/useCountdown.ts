import { useState, useEffect, useCallback } from 'react';

interface UseCountdownReturn {
    timeLeft: {
        hours: number;
        minutes: number;
        seconds: number;
        total: number;
    };
    isExpired: boolean;
    formatted: string;
}

/**
 * Server-synced countdown timer hook
 * Uses serverTimeOffset to ensure countdown matches server time
 */
export function useCountdown(endTime: number, serverTimeOffset: number): UseCountdownReturn {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
    });

    const calculateTimeLeft = useCallback(() => {
        // Use server-synced time to prevent client manipulation
        const serverNow = Date.now() + serverTimeOffset;
        const difference = endTime - serverNow;

        if (difference <= 0) {
            return { hours: 0, minutes: 0, seconds: 0, total: 0 };
        }

        return {
            hours: Math.floor(difference / (1000 * 60 * 60)),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            total: difference
        };
    }, [endTime, serverTimeOffset]);

    useEffect(() => {
        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        // Update every second
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (newTimeLeft.total <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    const isExpired = timeLeft.total <= 0;

    // Format time as HH:MM:SS or MM:SS
    const formatted = timeLeft.hours > 0
        ? `${timeLeft.hours.toString().padStart(2, '0')}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`
        : `${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`;

    return { timeLeft, isExpired, formatted };
}
