import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/bookingService';
import { ApiError } from '../middleware/errorHandler';
// Import AuthRequest to check user roles
import { AuthRequest } from '../middleware/auth'; 

const bookingService = new BookingService();

export class BookingController {
  /**
   * Create a new booking
   */
  async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingService.createBooking(req.body);
      res.status(201).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      if (error instanceof Error) {
        const apiError = error as any;
        apiError.statusCode = apiError.statusCode || 400;
      }
      next(error);
    }
  }

  /**
   * Get bookings for a session
   * SECURITY UPDATE: Only Admins can see the full list of bookings for a session.
   */
  async getBookingsBySession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        throw new ApiError('Invalid session ID', 400);
      }

      // Check if the user is an ADMIN
      const authReq = req as AuthRequest;
      
      // If user is NOT admin, return empty list or throw error
      // This prevents normal users from seeing other people's names
      if (authReq.user?.role !== 'admin') {
         res.json({ success: true, data: [] });
         return;
      }

      const bookings = await bookingService.getBookingsBySessionId(sessionId);
      res.json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single booking by ID
   */
  async getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new ApiError('Invalid booking ID', 400);
      }

      const booking = await bookingService.getBookingById(id);
      if (!booking) {
        res.status(404).json({
          success: false,
          error: { message: 'Booking not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's bookings
   */
  async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;

      if (!authReq.user || !authReq.user.email) {
        throw new ApiError('Authentication required', 401);
      }

      const bookings = await bookingService.getBookingsByUserEmail(authReq.user.email);
      res.json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }
}