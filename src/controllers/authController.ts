import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ApiError } from '../middleware/errorHandler';

const authService = new AuthService();

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        const apiError = error as ApiError;
        apiError.statusCode = apiError.statusCode || 400;
      }
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        const apiError = error as ApiError;
        apiError.statusCode = apiError.statusCode || 401;
      }
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User is attached by authenticate middleware
      const authReq = req as any;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
        return;
      }

      const user = await authService.getUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: { message: 'User not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

