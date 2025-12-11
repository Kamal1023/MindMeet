import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSessionById, fetchBookingsBySession } from '../services/api';
import { SessionWithAvailability, Booking } from '../types';
import './AdminBookingsPage.css';

export default function AdminBookingsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionWithAvailability | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const loadData = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      const [sessionData, bookingsData] = await Promise.all([
        fetchSessionById(parseInt(sessionId)),
        fetchBookingsBySession(parseInt(sessionId)),
      ]);
      setSession(sessionData);
      setBookings(bookingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'PENDING':
        return 'status-pending';
      case 'FAILED':
        return 'status-failed';
      default:
        return '';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    return `priority-badge priority-${priority}`;
  };

  if (loading) {
    return (
      <div className="admin-bookings-loading">
        <div className="spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="admin-bookings-error">
        <p>Error: {error || 'Session not found'}</p>
        <button onClick={() => navigate('/admin')} className="back-button">
          Back to Admin Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="admin-bookings-page">
      <div className="admin-bookings-header">
        <button onClick={() => navigate('/admin')} className="back-button">
          ← Back to Admin Dashboard
        </button>
        {/* FIX 1: Updated counsellorName to therapistName */}
        <h2>Bookings for {session.therapistName}</h2>
        {session.topic && <span className="topic-badge">{session.topic}</span>}
        <p className="session-time">📅 {formatDate(session.startTime)}</p>
      </div>

      <div className="bookings-summary">
        <div className="summary-card">
          <span className="summary-label">Total Seats</span>
          <span className="summary-value">{session.totalSeats}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Confirmed</span>
          {/* FIX 2: Updated confirmedBookings to bookedSeats */}
          <span className="summary-value confirmed">{session.bookedSeats}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Available</span>
          <span className="summary-value available">{session.availableSeats}</span>
        </div>
      </div>

      <div className="bookings-table-container">
        <h3>All Bookings ({bookings.length})</h3>
        {bookings.length === 0 ? (
          <div className="no-bookings">No bookings for this session yet.</div>
        ) : (
          <div className="bookings-table">
            <div className="bookings-table-header">
              <span>Name</span>
              <span>Email</span>
              <span>Seats</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Mood</span>
              <span>Note</span>
            </div>
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-table-row">
                <span className="booking-name">{booking.userName}</span>
                <span className="booking-email">{booking.userEmail}</span>
                <span className="booking-seats">{booking.seatsRequested}</span>
                <span className={getPriorityBadgeClass(booking.priorityLevel)}>
                  {booking.priorityLevel}
                </span>
                <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status}
                </span>
                <span className="booking-mood">
                  {booking.moodScore ? `${booking.moodScore}/5` : '—'}
                </span>
                <span className="booking-note-full" title={booking.userNote || undefined}>
                  {booking.userNote || '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}