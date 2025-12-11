import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';
import { validateBody } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const bookingController = new BookingController();

// Validation schemas
const createBookingSchema = z.object({
  sessionId: z.number().int().positive('Session ID must be positive'),
  userName: z.string().min(1, 'User name is required'),
  userEmail: z.string().email('Invalid email format'),
  seatsRequested: z.number().int().positive('Seats requested must be positive'),
  priorityLevel: z.enum(['emergency', 'urgent', 'normal']).optional(),
  moodScore: z.number().int().min(1).max(5).optional().nullable(),
  userNote: z.string().max(500, 'User note must be 500 characters or less').optional().nullable(),
});

// Routes

// Create a booking
router.post(
  '/',
  validateBody(createBookingSchema),
  bookingController.createBooking.bind(bookingController)
);

// Get my bookings (Protected)
router.get(
  '/my-bookings',
  authenticate,
  bookingController.getMyBookings.bind(bookingController)
);

// Get bookings by session
router.get(
  '/session/:sessionId',
  authenticate,
  bookingController.getBookingsBySession.bind(bookingController)
);

// Get single booking
router.get(
  '/:id', 
  bookingController.getBookingById.bind(bookingController)
);

export default router;