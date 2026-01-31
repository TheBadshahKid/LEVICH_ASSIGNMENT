import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuctionItem, BidUpdate, OutbidNotification } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

interface UseSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    items: AuctionItem[];
    serverTimeOffset: number;
    lastBidUpdate: BidUpdate | null;
    lastOutbid: OutbidNotification | null;
    placeBid: (itemId: string, amount: number, userId: string, userName: string) => void;
    clearOutbid: () => void;
}

export function useSocket(): UseSocketReturn {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [items, setItems] = useState<AuctionItem[]>([]);
    const [serverTimeOffset, setServerTimeOffset] = useState(0);
    const [lastBidUpdate, setLastBidUpdate] = useState<BidUpdate | null>(null);
    const [lastOutbid, setLastOutbid] = useState<OutbidNotification | null>(null);

    useEffect(() => {
        // Create socket connection
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('🔌 Connected to server');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Disconnected from server');
            setIsConnected(false);
        });

        // Initial items from server
        socket.on('INIT_ITEMS', (data: { items: AuctionItem[]; serverTime: number }) => {
            console.log('📦 Received initial items:', data.items.length);
            setItems(data.items);
            // Calculate time offset for synced countdown
            setServerTimeOffset(data.serverTime - Date.now());
        });

        // Real-time bid updates
        socket.on('UPDATE_BID', (update: BidUpdate) => {
            console.log('💰 Bid update received:', update);
            setLastBidUpdate(update);
            setServerTimeOffset(update.serverTime - Date.now());

            // Update the item in our local state
            setItems(prevItems =>
                prevItems.map(item =>
                    item.id === update.item.id ? update.item : item
                )
            );
        });

        // Outbid notification
        socket.on('OUTBID', (notification: OutbidNotification) => {
            console.log('❌ Outbid notification:', notification);
            setLastOutbid(notification);
            setServerTimeOffset(notification.serverTime - Date.now());
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const placeBid = useCallback((itemId: string, amount: number, userId: string, userName: string) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('BID_PLACED', {
                itemId,
                amount,
                userId,
                userName
            });
        }
    }, []);

    const clearOutbid = useCallback(() => {
        setLastOutbid(null);
    }, []);

    return {
        socket: socketRef.current,
        isConnected,
        items,
        serverTimeOffset,
        lastBidUpdate,
        lastOutbid,
        placeBid,
        clearOutbid
    };
}
