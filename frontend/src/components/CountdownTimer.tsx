import { useCountdown } from '../hooks/useCountdown';

interface CountdownTimerProps {
    endTime: number;
    serverTimeOffset: number;
}

export function CountdownTimer({ endTime, serverTimeOffset }: CountdownTimerProps) {
    const { formatted, isExpired, timeLeft } = useCountdown(endTime, serverTimeOffset);

    // Calculate urgency level for styling
    const isUrgent = timeLeft.total < 60000; // Less than 1 minute
    const isCritical = timeLeft.total < 30000; // Less than 30 seconds

    return (
        <div className={`countdown-timer ${isExpired ? 'expired' : ''} ${isCritical ? 'critical' : isUrgent ? 'urgent' : ''}`}>
            {isExpired ? (
                <span className="expired-text">ENDED</span>
            ) : (
                <>
                    <svg className="timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="time-display">{formatted}</span>
                </>
            )}
        </div>
    );
}
