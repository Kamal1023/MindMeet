import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSessionById, createBooking, fetchBookingsBySession } from '../services/api';
import { SessionWithAvailability, Booking, PriorityLevel } from '../types';
import './BookingPage.css';

export default function BookingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionWithAvailability | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<Booking | null>(null);
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    seatsRequested: '1',
    priorityLevel: 'normal' as PriorityLevel,
    moodScore: '',
    userNote: '',
  });
  const [moodError, setMoodError] = useState<string | null>(null);

  useEffect(() => {
    loadSessionAndBookings();
  }, [sessionId]);

  const loadSessionAndBookings = async () => {
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
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    // Validate mood score if provided
    if (formData.moodScore && (parseInt(formData.moodScore) < 1 || parseInt(formData.moodScore) > 5)) {
      setMoodError('Mood score must be between 1 and 5');
      return;
    }

    setSubmitting(true);
    setError(null);
    setMoodError(null);

    try {
      const result = await createBooking({
        sessionId: parseInt(sessionId),
        userName: formData.userName,
        userEmail: formData.userEmail,
        seatsRequested: parseInt(formData.seatsRequested),
        priorityLevel: formData.priorityLevel,
        moodScore: formData.moodScore ? parseInt(formData.moodScore) : undefined,
        userNote: formData.userNote || undefined,
      });
      setBookingResult(result);
      // Reset form including mood fields
      setFormData({
        userName: '',
        userEmail: '',
        seatsRequested: '1',
        priorityLevel: 'normal' as PriorityLevel,
        moodScore: '',
        userNote: '',
      });
      await loadSessionAndBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading session details...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Sessions
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="error-container">
        <p>Session not found</p>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Sessions
        </button>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <button onClick={() => navigate('/')} className="back-button">
        ← Back to Sessions
      </button>

      <div className="session-info-card">
        <h2>{session.counsellorName}</h2>
        {session.topic && <span className="topic-badge">{session.topic}</span>}
        <p className="session-time">📅 {formatDate(session.startTime)}</p>
        <div className="availability-info">
          <span>
            {session.availableSeats} of {session.totalSeats} seats available
          </span>
          <div className="availability-bar">
            <div
              className="availability-fill"
              style={{
                width: `${(session.availableSeats / session.totalSeats) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {bookingResult && (
        <div className={`booking-result ${getStatusBadgeClass(bookingResult.status)}`}>
          <h3>Booking {bookingResult.status}!</h3>
          <p>
            Your booking has been {bookingResult.status.toLowerCase()}.
            {bookingResult.status === 'PENDING' &&
              ' It will be confirmed if seats become available based on priority.'}
            {bookingResult.status === 'FAILED' &&
              ' Unfortunately, there are not enough seats available.'}
          </p>
          <p>
            <strong>Booking ID:</strong> {bookingResult.id}
          </p>
          <p>
            <strong>Seats Requested:</strong> {bookingResult.seatsRequested}
          </p>
          <p>
            <strong>Priority:</strong> {bookingResult.priorityLevel}
          </p>
        </div>
      )}

      {session.availableSeats > 0 && !bookingResult && (
        <div className="booking-form-card">
          <h3>Book Your Session</h3>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="userName">Your Name *</label>
              <input
                id="userName"
                type="text"
                value={formData.userName}
                onChange={(e) =>
                  setFormData({ ...formData, userName: e.target.value })
                }
                required
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label htmlFor="userEmail">Your Email *</label>
              <input
                id="userEmail"
                type="email"
                value={formData.userEmail}
                onChange={(e) =>
                  setFormData({ ...formData, userEmail: e.target.value })
                }
                required
                placeholder="john@example.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="seatsRequested">Number of Seats *</label>
              <input
                id="seatsRequested"
                type="number"
                min="1"
                max={session.availableSeats}
                value={formData.seatsRequested}
                onChange={(e) =>
                  setFormData({ ...formData, seatsRequested: e.target.value })
                }
                required
              />
              <small>Maximum {session.availableSeats} seats available</small>
            </div>
            <div className="form-group">
              <label htmlFor="priorityLevel">Priority Level</label>
              <select
                id="priorityLevel"
                value={formData.priorityLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priorityLevel: e.target.value as PriorityLevel,
                  })
                }
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
              <small>
                Higher priority bookings are confirmed first when seats are limited
              </small>
            </div>

            <div className="mood-checkin-section">
              <h4>Mood Check-in</h4>
              <div className="form-group">
                <label htmlFor="moodScore">How are you feeling today? (1-5) <span className="optional-label">Optional</span></label>
                <div className="mood-slider-container">
                  <input
                    id="moodScore"
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={formData.moodScore || '3'}
                    onChange={(e) => {
                      setFormData({ ...formData, moodScore: e.target.value });
                      setMoodError(null);
                    }}
                    className="mood-slider"
                  />
                  <div className="mood-labels">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                  <div className="mood-value-display">
                    {formData.moodScore ? (
                      <>
                        <span className="mood-value">{formData.moodScore}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, moodScore: '' });
                            setMoodError(null);
                          }}
                          className="clear-mood-button"
                        >
                          Clear
                        </button>
                      </>
                    ) : (
                      <span className="mood-value-placeholder">Not selected</span>
                    )}
                  </div>
                </div>
                {moodError && <div className="field-error">{moodError}</div>}
                <small>Optional: Rate your current mood from 1 (very low) to 5 (very good)</small>
              </div>
              <div className="form-group">
                <label htmlFor="userNote">Anything you'd like to share?</label>
                <textarea
                  id="userNote"
                  value={formData.userNote}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 500) {
                      setFormData({ ...formData, userNote: value });
                    }
                  }}
                  placeholder="Share anything that might help us understand how you're feeling..."
                  rows={4}
                  maxLength={500}
                  className="user-note-textarea"
                />
                <small>{formData.userNote.length}/500 characters</small>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="submit-booking-button"
            >
              {submitting ? 'Processing...' : 'Book Session'}
            </button>
          </form>
        </div>
      )}

      {session.availableSeats === 0 && (
        <div className="fully-booked-message">
          <p>This session is fully booked.</p>
          <p>You can still submit a booking request, which will be placed in the queue.</p>
        </div>
      )}

      <div className="bookings-list-card">
        <h3>All Bookings for This Session</h3>
        {bookings.length === 0 ? (
          <p className="no-bookings">No bookings yet.</p>
        ) : (
          <div className="bookings-table">
            <div className="bookings-header">
              <span>Name</span>
              <span>Email</span>
              <span>Seats</span>
              <span>Priority</span>
              <span>Status</span>
            </div>
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-row">
                <span>{booking.userName}</span>
                <span>{booking.userEmail}</span>
                <span>{booking.seatsRequested}</span>
                <span className={`priority-badge priority-${booking.priorityLevel}`}>
                  {booking.priorityLevel}
                </span>
                <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

