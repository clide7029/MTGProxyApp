import { Request, Response } from 'express';
import { AuthService } from './auth-service';
import { Collection, ObjectId } from 'mongodb';
import { LoginCredentials, RegistrationData, PasswordChangeData } from './types';
import { SessionDocument, UserDocument } from '../types/auth';
import { AuthenticatedRequest } from './auth-middleware';

export class AuthController {
  constructor(
    private readonly userCollection: Collection<UserDocument>,
    private readonly sessionCollection: Collection<SessionDocument>,
    private readonly jwtSecret?: string
  ) {
    this.authService = new AuthService(userCollection, sessionCollection, jwtSecret);
  }

  private readonly authService: AuthService;

  /**
   * Register new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegistrationData = req.body;
      const result = await this.authService.register(data);
      res.status(201).json({
        ...result,
        userId: result.userId.toString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginCredentials = req.body;
      const result = await this.authService.login(credentials);
      res.json({
        ...result,
        userId: result.userId.toString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Logout user
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.substring(7);
      if (token) {
        await this.authService.logout(token);
      }
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Change password
   */
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const data: PasswordChangeData = req.body;
      await this.authService.changePassword(new ObjectId(req.user.userId), data);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = await this.userCollection.findOne(
        { _id: new ObjectId(req.user.userId) },
        { projection: { password: 0 } }
      );

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        ...user,
        _id: user._id.toString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: unknown, res: Response): void {
    if (error instanceof Error) {
      switch (error.name) {
        case 'AuthError':
          res.status(401).json({ error: error.message });
          break;
        case 'ValidationError':
          res.status(400).json({ error: error.message });
          break;
        default:
          console.error('Auth error:', error);
          res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      console.error('Unknown error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}