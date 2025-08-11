# Bob's Corn Rate Limiter Challenge

This project implements a rate limiter for Bob's Corn business. It includes a backend server that limits clients to purchasing 1 corn per minute and a frontend with both React and Backbone.js components.

## Project Structure

- `/server` - Express.js backend with SQLite database
- `/client` - Frontend with React and Backbone.js using Tailwind CSS

## Features

- SQLite database-based rate limiter (no installation required)
- Dual frontend implementation (React and Backbone.js)
- Clean, responsive interface
- Visual feedback for successful purchases
- Countdown timer for rate-limited requests
- Purchase history tracking

## Technology Stack

### Backend
- Node.js
- Express.js
- SQLite (via sqlite3)
- Cors for cross-origin support
- Dotenv for configuration

### Frontend
- React for main application
- Backbone.js for purchase component
- jQuery and Underscore.js (for Backbone)
- Tailwind CSS for styling
- Axios for API requests

## Installation

### Prerequisites
- Node.js (v14 or later)

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

## API Endpoints

- `POST /api/buy-corn` - Purchase corn (requires `clientId` in request body)
- `GET /api/purchases/:clientId` - Get purchase history for a client
- `GET /api/health` - Health check endpoint

## Usage

1. Enter a client ID in the input field
2. Use either the React or Backbone.js component to buy corn
3. If you try to make another purchase within 1 minute, you'll receive a rate limit error
4. The countdown timer will show when you can make another purchase
5. Your purchase history is displayed for both components

## Implementation Details

### Rate Limiter Logic
The rate limiter works by recording each purchase with a timestamp in a SQLite database. When a client attempts to make a purchase, the server checks if there are any records for that client within the last minute. If there are, the request is rejected with a 429 status code.

### Backbone.js Integration
The project demonstrates how to integrate Backbone.js with modern React applications:
- `CornPurchase` model handles the business logic
- `PurchaseView` renders the UI and handles user interactions
- Both are initialized and managed within the React application

### Database Schema
- `rate_limiter` table: Tracks client purchase timestamps for rate limiting
- `corn_purchases` table: Records all successful purchases for history

## Future Improvements
- Add authentication/authorization
- Implement more sophisticated rate limiting strategies
- Add admin dashboard for monitoring