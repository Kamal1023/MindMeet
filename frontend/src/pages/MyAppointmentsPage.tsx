import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMyBookings } from '../services/api';
import './MyAppointmentsPage.css';

interface BookingWithSession {
  id: number;
  sessionId: number;
  userName: string;
  userEmail: string;
  seatsRequested: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  priorityLevel: 'emergency' | 'urgent' | 'normal';
  moodScore?: number;
  userNote?: string;
  createdAt: string;
  updatedAt: string;
  counsellorName: string;
  sessionStartTime: string;
  sessionTopic?: string;
  sessionTotalSeats: number;
}

export default function MyAppointmentsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? String(err.message) 
        : err instanceof Error 
        ? err.message 
        : 'Failed to load appointments';
      setError(errorMessage);
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

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date();
  };

  const upcomingBookings = bookings.filter(b => isUpcoming(b.sessionStartTime));
  const pastBookings = bookings.filter(b => !isUpcoming(b.sessionStartTime));

  if (loading) {
    return (
      <div className="appointments-loading">
        <div className="spinner"></div>
        <p>Loading your appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointments-error">
        <p>Error: {error}</p>
        <button onClick={loadBookings} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="my-appointments-page">
      <div className="appointments-header">
        <h2>My Appointments</h2>
        <p>View all your counselling session bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="no-appointments">
          <p>You don't have any appointments yet.</p>
          <p>Book a session to get started!</p>
        </div>
      ) : (
        <>
          {upcomingBookings.length > 0 && (
            <div className="appointments-section">
              <h3>Upcoming Appointments ({upcomingBookings.length})</h3>
              <div className="appointments-grid">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="appointment-card">
                    <div className="appointment-header">
                      <h4>{booking.counsellorName}</h4>
                      {booking.sessionTopic && (
                        <span className="topic-badge">{booking.sessionTopic}</span>
                      )}
                    </div>
                    <div className="appointment-details">
                      <div className="detail-row">
                        <span className="detail-label">📅 Date & Time:</span>
                        <span className="detail-value">{formatDate(booking.sessionStartTime)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">🎫 Seats:</span>
                        <span className="detail-value">{booking.seatsRequested}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">⚡ Priority:</span>
                        <span className={`detail-value ${getPriorityBadgeClass(booking.priorityLevel)}`}>
                          {booking.priorityLevel}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">📊 Status:</span>
                        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      {booking.moodScore && (
                        <div className="detail-row">
                          <span className="detail-label">😊 Mood Score:</span>
                          <span className="detail-value mood-score">{booking.moodScore}/5</span>
                        </div>
                      )}
                      {booking.userNote && (
                        <div className="detail-row note-row">
                          <span className="detail-label">📝 Note:</span>
                          <span className="detail-value note-text">{booking.userNote}</span>
                        </div>
                      )}
                    </div>
                    <div className="appointment-footer">
                      <span className="booking-id">Booking ID: {booking.id}</span>
                      <span className="booking-date">
                        Booked: {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastBookings.length > 0 && (
            <div className="appointments-section">
              <h3>Past Appointments ({pastBookings.length})</h3>
              <div className="appointments-grid">
                {pastBookings.map((booking) => (
                  <div key={booking.id} className="appointment-card past">
                    <div className="appointment-header">
                      <h4>{booking.counsellorName}</h4>
                      {booking.sessionTopic && (
                        <span className="topic-badge">{booking.sessionTopic}</span>
                      )}
                    </div>
                    <div className="appointment-details">
                      <div className="detail-row">
                        <span className="detail-label">📅 Date & Time:</span>
                        <span className="detail-value">{formatDate(booking.sessionStartTime)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">🎫 Seats:</span>
                        <span className="detail-value">{booking.seatsRequested}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">📊 Status:</span>
                        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      {booking.moodScore && (
                        <div className="detail-row">
                          <span className="detail-label">😊 Mood Score:</span>
                          <span className="detail-value mood-score">{booking.moodScore}/5</span>
                        </div>
                      )}
                      {booking.userNote && (
                        <div className="detail-row note-row">
                          <span className="detail-label">📝 Note:</span>
                          <span className="detail-value note-text">{booking.userNote}</span>
                        </div>
                      )}
                    </div>
                    <div className="appointment-footer">
                      <span className="booking-id">Booking ID: {booking.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

