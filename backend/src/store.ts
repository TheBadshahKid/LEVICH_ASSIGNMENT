import { Mutex } from 'async-mutex';
import { v4 as uuidv4 } from 'uuid';
import { AuctionItem, BidRequest, BidResult } from './types';

// Mutex for handling race conditions
const bidMutex = new Mutex();

// In-memory store for auction items
const items: Map<string, AuctionItem> = new Map();

// Initialize with sample auction items
function initializeItems(): void {
    const now = Date.now();

    const sampleItems: Omit<AuctionItem, 'id'>[] = [
        {
            title: 'Vintage Rolex Submariner',
            description: 'Classic 1960s Rolex Submariner in excellent condition',
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
            startingPrice: 5000,
            currentBid: 5000,
            highestBidder: null,
            highestBidderName: null,
            endTime: now + 5 * 60 * 1000, // 5 minutes from now
            bidCount: 0
        },
        {
            title: 'MacBook Pro M3 Max',
            description: 'Brand new 16-inch MacBook Pro with M3 Max chip',
            imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
            startingPrice: 2500,
            currentBid: 2500,
            highestBidder: null,
            highestBidderName: null,
            endTime: now + 3 * 60 * 1000, // 3 minutes from now
            bidCount: 0
        },
        {
            title: 'Signed Michael Jordan Jersey',
            description: 'Authentic Chicago Bulls jersey signed by MJ himself',
            imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
            startingPrice: 1500,
            currentBid: 1500,
            highestBidder: null,
            highestBidderName: null,
            endTime: now + 7 * 60 * 1000, // 7 minutes from now
            bidCount: 0
        },
        {
            title: 'Tesla Model S Plaid',
            description: '2024 Tesla Model S Plaid with Full Self-Driving',
            imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400',
            startingPrice: 80000,
            currentBid: 80000,
            highestBidder: null,
            highestBidderName: null,
            endTime: now + 10 * 60 * 1000, // 10 minutes from now
            bidCount: 0
        },
        {
            title: 'Rare Pokemon Card Collection',
            description: 'First edition Charizard and complete base set',
            imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400',
            startingPrice: 25000,
            currentBid: 25000,
            highestBidder: null,
            highestBidderName: null,
            endTime: now + 4 * 60 * 1000, // 4 minutes from now
            bidCount: 0
        },
        {
            title: 'Hermès Birkin Bag',
            description: 'Classic black Hermès Birkin 35 in pristine condition',
            imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
            startingPrice: 15000,
            currentBid: 15000,
            highestBidder: null,
            highestBidderName: null,
            endTime: now + 6 * 60 * 1000, // 6 minutes from now
            bidCount: 0
        }
    ];

    sampleItems.forEach(item => {
        const id = uuidv4();
        items.set(id, { ...item, id });
    });

    console.log(`✅ Initialized ${items.size} auction items`);
}

// Get all items
export function getAllItems(): AuctionItem[] {
    return Array.from(items.values());
}

// Get single item
export function getItem(id: string): AuctionItem | undefined {
    return items.get(id);
}

/**
 * Place a bid with mutex lock to handle race conditions
 * This ensures atomic operations - only one bid is processed at a time
 */
export async function placeBid(request: BidRequest): Promise<BidResult> {
    // Acquire mutex lock - this is the key to handling race conditions
    const release = await bidMutex.acquire();

    try {
        const item = items.get(request.itemId);

        if (!item) {
            return { success: false, error: 'Item not found' };
        }

        // Check if auction has ended
        if (Date.now() > item.endTime) {
            return { success: false, error: 'AUCTION_ENDED' };
        }

        // Check if bid is higher than current bid
        if (request.amount <= item.currentBid) {
            return {
                success: false,
                error: 'OUTBID',
            };
        }

        // Update the item with the new bid
        item.currentBid = request.amount;
        item.highestBidder = request.userId;
        item.highestBidderName = request.userName;
        item.bidCount += 1;

        // Save back to store
        items.set(request.itemId, item);

        console.log(`💰 Bid placed: $${request.amount} on "${item.title}" by ${request.userName}`);

        return { success: true, item };

    } finally {
        // Always release the mutex
        release();
    }
}

// Reset items (useful for testing)
export function resetItems(): void {
    items.clear();
    initializeItems();
}

// Initialize on module load
initializeItems();
