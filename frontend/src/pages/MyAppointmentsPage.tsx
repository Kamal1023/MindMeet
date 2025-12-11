import { useState, useEffect } from 'react';
import { fetchMyBookings } from '../services/api';
import { Booking } from '../types';
import './MyAppointmentsPage.css';

export default function MyAppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date not available';
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
      case 'CONFIRMED': return 'status-confirmed';
      case 'PENDING': return 'status-pending';
      case 'FAILED': return 'status-failed';
      default: return '';
    }
  };

  if (loading) return <div className="appointments-loading">Loading your appointments...</div>;
  if (error) return <div className="appointments-error">Error: {error}</div>;

  return (
    <div className="my-appointments-page">
      <div className="appointments-header">
        <h1>My Appointments</h1>
        <p>View all your counselling session bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="no-appointments">
          <p>You haven't booked any sessions yet.</p>
          <a href="/" className="browse-btn">Browse Sessions</a>
        </div>
      ) : (
        <div className="appointments-grid">
          {bookings.map((booking) => (
            <div key={booking.id} className="appointment-card">
              <div className="card-header">
                {/* Use the new fields here */}
                <h3>{booking.therapistName || 'Counselling Session'}</h3>
                {booking.sessionTopic && <span className="topic-badge">{booking.sessionTopic}</span>}
              </div>
              
              <div className="card-details">
                <div className="detail-row">
                  <span className="icon">📅</span>
                  <span className="value">{formatDate(booking.sessionStartTime)}</span>
                </div>
                <div className="detail-row">
                  <span className="icon">🪑</span>
                  <span className="value">{booking.seatsRequested} Seat(s)</span>
                </div>
                <div className="detail-row">
                  <span className="icon">📊</span>
                  <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                {booking.moodScore && (
                  <div className="detail-row">
                    <span className="icon">😊</span>
                    <span className="value">Mood Score: {booking.moodScore}/5</span>
                  </div>
                )}
                {booking.userNote && (
                  <div className="detail-row note-row">
                    <span className="icon">📝</span>
                    <p className="note-text">"{booking.userNote}"</p>
                  </div>
                )}
              </div>
              <div className="booking-id">Booking ID: {booking.id}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}