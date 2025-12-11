export interface Session {
  id: number;
  therapistName: string;
  specialization?: string | null;
  startTime: Date;
  totalSeats: number;
  topic?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionCreateInput {
  therapistName: string;
  specialization?: string;
  startTime: Date;
  totalSeats: number;
  topic?: string;
}

export interface SessionWithAvailability extends Session {
  availableSeats: number;
  bookedSeats?: number; // Added this field
}