import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSessions } from '../context/SessionContext';
import { createSession } from '../services/api';
import './AdminPage.css';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { sessions, loading, error, refreshSessions } = useSessions();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    counsellorName: '',
    startTime: '',
    totalSeats: '',
    topic: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="admin-error">
        <p>You must be an admin to access this page.</p>
        <p>Use the toggle in the header to switch to admin mode.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      await createSession({
        counsellorName: formData.counsellorName,
        startTime: new Date(formData.startTime).toISOString(),
        totalSeats: parseInt(formData.totalSeats),
        topic: formData.topic || undefined,
      });
      setFormData({
        counsellorName: '',
        startTime: '',
        totalSeats: '',
        topic: '',
      });
      setShowForm(false);
      refreshSessions();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create session');
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

  const handleViewBookings = (sessionId: number) => {
    navigate(`/admin/bookings/${sessionId}`);
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="create-button"
        >
          {showForm ? 'Cancel' : '+ Create New Session'}
        </button>
      </div>

      {showForm && (
        <div className="create-form-container">
          <form onSubmit={handleSubmit} className="create-form">
            <h3>Create New Counselling Session</h3>
            {submitError && <div className="error-message">{submitError}</div>}
            <div className="form-group">
              <label htmlFor="counsellorName">Counsellor Name *</label>
              <input
                id="counsellorName"
                type="text"
                value={formData.counsellorName}
                onChange={(e) =>
                  setFormData({ ...formData, counsellorName: e.target.value })
                }
                required
                placeholder="Dr. Jane Smith"
              />
            </div>
            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="totalSeats">Total Seats *</label>
              <input
                id="totalSeats"
                type="number"
                min="1"
                value={formData.totalSeats}
                onChange={(e) =>
                  setFormData({ ...formData, totalSeats: e.target.value })
                }
                required
                placeholder="10"
              />
            </div>
            <div className="form-group">
              <label htmlFor="topic">Topic (Optional)</label>
              <input
                id="topic"
                type="text"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                placeholder="Anxiety, Depression, etc."
              />
            </div>
            <button type="submit" disabled={submitting} className="submit-button">
              {submitting ? 'Creating...' : 'Create Session'}
            </button>
          </form>
        </div>
      )}

      <div className="sessions-list">
        <h3>All Sessions</h3>
        {loading ? (
          <div className="loading">Loading sessions...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : sessions.length === 0 ? (
          <div className="empty">No sessions created yet.</div>
        ) : (
          <div className="admin-sessions-grid">
            {sessions.map((session) => (
              <div key={session.id} className="admin-session-card">
                <div className="admin-session-header">
                  <h4>{session.therapistName}</h4>
                  {session.topic && (
                    <span className="topic-badge">{session.topic}</span>
                  )}
                </div>
                <p className="admin-session-time">
                  📅 {formatDate(session.startTime)}
                </p>
                <div className="admin-session-stats">
                  <div className="stat">
                    <span className="stat-label">Total Seats:</span>
                    <span className="stat-value">{session.totalSeats}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Booked:</span>
                    <span className="stat-value">{session.bookedSeats}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Available:</span>
                    <span
                      className={`stat-value ${
                        session.availableSeats === 0 ? 'full' : ''
                      }`}
                    >
                      {session.availableSeats}
                    </span>
                  </div>
                </div>
                <div className="recent-bookings-section">
                  <button
                    onClick={() => handleViewBookings(session.id)}
                    className="view-bookings-button"
                  >
                    View All Bookings →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

