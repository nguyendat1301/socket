<div align="center">

# Socket2 - Real-Time Sports Commentary API

*A high-performance REST and WebSocket API for real-time sports match updates and live commentary.*

[![Node.js](https://img.shields.io/badge/Node.js->=18-3c873a?style=flat-square&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express)](https://expressjs.com)
[![WebSocket](https://img.shields.io/badge/WebSocket-ws-blue?style=flat-square)](https://github.com/websockets/ws)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-c5f74f?style=flat-square)](https://orm.drizzle.team)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org)

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [API Reference](#api-reference) • [WebSocket Protocol](#websocket-protocol)

</div>

---

**Socket2** provides a robust backend infrastructure for publishing, managing, and subscribing to live sports match updates and real-time commentary feeds. It combines Express 5 for RESTful API routes, Drizzle ORM with PostgreSQL for database persistence, and WebSockets for real-time client notifications.

## Features

- ⚽ **Match Management** - Create and query sports matches with automatic status calculation (`scheduled`, `live`, `finished`).
- 🎙️ **Live Commentary Stream** - Publish detailed commentary entries including match minute, period, event types, actors, and tags.
- ⚡ **Real-Time WebSockets** - Instant notification broadcasts when new matches are added or commentary events occur.
- 🎯 **Targeted Subscriptions** - WebSocket clients can subscribe/unsubscribe to specific match channels to receive relevant updates.
- 🛡️ **Type-Safe Validation** - Rigorous input validation using Zod for query parameters, request payloads, and ISO timestamp constraints.

> [!NOTE]
> Match status (`scheduled`, `live`, `finished`) is automatically derived upon creation by evaluating start and end timestamps against the current time.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Web Framework**: Express v5
- **Real-Time Messaging**: WebSockets (`ws`)
- **Database & ORM**: PostgreSQL & Drizzle ORM
- **Schema Validation**: Zod
- **Database Utilities**: Drizzle Kit

## Getting Started

### Prerequisites

- **Node.js**: Version 18.x or higher
- **PostgreSQL**: Version 14 or higher instance

### Installation

1. **Install project dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create or verify the `.env` file in the project root directory:
   ```env
   DATABASE_URL="postgresql://postgres:123456@localhost:5432/sportz"
   PORT=8000
   HOST=0.0.0.0
   ```

3. **Apply Database Schema:**
   Push the schema defined in `src/db/schema.js` to your PostgreSQL database:
   ```bash
   npm run db:push
   ```

4. **Start the Application:**
   - **Development (with hot reloading):**
     ```bash
     npm run dev
     ```
   - **Production:**
     ```bash
     npm start
     ```

> [!TIP]
> Default server configuration exposes HTTP endpoints at `http://localhost:8000` and WebSockets at `ws://localhost:8000/ws`.

## API Reference

### Root Check
- `GET /` — Returns status welcome message.

### Matches

#### `GET /matches`
Retrieve recent matches ordered by creation date descending.

- **Query Parameters:**
  - `limit` *(optional, integer, default 50, max 10)*

#### `POST /matches`
Create a new sports match and broadcast a `match_create` WebSocket event to connected clients.

- **Request Body:**
  ```json
  {
    "sport": "Football",
    "homeTeam": "Arsenal",
    "awayTeam": "Chelsea",
    "startTime": "2026-08-17T20:00:00Z",
    "endTime": "2026-08-17T22:00:00Z",
    "homeScore": 0,
    "awayScore": 0
  }
  ```

### Commentary

#### `GET /matches/:id/commentory`
Fetch commentary records for a specific match ID, ordered by creation time descending.

- **Query Parameters:**
  - `limit` *(optional, integer, default 100, max 100)*

#### `POST /matches/:id/commentory`
Add a commentary entry for a match and send a real-time `commentary` update to subscribed WebSocket clients.

- **Request Body:**
  ```json
  {
    "minute": 45,
    "sequence": 1,
    "period": "1st Half",
    "eventType": "GOAL",
    "actor": "Player Name",
    "team": "Arsenal",
    "message": "Header into the top corner!",
    "tags": ["goal", "highlight"]
  }
  ```

## WebSocket Protocol

Connect to the WebSocket server at `ws://<HOST>:<PORT>/ws`.

### Server Connection Confirmation
Upon successful connection:
```json
{ "type": "connected" }
```

### Client Commands

#### Subscribe to a Match
Receive live commentary events for a specific match:
```json
{
  "type": "subscribe",
  "matchId": 1
}
```
*Response:* `{ "type": "subscribed", "matchId": 1 }`

#### Unsubscribe from a Match
```json
{
  "type": "unsubscribe",
  "matchId": 1
}
```
*Response:* `{ "type": "unsubscribed", "matchId": 1 }`

### Incoming Broadcast Events

#### New Match Created (`match_create`)
Sent to **all** connected clients when a new match is registered.
```json
{
  "type": "match_create",
  "data": { ...matchRecord }
}
```

#### New Commentary Published (`commentary`)
Sent to clients **subscribed** to the corresponding `matchId`.
```json
{
  "type": "commentary",
  "data": { ...commentaryRecord }
}
```

> [!IMPORTANT]
> Always send subscription cleanups or disconnect sockets gracefully to release memory resources on the WebSocket server.
