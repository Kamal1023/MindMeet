import { Link } from 'react-router-dom';
import { useSessions } from '../context/SessionContext';
import './HomePage.css';

export default function HomePage() {
  const { sessions, loading, error } = useSessions();

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading available sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="page-header">
        <h2>Available Counselling Sessions</h2>
        <p>Book a session with our qualified mental health counsellors</p>
      </div>

      {sessions.length === 0 ? (
        <div className="empty-state">
          <p>No sessions available at the moment.</p>
          <p>Please check back later or contact support.</p>
        </div>
      ) : (
        <div className="sessions-grid">
          {sessions.map((session) => (
            <div key={session.id} className="session-card">
              <div className="session-header">
                <h3>{session.counsellorName}</h3>
                {session.topic && (
                  <span className="topic-badge">{session.topic}</span>
                )}
              </div>
              <div className="session-details">
                <p className="session-time">
                  <strong>📅</strong> {formatDate(session.startTime)}
                </p>
                <div className="session-availability">
                  <span className="seats-info">
                    {session.availableSeats} of {session.totalSeats} seats
                    available
                  </span>
                  <div className="availability-bar">
                    <div
                      className="availability-fill"
                      style={{
                        width: `${
                          (session.availableSeats / session.totalSeats) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <Link
                to={`/booking/${session.id}`}
                className={`book-button ${
                  session.availableSeats === 0 ? 'disabled' : ''
                }`}
              >
                {session.availableSeats === 0
                  ? 'Fully Booked'
                  : 'Book Session'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

