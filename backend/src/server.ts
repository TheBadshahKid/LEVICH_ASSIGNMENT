import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { getAllItems, placeBid, resetItems, checkAndResetExpiredItems } from './store';
import { BidRequest, SocketEvents, ServerTimeResponse, ItemsResponse } from './types';

const app = express();
const httpServer = createServer(app);

// Configure CORS for both REST and WebSocket
const corsOptions = {
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io server with CORS
const io = new Server(httpServer, {
    cors: corsOptions,
    pingTimeout: 60000,
    pingInterval: 25000
});

// ============================================
// REST API ENDPOINTS
// ============================================

/**
 * GET /items
 * Returns all auction items with current state and server time
 */
app.get('/items', (_req: Request, res: Response) => {
    const response: ItemsResponse = {
        items: getAllItems(),
        serverTime: Date.now()
    };
    res.json(response);
});

/**
 * GET /time
 * Returns server timestamp for client time synchronization
 * This prevents clients from manipulating the countdown timer
 */
app.get('/time', (_req: Request, res: Response) => {
    const response: ServerTimeResponse = {
        timestamp: Date.now(),
        serverTime: new Date().toISOString()
    };
    res.json(response);
});

/**
 * POST /reset
 * Resets all items (for testing purposes)
 */
app.post('/reset', (_req: Request, res: Response) => {
    resetItems();
    res.json({ success: true, message: 'Items reset successfully' });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// ============================================
// SOCKET.IO REAL-TIME EVENTS
// ============================================

io.on(SocketEvents.CONNECT, (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Send current items on connection
    socket.emit('INIT_ITEMS', {
        items: getAllItems(),
        serverTime: Date.now()
    });

    /**
     * BID_PLACED event handler
     * Validates bid and handles race conditions using mutex
     */
    socket.on(SocketEvents.BID_PLACED, async (data: BidRequest) => {
        console.log(`📥 Bid received from ${data.userName}: $${data.amount} on item ${data.itemId}`);

        try {
            const result = await placeBid(data);

            if (result.success && result.item) {
                // Broadcast the updated item to ALL connected clients
                io.emit(SocketEvents.UPDATE_BID, {
                    item: result.item,
                    bidderId: data.userId,
                    bidderName: data.userName,
                    serverTime: Date.now()
                });

                console.log(`✅ Bid successful: ${data.userName} is now winning "${result.item.title}"`);
            } else {
                // Send error only to the bidder
                socket.emit(SocketEvents.OUTBID, {
                    itemId: data.itemId,
                    error: result.error,
                    currentBid: getAllItems().find(i => i.id === data.itemId)?.currentBid,
                    serverTime: Date.now()
                });

                console.log(`❌ Bid failed for ${data.userName}: ${result.error}`);
            }
        } catch (error) {
            console.error('Error processing bid:', error);
            socket.emit(SocketEvents.OUTBID, {
                itemId: data.itemId,
                error: 'Server error processing bid',
                serverTime: Date.now()
            });
        }
    });

    socket.on(SocketEvents.DISCONNECT, () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// ============================================
// AUTO-RESTART LOOP
// ============================================

// Check for expired auctions every 5 seconds
setInterval(() => {
    const resetItemsList = checkAndResetExpiredItems();

    if (resetItemsList.length > 0) {
        console.log(`📢 Broadcasting ${resetItemsList.length} restarted auctions`);

        // Broadcast the full updated list to ensure everyone is in sync
        io.emit('INIT_ITEMS', {
            items: getAllItems(),
            serverTime: Date.now()
        });
    }
}, 5000);

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎯 LIVE BIDDING PLATFORM - SERVER                      ║
║                                                           ║
║   REST API:    http://localhost:${PORT}/items               ║
║   WebSocket:   ws://localhost:${PORT}                       ║
║   Health:      http://localhost:${PORT}/health              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export { app, io, httpServer };
