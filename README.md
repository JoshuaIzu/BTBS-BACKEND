# BTBS

BTBS is an Express-based backend API for user authentication, route management, confirmations, and safety point tracking. It uses MongoDB for persistence, JWT for authentication, and Nodemailer for email-based OTP operations.

## Features

- User registration and login with OTP verification
- JWT-protected routes and role-based authorization
- CRUD operations for route records
- Confirmation records for routes
- Safety point lookup and admin creation
- Email sending through Gmail for OTP and notifications

## Requirements

- Node.js 18+ (or compatible modern Node.js)
- MongoDB database

## Installation

```bash
npm install
```

## Environment

Copy `.env.example` to `.env` and fill in your values.

```bash
cp .env.example .env
```

### Required variables

- `PORT` - Port the server listens on (default `5000`)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret used to sign JWT tokens
- `JWT_EXPIRES_IN` - JWT expiration time (e.g. `1d`, `7d`)
- `EMAIL_USER` - Gmail address used to send OTP emails
- `EMAIL_PASS` - Gmail app password or account password

## Run the app

```bash
npm run dev
```

The server starts at `http://localhost:5000` by default.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in and request OTP
- `POST /api/auth/verify-otp` - Verify OTP and receive JWT
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/profile` - Get authenticated user profile

### Routes

- `GET /api/routes` - Get all routes
- `GET /api/routes/search` - Search routes
- `GET /api/routes/:id` - Get route by ID
- `POST /api/routes/create` - Create route (protected, `business` or `admin`)
- `PUT /api/routes/:id` - Update route (protected, `business` or `admin`)
- `DELETE /api/routes/:id` - Delete route (protected, `admin`)

### Confirmations

- `GET /api/confirmations/routes/:routeId` - Get confirmations for a route
- `POST /api/confirmations/:routeId` - Create confirmation (protected)
- `PATCH /api/confirmations/:confirmationId` - Update confirmation (protected)
- `DELETE /api/confirmations/:confirmationId` - Delete confirmation (protected, `admin`)

### Safety Points

- `GET /api/safety-points` - Get safety points
- `GET /api/safety-points/category/:category` - Get safety points by category
- `POST /api/safety-points` - Create safety point (protected, `admin`)

## Notes

- Authentication uses Bearer tokens in the `Authorization` header.
- Email sending is configured for Gmail in `src/utils/sendEmail.js`.
- Validation is handled through route-specific validator middleware.

## License

This project uses the ISC license.
