import { pool } from '../db/connection';
import {
  Booking,
  BookingCreateInput,
  BookingStatus,
  PriorityLevel,
} from '../models/Booking';

export class BookingService {
  /**
   * Create a booking with transaction and locking to prevent overbooking.
   * Uses row-level locking and priority-based queueing.
   */
  async createBooking(input: BookingCreateInput): Promise<Booking> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Lock the session row to prevent concurrent modifications (use same client)
      const sessionResult = await client.query(
        `SELECT id, therapist_name as "therapistName", start_time as "startTime", total_seats as "totalSeats", topic, created_at, updated_at
         FROM sessions
         WHERE id = $1
         FOR UPDATE`,
        [input.sessionId]
      );

      if (sessionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new Error('Session not found');
      }
      const session = sessionResult.rows[0];

      // Count already confirmed seats (using same client)
      const confirmedBookingsResult = await client.query(
        `SELECT COALESCE(SUM(seats_requested), 0) as total
         FROM bookings
         WHERE session_id = $1 AND status = 'CONFIRMED'`,
        [input.sessionId]
      );
      const confirmedSeats = parseInt(confirmedBookingsResult.rows[0].total, 10) || 0;
      const availableSeats = session.totalSeats - confirmedSeats;

      // If requested seats exceed available => create PENDING (optional)
      const statusToInsert: BookingStatus =
        input.seatsRequested <= availableSeats ? 'CONFIRMED' : 'PENDING';

      const insertResult = await client.query(
        `INSERT INTO bookings
          (session_id, user_id, user_name, user_email, seats_requested, status, priority_level, mood_score, user_note, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING
           id,
           session_id as "sessionId",
           user_id as "userId",
           user_name as "userName",
           user_email as "userEmail",
           seats_requested as "seatsRequested",
           status,
           priority_level as "priorityLevel",
           mood_score as "moodScore",
           user_note as "userNote",
           created_at as "createdAt",
           updated_at as "updatedAt"`,
        [
          input.sessionId,
          input.userId || null,
          input.userName || null,
          input.userEmail || null,
          input.seatsRequested,
          statusToInsert,
          input.priorityLevel || 'normal',
          input.moodScore || null,
          input.userNote || null,
        ]
      );

      const createdBooking = insertResult.rows[0];

      // If we confirmed this booking, try to process PENDING queue (priority-based)
      if (statusToInsert === 'CONFIRMED') {
        await this.processPendingBookings(client, input.sessionId, session.totalSeats);
      }

      await client.query('COMMIT');
      return createdBooking;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process pending bookings and confirm them based on priority and availability.
   * Uses the same client (transactional).
   */
  private async processPendingBookings(
    client: any,
    sessionId: number,
    totalSeats: number
  ): Promise<void> {
    // Get current confirmed seats
    const confirmedResult = await client.query(
      `SELECT COALESCE(SUM(seats_requested), 0) as total
       FROM bookings
       WHERE session_id = $1 AND status = 'CONFIRMED'`,
      [sessionId]
    );
    let confirmedSeats = parseInt(confirmedResult.rows[0].total, 10) || 0;

    // Get pending bookings ordered by priority (emergency > urgent > normal) and creation time
    const pendingResult = await client.query(
      `SELECT id, seats_requested, priority_level
       FROM bookings
       WHERE session_id = $1 AND status = 'PENDING'
       ORDER BY 
         CASE priority_level
           WHEN 'emergency' THEN 1
           WHEN 'urgent' THEN 2
           ELSE 3
         END,
         created_at ASC
       FOR UPDATE`,
      [sessionId]
    );

    for (const pending of pendingResult.rows) {
      if (confirmedSeats + pending.seats_requested <= totalSeats) {
        await client.query(`UPDATE bookings SET status = 'CONFIRMED' WHERE id = $1`, [pending.id]);
        confirmedSeats += pending.seats_requested;
      } else {
        // Not enough seats — mark as FAILED
        await client.query(`UPDATE bookings SET status = 'FAILED' WHERE id = $1`, [pending.id]);
      }
    }
  }

  /**
   * Get all bookings for a session
   */
  async getBookingsBySessionId(sessionId: number): Promise<Booking[]> {
    const query = `
      SELECT 
        id,
        session_id as "sessionId",
        user_id as "userId",
        user_name as "userName",
        user_email as "userEmail",
        seats_requested as "seatsRequested",
        status,
        priority_level as "priorityLevel",
        mood_score as "moodScore",
        user_note as "userNote",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM bookings
      WHERE session_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [sessionId]);
    return result.rows;
  }

  /**
   * Get all bookings for a user's email (FIXED: Now joins with Sessions table)
   */
  async getBookingsByUserEmail(userEmail: string): Promise<Booking[]> {
    const query = `
      SELECT 
        b.id,
        b.session_id as "sessionId",
        b.user_id as "userId",
        b.user_name as "userName",
        b.user_email as "userEmail",
        b.seats_requested as "seatsRequested",
        b.status,
        b.priority_level as "priorityLevel",
        b.mood_score as "moodScore",
        b.user_note as "userNote",
        b.created_at as "createdAt",
        b.updated_at as "updatedAt",
        -- JOINED FIELDS FOR UI
        s.start_time as "sessionStartTime",
        s.therapist_name as "therapistName",
        s.topic as "sessionTopic"
      FROM bookings b
      JOIN sessions s ON b.session_id = s.id
      WHERE b.user_email = $1
      ORDER BY s.start_time DESC
    `;
    const result = await pool.query(query, [userEmail]);
    return result.rows;
  }

  /**
   * Get a booking by ID
   */
  async getBookingById(id: number): Promise<Booking | null> {
    const query = `
      SELECT 
        id,
        session_id as "sessionId",
        user_id as "userId",
        user_name as "userName",
        user_email as "userEmail",
        seats_requested as "seatsRequested",
        status,
        priority_level as "priorityLevel",
        mood_score as "moodScore",
        user_note as "userNote",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM bookings
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Update booking status (for admin operations)
   */
  async updateBookingStatus(id: number, status: BookingStatus): Promise<Booking> {
    const query = `
      UPDATE bookings
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING 
        id,
        session_id as "sessionId",
        user_id as "userId",
        user_name as "userName",
        user_email as "userEmail",
        seats_requested as "seatsRequested",
        status,
        priority_level as "priorityLevel",
        mood_score as "moodScore",
        user_note as "userNote",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    const result = await pool.query(query, [status, id]);
    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }
    return result.rows[0];
  }
}