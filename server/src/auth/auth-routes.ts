import express from 'express';
import { Collection } from 'mongodb';
import { AuthController } from './auth-controller';
import { createAuthMiddleware } from './auth-middleware';
import { SessionDocument, UserDocument } from '../types/auth';
import { validateSchema } from '../middleware/validation';
import { z } from 'zod';

/**
 * Registration request schema
 */
const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Login request schema
 */
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/**
 * Password change schema
 */
const passwordChangeSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Create auth routes
 */
export function createAuthRouter(
  userCollection: Collection<UserDocument>,
  sessionCollection: Collection<SessionDocument>,
  jwtSecret?: string
) {
  const router = express.Router();
  const controller = new AuthController(userCollection, sessionCollection, jwtSecret);
  const { requireAuth } = createAuthMiddleware(userCollection, sessionCollection, jwtSecret);

  /**
   * Register new user
   * @route POST /auth/register
   */
  router.post(
    '/register',
    validateSchema(registrationSchema),
    controller.register.bind(controller)
  );

  /**
   * Login user
   * @route POST /auth/login
   */
  router.post(
    '/login',
    validateSchema(loginSchema),
    controller.login.bind(controller)
  );

  /**
   * Logout user
   * @route POST /auth/logout
   */
  router.post(
    '/logout',
    requireAuth,
    controller.logout.bind(controller)
  );

  /**
   * Change password
   * @route POST /auth/change-password
   */
  router.post(
    '/change-password',
    requireAuth,
    validateSchema(passwordChangeSchema),
    controller.changePassword.bind(controller)
  );

  /**
   * Get current user
   * @route GET /auth/me
   */
  router.get(
    '/me',
    requireAuth,
    controller.getCurrentUser.bind(controller)
  );

  return router;
}