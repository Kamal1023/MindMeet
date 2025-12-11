import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ApiError } from './errorHandler';

const authService = new AuthService();

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = authService.verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError('Invalid or expired token', 401));
    }
  }
}

/**
 * Middleware to check if user is admin
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new ApiError('Authentication required', 401));
    return;
  }

  if (req.user.role !== 'admin') {
    next(new ApiError('Admin access required', 403));
    return;
  }

  next();
}

