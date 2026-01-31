# 🎯 LiveBid - Real-Time Auction Platform

A real-time auction platform where users compete to buy items in the final seconds. Built with Node.js, Socket.io, React, and TypeScript.

## 🔗 Live Demo

**🌐 Frontend**: [https://levich-assignment-three.vercel.app](https://levich-assignment-three.vercel.app)

**⚙️ Backend API**: [https://livebid-backend.onrender.com](https://livebid-backend.onrender.com)

---

![Live Bidding Platform](https://img.shields.io/badge/Status-Live-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?logo=socket.io)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

## ✨ Features

### Backend (Node.js + Socket.io)
- **REST API**: `GET /items` returns all auction items with current state
- **Real-Time Events**: 
  - `BID_PLACED` - Client sends a bid
  - `UPDATE_BID` - Server broadcasts new highest bid to all clients
  - `OUTBID` - Server notifies client when their bid fails
- **Race Condition Handling**: Using `async-mutex` for atomic bid operations - when two users bid at the exact same millisecond, only the first succeeds

### Frontend (React + TypeScript)
- **Live Dashboard**: Grid of auction items with real-time updates
- **Server-Synced Timer**: Countdown synchronized with server time (tamper-proof)
- **Visual Feedback**:
  - 🟢 Green flash animation on new bids
  - 🏆 "Winning" badge when you're the highest bidder
  - 🔴 "Outbid" alert when someone outbids you
- **Responsive Design**: Works on desktop, tablet, and mobile

### Infrastructure
- **Docker Ready**: Full Docker Compose setup for easy deployment
- **Production Optimized**: Multi-stage builds, nginx for frontend

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional)

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/TheBadshahKid/LEVICH_ASSIGNMENT.git
cd LEVICH_ASSIGNMENT
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Start Backend Server**
```bash
npm run dev
```
Server runs at `http://localhost:3001`

4. **Install Frontend Dependencies** (new terminal)
```bash
cd frontend
npm install
```

5. **Start Frontend Dev Server**
```bash
npm run dev
```
Frontend runs at `http://localhost:5173`

### Docker Deployment

```bash
# Build and run both services
docker-compose up --build

# Access the app
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001/items
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   React App     │──│  Socket.io      │──│  Synced     │ │
│  │   Dashboard     │  │  Client         │  │  Timer      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Express       │──│  Socket.io      │──│  Mutex      │ │
│  │   REST API      │  │  Server         │  │  Lock       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                   │         │
│                              ┌────────────────────┘         │
│                              ▼                              │
│                    ┌─────────────────┐                      │
│                    │  In-Memory      │                      │
│                    │  Store          │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔒 Race Condition Handling

The platform uses `async-mutex` to ensure atomic bid operations:

```typescript
const bidMutex = new Mutex();

async function placeBid(request: BidRequest): Promise<BidResult> {
  const release = await bidMutex.acquire();
  try {
    // Only one bid processed at a time
    if (request.amount <= item.currentBid) {
      throw new Error('OUTBID');
    }
    // Process bid...
  } finally {
    release(); // Always release the lock
  }
}
```

When two users bid simultaneously:
1. First request acquires the mutex lock
2. Second request waits
3. First bid is processed and succeeds
4. Lock is released
5. Second request acquires lock, sees higher bid, receives "OUTBID" error

## ⏱️ Server Time Synchronization

The countdown timer is synced with server time to prevent client manipulation:

```typescript
// Client calculates offset from server time
const serverTime = await fetch('/time').then(r => r.json());
const offset = serverTime.timestamp - Date.now();

// Use offset for accurate countdown
const remainingTime = endTime - (Date.now() + offset);
```

## 📁 Project Structure

```
LEVICH_ASSIGNMENT/
├── backend/
│   ├── src/
│   │   ├── server.ts      # Express + Socket.io server
│   │   ├── store.ts       # Data store with mutex
│   │   └── types.ts       # TypeScript interfaces
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ItemCard.tsx
│   │   │   └── CountdownTimer.tsx
│   │   ├── hooks/
│   │   │   ├── useSocket.ts
│   │   │   └── useCountdown.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🧪 Testing

### Manual Testing
1. Open the app in two browser tabs/windows
2. Bid on an item in one tab
3. Verify the other tab shows the updated price with a green flash
4. Try bidding the same amount in both tabs simultaneously - only one should succeed

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/items` | Get all auction items |
| GET | `/time` | Get server timestamp |
| GET | `/health` | Health check |
| POST | `/reset` | Reset all items (testing) |

### Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `BID_PLACED` | Client → Server | Place a bid |
| `UPDATE_BID` | Server → All Clients | Broadcast new highest bid |
| `OUTBID` | Server → Client | Bid failed notification |
| `INIT_ITEMS` | Server → Client | Initial items on connect |

## 🎨 Design Features

- **Dark Theme**: Modern dark UI with purple accents
- **Glassmorphism**: Subtle blur effects and transparency
- **Micro-animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach

## 📦 Tech Stack

- **Backend**: Node.js, Express, Socket.io, TypeScript, async-mutex
- **Frontend**: React 18, Vite, TypeScript, Socket.io-client
- **Styling**: Vanilla CSS with CSS Variables
- **Infrastructure**: Docker, Docker Compose, Nginx

## 🚢 Deployment

### Render (Backend)
1. Create a new Web Service
2. Connect your GitHub repo
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variable: `FRONTEND_URL=your-vercel-url`

### Vercel (Frontend)
1. Import your GitHub repo
2. Set root directory to `frontend`
3. Add environment variable: `VITE_SOCKET_URL=your-render-url`

## 📄 License

MIT License - feel free to use this project for learning and development.

---

Built with ❤️ for LEVICH Assignment
