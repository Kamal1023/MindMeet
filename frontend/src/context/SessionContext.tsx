import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SessionWithAvailability } from '../types';
import { fetchSessions } from '../services/api';

interface SessionContextType {
  sessions: SessionWithAvailability[];
  loading: boolean;
  error: string | null;
  refreshSessions: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<SessionWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSessions();
      setSessions(data);
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? String(err.message) 
        : err instanceof Error 
        ? err.message 
        : 'Failed to fetch sessions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        sessions,
        loading,
        error,
        refreshSessions,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSessions() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessions must be used within a SessionProvider');
  }
  return context;
}

