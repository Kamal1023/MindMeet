export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';
export type PriorityLevel = 'emergency' | 'urgent' | 'normal';
export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export interface Session {
  id: number;
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
  bookedSeats: number;
}

export interface Booking {
  id: number;
  sessionId: number;
  userId?: number;
  userName: string;
  userEmail: string;
  seatsRequested: number;
  status: BookingStatus;
  priorityLevel: PriorityLevel;
  moodScore?: number;
  userNote?: string;
  createdAt: string;
  updatedAt: string;
  
  // NEW FIELDS from the Join Query
  sessionStartTime?: string;
  therapistName?: string;
  sessionTopic?: string;
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