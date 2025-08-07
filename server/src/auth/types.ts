import { ObjectId } from 'mongodb';

/**
 * User role types
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

/**
 * User session data
 */
export interface Session {
  userId: ObjectId;
  token: string;
  role: UserRole;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
}

/**
 * Authentication result
 */
export interface AuthResult {
  userId: ObjectId;
  token: string;
  role: UserRole;
  expiresAt: Date;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegistrationData extends LoginCredentials {
  confirmPassword: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Password change data
 */
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Authorization error types
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  EMAIL_IN_USE = 'EMAIL_IN_USE',
  INVALID_RESET_TOKEN = 'INVALID_RESET_TOKEN',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
}

/**
 * Authorization error
 */
export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Resource access levels
 */
export enum AccessLevel {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  ADMIN = 3,
}

/**
 * Resource permissions
 */
export interface ResourcePermissions {
  userId: ObjectId;
  resourceId: ObjectId;
  resourceType: string;
  accessLevel: AccessLevel;
  grantedBy: ObjectId;
  grantedAt: Date;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  granted: boolean;
  requiredLevel: AccessLevel;
  actualLevel: AccessLevel;
}