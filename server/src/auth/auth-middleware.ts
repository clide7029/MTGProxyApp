import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth-service';
import { AuthError, AuthErrorType, UserRole } from './types';
import { Collection, ObjectId } from 'mongodb';
import { SessionDocument, UserDocument } from '../types/auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: ObjectId;
    role: UserRole;
  };
}

/**
 * Authentication middleware factory
 */
export function createAuthMiddleware(
  userCollection: Collection<UserDocument>,
  sessionCollection: Collection<SessionDocument>,
  jwtSecret?: string
) {
  const authService = new AuthService(userCollection, sessionCollection, jwtSecret);

  return {
    /**
     * Require authentication
     */
    requireAuth: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const token = extractToken(req);
        if (!token) {
          throw new AuthError(AuthErrorType.TOKEN_INVALID, 'No authentication token provided');
        }

        const session = await authService.verifyToken(token);
        req.user = {
          userId: session.userId,
          role: session.role,
        };
        next();
      } catch (error) {
        handleAuthError(error, res);
      }
    },

    /**
     * Require admin role
     */
    requireAdmin: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const token = extractToken(req);
        if (!token) {
          throw new AuthError(AuthErrorType.TOKEN_INVALID, 'No authentication token provided');
        }

        const session = await authService.verifyToken(token);
        if (session.role !== UserRole.ADMIN) {
          throw new AuthError(
            AuthErrorType.INSUFFICIENT_PERMISSIONS,
            'Admin privileges required'
          );
        }

        req.user = {
          userId: session.userId,
          role: session.role,
        };
        next();
      } catch (error) {
        handleAuthError(error, res);
      }
    },

    /**
     * Optional authentication
     */
    optionalAuth: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const token = extractToken(req);
        if (token) {
          const session = await authService.verifyToken(token);
          req.user = {
            userId: session.userId,
            role: session.role,
          };
        }
        next();
      } catch (error) {
        // Continue without authentication
        next();
      }
    },
  };
}

/**
 * Extract token from request
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Handle authentication errors
 */
function handleAuthError(error: unknown, res: Response): void {
  if (error instanceof AuthError) {
    switch (error.type) {
      case AuthErrorType.TOKEN_EXPIRED:
      case AuthErrorType.SESSION_EXPIRED:
        res.status(401).json({ error: 'Session expired' });
        break;
      case AuthErrorType.TOKEN_INVALID:
        res.status(401).json({ error: 'Invalid token' });
        break;
      case AuthErrorType.INSUFFICIENT_PERMISSIONS:
        res.status(403).json({ error: 'Insufficient permissions' });
        break;
      default:
        res.status(401).json({ error: 'Authentication failed' });
    }
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
}