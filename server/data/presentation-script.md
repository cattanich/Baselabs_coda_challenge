# Bob's Corn Rate Limiter - Video Presentation Script

## Introduction (30 seconds)
Hello! Today I'll be presenting my solution for the Bob's Corn rate limiter challenge. This project implements a system that ensures clients can only purchase one corn per minute, with a backend rate limiter and a dual-framework frontend using both React and Backbone.js.

## Project Overview (30 seconds)
The solution consists of:
1. A Node.js/Express backend with SQLite that enforces the rate limit
2. A React frontend providing the main interface
3. A Backbone.js component demonstrating framework integration

I'll walk through each component, explain my implementation decisions, and demonstrate how the system works.

## Backend Architecture (45 seconds)
For the backend, I chose Express.js with SQLite because:

- Express provides a lightweight framework for building APIs
- SQLite offers persistent storage without requiring installation
- This combination allows for easy setup and portability

The database has two tables:
- `rate_limiter`: Tracks timestamps for rate limiting
- `corn_purchases`: Records all successful purchases for history

The rate limiter logic uses timestamp-based queries to check if a client has made a purchase within the last minute.

## API Design (30 seconds)
I designed a RESTful API with these endpoints:

1. `POST /api/buy-corn`: Processes purchase requests and enforces the rate limit
2. `GET /api/purchases/:clientId`: Retrieves purchase history
3. `GET /api/health`: Health check endpoint

Each endpoint follows REST principles with appropriate HTTP status codes and JSON responses.

## Frontend Implementation (1 minute)
The frontend consists of two components:

### React Component:
- Main application structure and state management
- Clean UI with Tailwind CSS
- Feedback for purchase status and rate limiting

### Backbone.js Component:
- Demonstrates integration of legacy frameworks
- Uses Model-View architecture with Underscore templates
- Shares the same backend and rate limiting system

This dual-implementation shows how different frontend technologies can coexist and interact with the same backend service.

## Backbone.js Integration (30 seconds)
I integrated Backbone.js to demonstrate how legacy code can be incorporated into modern applications:

- Created a `CornPurchase` model to handle API calls and business logic
- Implemented a `PurchaseView` to render the UI and handle user interactions
- Used jQuery for DOM manipulation and Underscore for templating
- Initialized and managed Backbone components within the React application

This approach provides a path for gradually migrating legacy systems while maintaining functionality.

## Live Demo (1 minute)
Let me demonstrate the application:

1. First, I'll enter a client ID and make a purchase with the React component
2. Now I'll make a purchase using the Backbone.js component
3. If I try to make another purchase with either component, I get a rate limit error
4. Notice the countdown timer showing when I can make another purchase
5. Both components track and display purchase history independently

## Code Walkthrough (30 seconds)
The key technical aspects include:

- SQLite queries that implement the rate limiting logic
- React hooks for state management in the modern component
- Backbone's event-driven approach in the legacy component
- How both frameworks communicate with the same Express backend

## Conclusion (30 seconds)
In summary, this solution:

- Successfully implements the 1 corn per minute rate limit using SQLite
- Provides a dual-framework frontend demonstrating integration techniques
- Uses modern web technologies while accommodating legacy code
- Shows how to maintain consistency across different frontend implementations

The project demonstrates my approach to full-stack development, framework integration, and building maintainable systems that can evolve over time.