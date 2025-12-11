export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';
export type PriorityLevel = 'emergency' | 'urgent' | 'normal';

export interface Booking {
  id: number;
  sessionId: number;
  userId?: number | null; // Added this
  userName: string;
  userEmail: string;
  seatsRequested: number;
  status: BookingStatus;
  priorityLevel: PriorityLevel;
  moodScore?: number | null;
  userNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingCreateInput {
  sessionId: number;
  userId?: number | null; // Added this to fix the error
  userName: string;
  userEmail: string;
  seatsRequested: number;
  priorityLevel?: PriorityLevel;
  moodScore?: number | null;
  userNote?: string | null;
}