import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateBody } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const authController = new AuthController();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Routes
router.post(
  '/register',
  validateBody(registerSchema),
  authController.register.bind(authController)
);

router.post(
  '/login',
  validateBody(loginSchema),
  authController.login.bind(authController)
);

router.get(
  '/me',
  authenticate,
  authController.getProfile.bind(authController)
);

export { router as authRoutes };
export default router;

