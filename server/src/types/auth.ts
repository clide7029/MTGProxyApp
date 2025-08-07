import { IndexDirection, ObjectId } from 'mongodb';
import { BaseDocument } from './database';
import { UserRole } from '../auth/types';

/**
 * User document stored in the database
 */
export interface UserDocument extends BaseDocument {
  email: string;
  password: string;
  role: UserRole;
  lastLoginAt: Date;
}

/**
 * Session document stored in the database
 */
export interface SessionDocument extends BaseDocument {
  userId: ObjectId;
  token: string;
  role: UserRole;
  expiresAt: Date;
  lastActivityAt: Date;
}

/**
 * MongoDB validation schemas for auth collections
 */
export const userValidation = {
  bsonType: 'object',
  required: ['email', 'password', 'role', 'lastLoginAt', 'createdAt', 'updatedAt'],
  properties: {
    email: {
      bsonType: 'string',
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    },
    password: {
      bsonType: 'string',
      minLength: 60,
      maxLength: 60,
    },
    role: {
      enum: ['user', 'admin'],
    },
    lastLoginAt: {
      bsonType: 'date',
    },
    createdAt: {
      bsonType: 'date',
    },
    updatedAt: {
      bsonType: 'date',
    },
  },
};

export const sessionValidation = {
  bsonType: 'object',
  required: ['userId', 'token', 'role', 'expiresAt', 'lastActivityAt', 'createdAt', 'updatedAt'],
  properties: {
    userId: {
      bsonType: 'objectId',
    },
    token: {
      bsonType: 'string',
    },
    role: {
      enum: ['user', 'admin'],
    },
    expiresAt: {
      bsonType: 'date',
    },
    lastActivityAt: {
      bsonType: 'date',
    },
    createdAt: {
      bsonType: 'date',
    },
    updatedAt: {
      bsonType: 'date',
    },
  },
};

/**
 * MongoDB indexes for auth collections
 */
export const userIndexes = [
  { key: { email: 1 as IndexDirection }, unique: true },
  { key: { role: 1 as IndexDirection } },
  { key: { lastLoginAt: -1 as IndexDirection } },
];

export const sessionIndexes = [
  { key: { token: 1 as IndexDirection }, unique: true },
  { key: { userId: 1 as IndexDirection } },
  { key: { expiresAt: 1 as IndexDirection } },
  { key: { lastActivityAt: 1 as IndexDirection } },
];