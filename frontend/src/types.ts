// Auction Item interface (matches backend)
export interface AuctionItem {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    startingPrice: number;
    currentBid: number;
    highestBidder: string | null;
    highestBidderName: string | null;
    endTime: number;
    duration: number;
    bidCount: number;
}

// User info
export interface User {
    id: string;
    name: string;
}

// Bid update from server
export interface BidUpdate {
    item: AuctionItem;
    bidderId: string;
    bidderName: string;
    serverTime: number;
}

// Outbid notification
export interface OutbidNotification {
    itemId: string;
    error: string;
    currentBid?: number;
    serverTime: number;
}

// Items response from API
export interface ItemsResponse {
    items: AuctionItem[];
    serverTime: number;
}
