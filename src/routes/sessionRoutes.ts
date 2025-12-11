import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();
const sessionController = new SessionController();

// --- SMART DATE PARSER ---
const parseDate = (val: string | Date) => {
  if (val instanceof Date) return val;
  if (!val) throw new Error('Date is required');

  const strVal = String(val).trim();
  const standardDate = new Date(strVal);

  if (!isNaN(standardDate.getTime())) {
    return standardDate;
  }
  throw new Error(`Invalid date format: "${strVal}"`);
};

// --- VALIDATION SCHEMA ---
const createSessionSchema = z.object({
  // Accept 'counsellorName' from frontend
  counsellorName: z.string().min(1, 'Counsellor name is required'),
  specialization: z.string().optional(),
  startTime: z.union([z.string(), z.date()]).transform(parseDate),
  totalSeats: z.coerce.number().int().positive(),
  topic: z.string().optional(),
})
// Rename 'counsellorName' to 'therapistName'
.transform((data) => ({
  therapistName: data.counsellorName,
  specialization: data.specialization,
  startTime: data.startTime,
  totalSeats: data.totalSeats,
  topic: data.topic
}));

// --- ROUTES ---

// Create Session
router.post(
  '/',
  validateBody(createSessionSchema),
  sessionController.createSession.bind(sessionController)
);

// Get All Sessions
router.get(
  '/',
  sessionController.getAllSessions.bind(sessionController)
);

// Get Session By ID (NEW ROUTE)
router.get(
  '/:id',
  sessionController.getSessionById.bind(sessionController)
);

export default router;