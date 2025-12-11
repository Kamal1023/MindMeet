import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>MindMeet</h1>
          </Link>
          <nav className="nav">
            <Link
              to="/"
              className={location.pathname === '/' ? 'active' : ''}
            >
              Available Sessions
            </Link>
            <Link
              to="/my-appointments"
              className={location.pathname === '/my-appointments' ? 'active' : ''}
            >
              My Appointments
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={location.pathname.startsWith('/admin') ? 'active' : ''}
              >
                Admin Dashboard
              </Link>
            )}
            <div className="user-menu">
              {user && (
                <span className="user-email">{user.email}</span>
              )}
              <button onClick={logout} className="logout-button">
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}

