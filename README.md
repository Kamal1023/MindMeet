# Mental Health Counselling Session Booking System

A production-style full-stack web application for booking mental health counselling sessions, built for the Modex Full Stack Assessment.

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **PostgreSQL** (cloud database via connection string)
- **TypeScript**
- **Zod** for validation

### Frontend
- **React** with **TypeScript**
- **React Router** for navigation
- **Context API** for state management
- **Vite** as build tool

## Features

### Backend Features
-  Admin can create counselling sessions with counsellor name, start time, total seats, and optional topic
-  Users can view available sessions
-  Users can book seats with proper transaction handling
-  Booking statuses: PENDING, CONFIRMED, FAILED
-  Prevents overbooking using PostgreSQL transactions and row-level locking
-  Priority-based queueing system (emergency, urgent, normal)
-  Clean architecture: routes, controllers, services, models
-  Input validation using Zod
-  Standardized API error handling

### Frontend Features
-  Admin dashboard (`/admin`) for creating and viewing sessions
-  Public session list (`/`) showing available counselling sessions
-  Booking page (`/booking/:sessionId`) with seat selection
-  Visual seat availability indicators
-  Booking status display (PENDING/CONFIRMED/FAILED)
-  Mock authentication toggle (admin/user)
-  Responsive design
-  Error handling and loading states

## Project Structure

```
Project_Modex/
├── src/                          # Backend source
│   ├── db/                       # Database connection and schema
│   ├── models/                   # TypeScript interfaces
│   ├── services/                 # Business logic
│   ├── controllers/              # Request handlers
│   ├── routes/                   # API routes
│   ├── middleware/               # Express middleware
│   └── server.ts                 # Entry point
├── frontend/                     # Frontend React app
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Page components
│   │   ├── context/              # React Context providers
│   │   ├── services/             # API service functions
│   │   ├── types/                # TypeScript types
│   │   └── App.tsx               # Main app component
│   └── index.html
├── package.json                  # Backend dependencies
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (Neon, Supabase, or any cloud Postgres)
- npm or yarn

### Backend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   PORT=3001
   NODE_ENV=development
   ```

3. **Run database migration:**
   ```bash
   npm run migrate
   ```
   This will create the necessary tables in your PostgreSQL database.

4. **Start the backend server:**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

## API Endpoints

### Sessions
- `GET /api/sessions` - Get all sessions with availability
- `GET /api/sessions/:id` - Get a specific session
- `POST /api/sessions` - Create a new session (admin)

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/session/:sessionId` - Get all bookings for a session
- `GET /api/bookings/:id` - Get a specific booking

## Database Schema

### Sessions Table
- `id` (SERIAL PRIMARY KEY)
- `counsellor_name` (VARCHAR)
- `start_time` (TIMESTAMP)
- `total_seats` (INTEGER)
- `topic` (VARCHAR, optional)
- `created_at`, `updated_at` (TIMESTAMP)

### Bookings Table
- `id` (SERIAL PRIMARY KEY)
- `session_id` (INTEGER, FK to sessions)
- `user_name` (VARCHAR)
- `user_email` (VARCHAR)
- `seats_requested` (INTEGER)
- `status` (VARCHAR: PENDING, CONFIRMED, FAILED)
- `priority_level` (VARCHAR: emergency, urgent, normal)
- `created_at`, `updated_at` (TIMESTAMP)

## Key Implementation Details

### Concurrency Control
The booking system uses PostgreSQL row-level locking (`FOR UPDATE`) combined with transactions to prevent race conditions and overbooking. When a booking is created:
1. The session row is locked
2. Current confirmed bookings are calculated
3. If seats are available, booking is confirmed immediately
4. If not, booking is created as PENDING
5. PENDING bookings are processed based on priority when seats become available

### Priority Queueing
When a booking is created and seats are limited:
- Bookings are ordered by priority (emergency > urgent > normal)
- Within the same priority, earlier bookings are confirmed first
- Remaining bookings that cannot be confirmed are marked as FAILED

## Usage

1. **Switch to Admin Mode:** Click the "Switch to Admin" button in the header
2. **Create Sessions:** Go to `/admin` and create counselling sessions
3. **View Sessions:** Go to `/` to see all available sessions
4. **Book a Session:** Click "Book Session" on any available session
5. **View Booking Status:** After booking, see the status (CONFIRMED, PENDING, or FAILED)

## Development

- Backend runs in watch mode with `npm run dev`
- Frontend hot-reloads automatically with Vite
- TypeScript ensures type safety across the stack
- All API responses follow a standardized format: `{ success: boolean, data?: T, error?: { message: string } }`

## Production Build

### Backend
```bash
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Notes

- Authentication is mocked using a simple role toggle (admin/user) for demonstration purposes
- In production, implement proper authentication and authorization
- The database connection uses SSL in production mode
- All timestamps are stored in UTC

