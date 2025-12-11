export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';
export type PriorityLevel = 'emergency' | 'urgent' | 'normal';
export type UserRole = 'admin' | 'user';

export interface Session {
  id: number;
  // UPDATED: Backend returns 'therapistName'. 
  // If your UI uses 'counsellorName', you might need to rename it in your React components to 'therapistName'.
  therapistName: string; 
  specialization?: string;
  startTime: string;
  totalSeats: number;
  topic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionWithAvailability extends Session {
  availableSeats: number;
  // UPDATED: Backend returns 'bookedSeats'. This fixes the empty count in Admin Dashboard.
  bookedSeats: number; 
}

export interface Booking {
  id: number;
  sessionId: number;
  userName: string;
  userEmail: string;
  seatsRequested: number;
  status: BookingStatus;
  priorityLevel: PriorityLevel;
  moodScore?: number;
  userNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingCreateInput {
  sessionId: number;
  userName: string;
  userEmail: string;
  seatsRequested: number;
  priorityLevel?: PriorityLevel;
  moodScore?: number;
  userNote?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}