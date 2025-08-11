# Bob's Corn Rate Limiter - Video Presentation Script

## Introduction (30 seconds)
Hello! Today I'll be presenting my solution for the Bob's Corn rate limiter challenge. This project implements a system that ensures clients can only purchase one corn per minute, with a simple and effective web interface.

## Overview (30 seconds)
The solution consists of:
1. An Express server with a SQLite database that implements the rate limiter
2. An HTML/JavaScript user interface that allows clients to easily purchase corn

I'll walk through each component, explain my implementation decisions, and demonstrate how the system works.

## Backend Architecture (1 minute)
For the backend, I chose Express.js with SQLite because:

- Express provides a lightweight and efficient framework for building APIs
- SQLite offers persistent storage without requiring database server installation
- This combination allows for quick setup and portability

The database has one main table:
- `rate_limiter`: Stores client ID and timestamp for each purchase

The rate limiter logic uses timestamp-based queries to check if a client has made purchases within the last minute.

## API Design (30 seconds)
I designed a RESTful API with these endpoints:

1. `POST /api/buy-corn`: Processes purchase requests and enforces the rate limit
2. `GET /api/purchases/:clientId`: Retrieves purchase history
3. `GET /api/health`: Health check endpoint

Each endpoint follows REST principles with appropriate HTTP status codes and JSON responses.

## Frontend Implementation (1 minute)
The frontend is a simple web application built with:

- HTML5 for structure
- Vanilla JavaScript for interactivity
- TailwindCSS for styling and responsiveness

UI features include:
- A field to enter client ID
- A button to purchase corn
- Visual feedback for successful purchases with a corn emoji animation
- Error handling with clear messages
- A countdown timer showing when rate-limited clients can make another purchase
- Purchase history display

## Live Demo (1 minute)
Let me demonstrate the application:

1. First, I'll enter a client ID and purchase corn
2. You can see the success message and corn emoji animation
3. If I try to make another purchase immediately, I get a rate limit error
4. Notice the countdown timer showing when I can make another purchase
5. The purchase history is updated automatically

## Code Walkthrough (30 seconds)
The key technical aspects include:

- The rate limiting function in the backend that queries the database to check if a client has purchased within the last minute
- The JavaScript state management for handling purchase status, errors, and the countdown timer
- Error handling on both the backend and frontend to ensure a robust user experience

## Conclusion (30 seconds)
In summary, this solution:

- Successfully implements the 1 corn per minute rate limit using a SQLite database
- Provides a clean, intuitive interface for clients
- Uses modern web technologies with a focus on simplicity and efficiency
- Is extensible and could be scaled for additional features

This project demonstrates my approach to problem-solving, architecture design, and full-stack development skills. Thank you for your consideration!