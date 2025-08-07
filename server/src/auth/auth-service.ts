import { Collection, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  AuthError,
  AuthErrorType,
  AuthResult,
  LoginCredentials,
  PasswordChangeData,
  RegistrationData,
  Session,
  UserRole,
} from './types';
import { SessionDocument, UserDocument } from '../types/auth';

export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly TOKEN_EXPIRY = '24h';
  private readonly JWT_SECRET: string;

  constructor(
    private readonly userCollection: Collection<UserDocument>,
    private readonly sessionCollection: Collection<SessionDocument>,
    jwtSecret?: string
  ) {
    this.JWT_SECRET = jwtSecret || process.env.JWT_SECRET || 'your-secret-key';
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET must be provided');
    }
  }

  /**
   * Register a new user
   */
  async register(data: RegistrationData): Promise<AuthResult> {
    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      throw new AuthError(AuthErrorType.PASSWORD_MISMATCH, 'Passwords do not match');
    }

    // Check if email already exists
    const existingUser = await this.userCollection.findOne({ email: data.email });
    if (existingUser) {
      throw new AuthError(AuthErrorType.EMAIL_IN_USE, 'Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Create user
    const now = new Date();
    const result = await this.userCollection.insertOne({
      email: data.email,
      password: hashedPassword,
      role: UserRole.USER,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Create session
    return this.createSession(result.insertedId, UserRole.USER);
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Find user
    const user = await this.userCollection.findOne({ email: credentials.email });
    if (!user) {
      throw new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(credentials.password, user.password);
    if (!passwordValid) {
      throw new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password');
    }

    // Update last login
    await this.userCollection.updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date() } }
    );

    // Create session
    return this.createSession(user._id, user.role);
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<void> {
    await this.sessionCollection.deleteOne({ token });
  }

  /**
   * Verify session token
   */
  async verifyToken(token: string): Promise<Session> {
    try {
      // Verify JWT
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
      const userId = new ObjectId(decoded.userId);

      // Get session
      const session = await this.sessionCollection.findOne({ token });
      if (!session) {
        throw new AuthError(AuthErrorType.TOKEN_INVALID, 'Invalid token');
      }

      // Check expiration
      if (new Date() > session.expiresAt) {
        await this.sessionCollection.deleteOne({ token });
        throw new AuthError(AuthErrorType.SESSION_EXPIRED, 'Session expired');
      }

      // Update last activity
      await this.sessionCollection.updateOne(
        { token },
        { $set: { lastActivityAt: new Date() } }
      );

      return {
        userId: session.userId,
        token: session.token,
        role: session.role,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(AuthErrorType.TOKEN_INVALID, 'Invalid token');
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: ObjectId, data: PasswordChangeData): Promise<void> {
    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      throw new AuthError(AuthErrorType.PASSWORD_MISMATCH, 'Passwords do not match');
    }

    // Get user
    const user = await this.userCollection.findOne({ _id: userId });
    if (!user) {
      throw new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'User not found');
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!passwordValid) {
      throw new AuthError(AuthErrorType.INVALID_PASSWORD, 'Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, this.SALT_ROUNDS);

    // Update password
    await this.userCollection.updateOne(
      { _id: userId },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date(),
        } 
      }
    );

    // Invalidate all sessions
    await this.sessionCollection.deleteMany({ userId });
  }

  /**
   * Create session
   */
  private async createSession(userId: ObjectId, role: UserRole): Promise<AuthResult> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    // Create JWT
    const token = jwt.sign({ userId: userId.toString() }, this.JWT_SECRET, {
      expiresIn: this.TOKEN_EXPIRY,
    });

    // Create session
    const session: SessionDocument = {
      userId,
      token,
      role,
      expiresAt,
      lastActivityAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await this.sessionCollection.insertOne(session);

    return {
      userId,
      token,
      role,
      expiresAt,
    };
  }
}