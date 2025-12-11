import { SessionWithAvailability, Booking, BookingCreateInput, ApiResponse } from '../types';

// DIRECT LINK TO BACKEND (Bypassing Env Vars for safety)
const API_BASE_URL = 'https://mindmeet-backend.onrender.com/api';

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// Create headers with auth token if available
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// --- FIXED ERROR HANDLING FUNCTION ---
async function handleResponse<T>(response: Response): Promise<T> {
  // 1. Read the text FIRST to avoid "body stream already read" error
  const text = await response.text();
  
  let data: ApiResponse<T> | null = null;
  try {
    // 2. Try to parse as JSON
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    // If parsing fails, use the raw text as the error message
    throw new Error(text || 'An unexpected server error occurred');
  }

  if (!response.ok) {
    // Handle Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    // Extract error message from backend response
    const errorMessage = data?.error?.message || (data as any)?.message || 'An error occurred';
    throw new Error(errorMessage);
  }

  // Success
  return (data?.data || data) as T;
}

// --- AUTH API ---
export async function login(credentials: { email: string; password: string }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return handleResponse<{ user: any; token: string }>(response);
}

export async function register(userData: { email: string; password: string }) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return handleResponse<{ user: any; token: string }>(response);
}

// --- SESSIONS API ---
export async function fetchSessions(): Promise<SessionWithAvailability[]> {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    headers: getHeaders(),
  });
  return handleResponse<SessionWithAvailability[]>(response);
}

export async function fetchSessionById(id: number): Promise<SessionWithAvailability> {
  const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<SessionWithAvailability>(response);
}

export async function createSession(session: {
  counsellorName: string;
  startTime: string;
  totalSeats: number;
  topic?: string;
}): Promise<SessionWithAvailability> {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(session),
  });
  return handleResponse<SessionWithAvailability>(response);
}

// --- BOOKINGS API ---
export async function createBooking(booking: BookingCreateInput): Promise<Booking> {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(booking),
  });
  return handleResponse<Booking>(response);
}

export async function fetchBookingsBySession(sessionId: number): Promise<Booking[]> {
  const response = await fetch(`${API_BASE_URL}/bookings/session/${sessionId}`, {
    headers: getHeaders(),
  });
  return handleResponse<Booking[]>(response);
}

export async function fetchMyBookings(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
    headers: getHeaders(),
  });
  return handleResponse<any[]>(response);
}