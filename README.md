# Bob's Corn Rate Limiter Challenge

This project implements a rate limiter for Bob's Corn business. It includes a server that limits clients to purchasing 1 corn per minute and a frontend web interface for clients to purchase corn.

## Overview

The solution uses a simplified approach with an Express server that handles both the API for rate limiting and serving the user interface. The rate limiter is implemented using SQLite, which stores purchases with timestamps to check against requests.

## Features

- SQLite-based rate limiter (1 corn per client per minute)
- Clean, responsive user interface with TailwindCSS
- Visual feedback for successful purchases
- Countdown timer for rate-limited requests
- Purchase history tracking

## Technology Stack

- **Backend**:
  - Node.js
  - Express.js
  - SQLite (via sqlite3)
  - CORS for cross-origin support

- **Frontend**:
  - HTML5
  - JavaScript (Vanilla)
  - TailwindCSS (via CDN)
  - CSS Animations

## Project Structure

```
bobs_corn/
├── server/
│   ├── data/                  # Directory for SQLite database
│   ├── public/                # Static files for frontend
│   │   └── index.html         # Main page with HTML, CSS, and JavaScript
│   ├── index.js               # Express server and rate limiting logic
│   └── package.json           # Project dependencies
└── README.md                  # Project documentation
```

## Installation and Running

### Prerequisites
- Node.js (v14 or higher)

### Installation
```bash
cd server
npm install
```

### Running
```bash
npm start
```

The server will run at `http://localhost:3001`. Open this URL in your browser to access the application.

## API Endpoints

- `POST /api/buy-corn`: Purchase corn (requires `clientId` in request body)
- `GET /api/purchases/:clientId`: Get purchase history for a client
- `GET /api/health`: Health check endpoint

## Rate Limiter Implementation

The rate limiter works by following these steps:

1. When a client attempts to purchase corn, the server checks the database to see if that client has made any purchases within the last minute.
2. If there are any recent purchases, the request is rejected with a 429 status code (Too Many Requests).
3. If there are no recent purchases, the purchase is processed and recorded in the database with the current timestamp.

## Future Improvements

- User authentication
- Admin dashboard
- More sophisticated rate-limiting strategies
- Automated testing

## Credits

Developed for BaseLabs coding challenge.