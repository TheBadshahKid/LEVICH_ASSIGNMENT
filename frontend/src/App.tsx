import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from './hooks/useSocket';
import { ItemCard } from './components/ItemCard';
import { User } from './types';
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

    const handleBid = useCallback((itemId: string, amount: number) => {
        placeBid(itemId, amount, user.id, user.name);
    }, [placeBid, user.id, user.name]);

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
                <p>© 2024 LiveBid. Real-time auction platform.</p>
            </footer>
        </div>
    );
}

export default App;
