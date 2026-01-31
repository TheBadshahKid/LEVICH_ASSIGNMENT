import { useState, useEffect, useCallback } from 'react';
import { AuctionItem, BidUpdate, OutbidNotification } from '../types';
import { CountdownTimer } from './CountdownTimer';

interface ItemCardProps {
    item: AuctionItem;
    userId: string;
    serverTimeOffset: number;
    onBid: (itemId: string, amount: number) => void;
    lastBidUpdate: BidUpdate | null;
    lastOutbid: OutbidNotification | null;
    onClearOutbid: () => void;
}

export function ItemCard({
    item,
    userId,
    serverTimeOffset,
    onBid,
    lastBidUpdate,
    lastOutbid,
    onClearOutbid
}: ItemCardProps) {
    const [isFlashing, setIsFlashing] = useState(false);
    const [showOutbidAlert, setShowOutbidAlert] = useState(false);
    const [isBidding, setIsBidding] = useState(false);

    const isWinning = item.highestBidder === userId;
    const isExpired = Date.now() + serverTimeOffset > item.endTime;
    const bidIncrement = 10;
    const nextBid = item.currentBid + bidIncrement;

    // Flash animation when bid updates
    useEffect(() => {
        if (lastBidUpdate && lastBidUpdate.item.id === item.id) {
            setIsFlashing(true);
            setIsBidding(false);
            const timer = setTimeout(() => setIsFlashing(false), 600);
            return () => clearTimeout(timer);
        }
    }, [lastBidUpdate, item.id]);

    // Show outbid alert
    useEffect(() => {
        if (lastOutbid && lastOutbid.itemId === item.id) {
            setShowOutbidAlert(true);
            setIsBidding(false);
            const timer = setTimeout(() => {
                setShowOutbidAlert(false);
                onClearOutbid();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [lastOutbid, item.id, onClearOutbid]);

    const handleBid = useCallback(() => {
        if (!isExpired && !isBidding) {
            setIsBidding(true);
            onBid(item.id, nextBid);
        }
    }, [item.id, nextBid, isExpired, isBidding, onBid]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className={`item-card ${isFlashing ? 'flash' : ''} ${isWinning ? 'winning' : ''} ${isExpired ? 'expired' : ''}`}>
            {/* Image */}
            <div className="item-image-container">
                <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="item-image"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Auction+Item';
                    }}
                />

                {/* Status Badge */}
                {isWinning && !isExpired && (
                    <div className="status-badge winning-badge">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        WINNING
                    </div>
                )}

                {isExpired && (
                    <div className="status-badge ended-badge">
                        AUCTION ENDED
                    </div>
                )}

                {/* Outbid Alert */}
                {showOutbidAlert && (
                    <div className="outbid-alert">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        OUTBID! Bid higher to win
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="item-content">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-description">{item.description}</p>

                {/* Price Section */}
                <div className="price-section">
                    <div className="current-bid">
                        <span className="label">Current Bid</span>
                        <span className={`amount ${isFlashing ? 'pulse' : ''}`}>
                            {formatCurrency(item.currentBid)}
                        </span>
                    </div>

                    <div className="bid-info">
                        <span className="bid-count">{item.bidCount} bid{item.bidCount !== 1 ? 's' : ''}</span>
                        {item.highestBidderName && (
                            <span className="highest-bidder">
                                by {isWinning ? 'You' : item.highestBidderName}
                            </span>
                        )}
                    </div>
                </div>

                {/* Timer */}
                <div className="timer-section">
                    <CountdownTimer endTime={item.endTime} serverTimeOffset={serverTimeOffset} />
                </div>

                {/* Bid Button */}
                <button
                    className={`bid-button ${isBidding ? 'loading' : ''} ${isExpired ? 'disabled' : ''}`}
                    onClick={handleBid}
                    disabled={isExpired || isBidding}
                >
                    {isBidding ? (
                        <span className="loading-spinner"></span>
                    ) : isExpired ? (
                        'Auction Ended'
                    ) : (
                        <>
                            <span className="bid-text">Bid</span>
                            <span className="bid-amount">+${bidIncrement}</span>
                            <span className="next-price">({formatCurrency(nextBid)})</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
