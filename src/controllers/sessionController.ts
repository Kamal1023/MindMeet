import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/sessionService';
import { ApiError } from '../middleware/errorHandler';

const sessionService = new SessionService();

export class SessionController {
  async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Manual map fallback in case middleware transformation was skipped
      const input = {
        ...req.body,
        therapistName: req.body.therapistName || req.body.counsellorName,
      };
      
      const session = await sessionService.createSession(input);
      res.status(201).json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessions = await sessionService.getAllSessions();
      res.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  // (NEW METHOD)
  async getSessionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new Error('Invalid session ID'); // Will be caught by errorHandler
      }

      const session = await sessionService.getSessionById(id);
      if (!session) {
        res.status(404).json({
          success: false,
          error: { message: 'Session not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }
}