import { pool } from '../db/connection';
import { Session, SessionCreateInput, SessionWithAvailability } from '../models/Session';

export class SessionService {
  /**
   * Create a new session
   */
  async createSession(input: SessionCreateInput): Promise<Session> {
    const query = `
      INSERT INTO sessions (therapist_name, specialization, start_time, total_seats, topic, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING 
        id,
        therapist_name as "therapistName",
        specialization,
        start_time as "startTime",
        total_seats as "totalSeats",
        topic,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const values = [
      input.therapistName,
      input.specialization || null,
      input.startTime,
      input.totalSeats,
      input.topic || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all sessions with available AND booked seat counts
   */
  async getAllSessions(): Promise<SessionWithAvailability[]> {
    const query = `
      SELECT 
        s.id,
        s.therapist_name as "therapistName",
        s.specialization,
        s.start_time as "startTime",
        s.total_seats as "totalSeats",
        s.topic,
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
        -- Calculate Available Seats
        (s.total_seats - COALESCE(COUNT(b.id), 0))::int as "availableSeats",
        -- Calculate Booked Seats (For Admin Dashboard)
        COALESCE(COUNT(b.id), 0)::int as "bookedSeats"
      FROM sessions s
      LEFT JOIN bookings b ON s.id = b.session_id AND b.status = 'CONFIRMED'
      GROUP BY s.id
      ORDER BY s.start_time ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get a single session by ID
   */
  async getSessionById(id: number): Promise<SessionWithAvailability | null> {
    const query = `
      SELECT 
        s.id,
        s.therapist_name as "therapistName",
        s.specialization,
        s.start_time as "startTime",
        s.total_seats as "totalSeats",
        s.topic,
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
        (s.total_seats - COALESCE(COUNT(b.id), 0))::int as "availableSeats",
        COALESCE(COUNT(b.id), 0)::int as "bookedSeats"
      FROM sessions s
      LEFT JOIN bookings b ON s.id = b.session_id AND b.status = 'CONFIRMED'
      WHERE s.id = $1
      GROUP BY s.id
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}