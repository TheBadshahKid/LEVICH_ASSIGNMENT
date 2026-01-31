// Auction Item interface
export interface AuctionItem {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    startingPrice: number;
    currentBid: number;
    highestBidder: string | null;
    highestBidderName: string | null;
    endTime: number; // Unix timestamp in milliseconds
    bidCount: number;
}

// Bid request from client
export interface BidRequest {
    itemId: string;
    amount: number;
    userId: string;
    userName: string;
}

// Bid result
export interface BidResult {
    success: boolean;
    item?: AuctionItem;
    error?: string;
}

// Socket events
export enum SocketEvents {
    BID_PLACED = 'BID_PLACED',
    UPDATE_BID = 'UPDATE_BID',
    OUTBID = 'OUTBID',
    AUCTION_ENDED = 'AUCTION_ENDED',
    CONNECT = 'connection',
    DISCONNECT = 'disconnect'
}

// Server time response
export interface ServerTimeResponse {
    timestamp: number;
    serverTime: string;
}

// Items response
export interface ItemsResponse {
    items: AuctionItem[];
    serverTime: number;
}
