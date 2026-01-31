import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from './hooks/useSocket';
import { useToast, showToast } from './hooks/useToast';
import { ItemCard } from './components/ItemCard';
import { ToastContainer } from './components/ToastContainer';
import { ActivityFeed } from './components/ActivityFeed';
import { StatsDashboard } from './components/StatsDashboard';
import { User } from './types';
import { SoundManager } from './utils/soundManager';
import { triggerWinConfetti } from './utils/confetti';
import './index.css';

function App() {
    const [user] = useState<User>(() => {
        // Generate or retrieve user from localStorage
        const stored = localStorage.getItem('bidding_user');
        if (stored) {
            return JSON.parse(stored);
        }
        const newUser: User = {
            id: uuidv4(),
            name: `Bidder_${Math.random().toString(36).substring(2, 7).toUpperCase()}`
        };
        localStorage.setItem('bidding_user', JSON.stringify(newUser));
        return newUser;
    });

    const {
        isConnected,
        items,
        serverTimeOffset,
        lastBidUpdate,
        lastOutbid,
        placeBid,
        clearOutbid
    } = useSocket();

    const { toasts, removeToast } = useToast();
    const [soundManager] = useState(() => SoundManager.getInstance());
    const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());
    const [activityFeedOpen, setActivityFeedOpen] = useState(false);
    const [statsOpen, setStatsOpen] = useState(false);
    const [previousWinningCount, setPreviousWinningCount] = useState(0);

    const handleBid = useCallback((itemId: string, amount: number) => {
        placeBid(itemId, amount, user.id, user.name);
        soundManager.playBidPlaced();
        showToast('Bid placed!', 'info', 2000);
    }, [placeBid, user.id, user.name, soundManager]);

    // Handle bid updates
    useEffect(() => {
        if (lastBidUpdate) {
            const isMyBid = lastBidUpdate.bidderId === user.id;

            if (isMyBid) {
                showToast(`You're winning ${lastBidUpdate.item.title}!`, 'success');
                soundManager.playWin();
            } else {
                soundManager.playNewBid();
            }
        }
    }, [lastBidUpdate, user.id, soundManager]);

    // Handle outbid notifications
    useEffect(() => {
        if (lastOutbid) {
            soundManager.playOutbid();
            showToast(
                lastOutbid.error === 'OUTBID'
                    ? 'You were outbid! Bid higher to win.'
                    : lastOutbid.error === 'AUCTION_ENDED'
                        ? 'Auction has ended!'
                        : 'Bid failed',
                'error'
            );
        }
    }, [lastOutbid, soundManager]);

    // Check for new wins and trigger confetti
    useEffect(() => {
        const winningCount = items.filter(item => item.highestBidder === user.id).length;

        if (winningCount > previousWinningCount) {
            triggerWinConfetti();
        }

        setPreviousWinningCount(winningCount);
    }, [items, user.id, previousWinningCount]);

    // Sync server time periodically
    useEffect(() => {
        const syncTime = async () => {
            try {
                const response = await fetch('http://localhost:3001/time');
                const data = await response.json();
                console.log('⏰ Time synced with server');
            } catch (error) {
                console.error('Failed to sync time:', error);
            }
        };

        syncTime();
        const interval = setInterval(syncTime, 30000); // Sync every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // A key - Open activity feed
            if (e.key === 'a' || e.key === 'A') {
                setActivityFeedOpen(prev => !prev);
            }

            // S key - Open stats
            if (e.key === 's' || e.key === 'S') {
                setStatsOpen(prev => !prev);
            }

            // M key - Toggle sound
            if (e.key === 'm' || e.key === 'M') {
                const newState = soundManager.toggle();
                setSoundEnabled(newState);
                showToast(newState ? '🔊 Sound enabled' : '🔇 Sound muted', 'info', 1500);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [soundManager]);

    const toggleSound = () => {
        const newState = soundManager.toggle();
        setSoundEnabled(newState);
        showToast(newState ? '🔊 Sound enabled' : '🔇 Sound muted', 'info', 1500);
    };

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="logo-icon">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        <h1>LiveBid</h1>
                    </div>

                    <div className="header-info">
                        <button
                            className="header-button"
                            onClick={() => setActivityFeedOpen(true)}
                            title="Activity Feed (A)"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="header-button-text">Activity</span>
                            <kbd className="kbd">A</kbd>
                        </button>

                        <button
                            className="header-button"
                            onClick={() => setStatsOpen(true)}
                            title="Your Stats (S)"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="header-button-text">Stats</span>
                            <kbd className="kbd">S</kbd>
                        </button>

                        <button
                            className="header-button"
                            onClick={toggleSound}
                            title="Toggle Sound (M)"
                        >
                            {soundEnabled ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                    <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                    <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
                                </svg>
                            )}
                            <kbd className="kbd">M</kbd>
                        </button>

                        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                            <span className="status-dot"></span>
                            {isConnected ? 'Live' : 'Connecting...'}
                        </div>

                        <div className="user-info">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="user-icon">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            <span>{user.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main">
                <div className="container">
                    {/* Hero Section */}
                    <section className="hero">
                        <h2>Live Auctions</h2>
                        <p>Bid in real-time and win exclusive items before time runs out!</p>
                        <div className="hero-shortcuts">
                            <span className="shortcut-hint">
                                <kbd>A</kbd> Activity
                            </span>
                            <span className="shortcut-hint">
                                <kbd>S</kbd> Stats
                            </span>
                            <span className="shortcut-hint">
                                <kbd>M</kbd> Sound
                            </span>
                        </div>
                    </section>

                    {/* Items Grid */}
                    {items.length === 0 ? (
                        <div className="loading-state">
                            <div className="loading-spinner large"></div>
                            <p>Loading auctions...</p>
                        </div>
                    ) : (
                        <div className="items-grid">
                            {items.map(item => (
                                <ItemCard
                                    key={item.id}
                                    item={item}
                                    userId={user.id}
                                    serverTimeOffset={serverTimeOffset}
                                    onBid={handleBid}
                                    lastBidUpdate={lastBidUpdate}
                                    lastOutbid={lastOutbid}
                                    onClearOutbid={clearOutbid}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <p>© 2024 LiveBid. Real-time auction platform with advanced features.</p>
            </footer>

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* Activity Feed */}
            <ActivityFeed
                lastBidUpdate={lastBidUpdate}
                isOpen={activityFeedOpen}
                onClose={() => setActivityFeedOpen(false)}
            />

            {/* Stats Dashboard */}
            <StatsDashboard
                items={items}
                userId={user.id}
                isOpen={statsOpen}
                onClose={() => setStatsOpen(false)}
            />
        </div>
    );
}

export default App;
