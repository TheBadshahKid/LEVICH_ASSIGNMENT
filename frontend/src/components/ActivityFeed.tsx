import { useEffect, useState } from 'react';
import { BidUpdate } from '../types';

interface Activity {
    id: string;
    type: 'bid' | 'win';
    itemTitle: string;
    bidderName: string;
    amount: number;
    timestamp: number;
}

interface ActivityFeedProps {
    lastBidUpdate: BidUpdate | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ActivityFeed({ lastBidUpdate, isOpen, onClose }: ActivityFeedProps) {
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        if (lastBidUpdate) {
            const activity: Activity = {
                id: `${lastBidUpdate.item.id}-${Date.now()}`,
                type: 'bid',
                itemTitle: lastBidUpdate.item.title,
                bidderName: lastBidUpdate.bidderName,
                amount: lastBidUpdate.item.currentBid,
                timestamp: lastBidUpdate.serverTime
            };

            setActivities(prev => [activity, ...prev].slice(0, 50)); // Keep last 50
        }
    }, [lastBidUpdate]);

    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);

        if (seconds < 5) return 'Just now';
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (!isOpen) return null;

    return (
        <div className="activity-feed-overlay" onClick={onClose}>
            <div className="activity-feed" onClick={(e) => e.stopPropagation()}>
                <div className="activity-feed-header">
                    <h3>Live Activity</h3>
                    <button className="activity-feed-close" onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="activity-feed-content">
                    {activities.length === 0 ? (
                        <div className="activity-feed-empty">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <p>No activity yet</p>
                            <p className="sub">Start bidding to see live updates!</p>
                        </div>
                    ) : (
                        <div className="activity-list">
                            {activities.map((activity) => (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-icon">
                                        {activity.type === 'bid' ? '💰' : '🏆'}
                                    </div>
                                    <div className="activity-details">
                                        <div className="activity-main">
                                            <span className="activity-bidder">{activity.bidderName}</span>
                                            <span className="activity-action">
                                                {activity.type === 'bid' ? 'bid' : 'won'}
                                            </span>
                                            <span className="activity-amount">{formatCurrency(activity.amount)}</span>
                                        </div>
                                        <div className="activity-sub">
                                            <span className="activity-item-title">{activity.itemTitle}</span>
                                            <span className="activity-time">{formatTime(activity.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
