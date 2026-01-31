import { AuctionItem } from '../types';

interface StatsData {
    totalBids: number;
    totalSpent: number;
    itemsWinning: number;
    averageBid: number;
}

interface StatsDashboardProps {
    items: AuctionItem[];
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function StatsDashboard({ items, userId, isOpen, onClose }: StatsDashboardProps) {
    const calculateStats = (): StatsData => {
        let totalBids = 0;
        let totalSpent = 0;
        let itemsWinning = 0;

        items.forEach(item => {
            if (item.highestBidder === userId) {
                totalBids += item.bidCount;
                totalSpent += item.currentBid;
                itemsWinning += 1;
            }
        });

        return {
            totalBids,
            totalSpent,
            itemsWinning,
            averageBid: totalBids > 0 ? totalSpent / totalBids : 0
        };
    };

    const stats = calculateStats();

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
        <div className="stats-overlay" onClick={onClose}>
            <div className="stats-dashboard" onClick={(e) => e.stopPropagation()}>
                <div className="stats-header">
                    <h3>📊 Your Stats</h3>
                    <button className="stats-close" onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-value">{stats.itemsWinning}</div>
                        <div className="stat-label">Items Winning</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-value">{formatCurrency(stats.totalSpent)}</div>
                        <div className="stat-label">Total Committed</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🔨</div>
                        <div className="stat-value">{stats.totalBids}</div>
                        <div className="stat-label">Total Bids</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-value">{formatCurrency(stats.averageBid)}</div>
                        <div className="stat-label">Average Bid</div>
                    </div>
                </div>

                {stats.itemsWinning > 0 && (
                    <div className="winning-items">
                        <h4>Currently Winning</h4>
                        <div className="winning-list">
                            {items
                                .filter(item => item.highestBidder === userId)
                                .map(item => (
                                    <div key={item.id} className="winning-item">
                                        <span className="winning-item-title">{item.title}</span>
                                        <span className="winning-item-price">{formatCurrency(item.currentBid)}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {stats.itemsWinning === 0 && (
                    <div className="no-wins">
                        <p>🎯 Start bidding to build your stats!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
