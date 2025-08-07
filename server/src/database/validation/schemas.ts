import { Document } from 'mongodb';

/**
 * MongoDB schema validation rules
 * https://docs.mongodb.com/manual/core/schema-validation/
 */

/**
 * Base document validation rules
 */
export const baseDocumentSchema = {
  bsonType: 'object',
  required: ['createdAt', 'updatedAt'],
  properties: {
    createdAt: { bsonType: 'date' },
    updatedAt: { bsonType: 'date' },
  },
};

/**
 * Version document validation rules
 */
export const versionedDocumentSchema = {
  bsonType: 'object',
  required: ['currentVersion'],
  properties: {
    currentVersion: { bsonType: 'int' },
    ...baseDocumentSchema.properties,
  },
};

/**
 * Base version document validation rules
 */
export const baseVersionSchema = {
  bsonType: 'object',
  required: ['documentId', 'version', 'timestamp', 'changedBy'],
  properties: {
    documentId: { bsonType: 'objectId' },
    version: { bsonType: 'int' },
    timestamp: { bsonType: 'date' },
    changedBy: { bsonType: 'objectId' },
    changeReason: { bsonType: 'string' },
    ...baseDocumentSchema.properties,
  },
};

/**
 * User document validation rules
 */
export const userSchema = {
  bsonType: 'object',
  required: ['email', 'password', 'lastLoginAt'],
  properties: {
    email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
    password: { bsonType: 'string', minLength: 60, maxLength: 60 }, // bcrypt hash
    lastLoginAt: { bsonType: 'date' },
    ...baseDocumentSchema.properties,
  },
};

/**
 * Deck document validation rules
 */
export const deckSchema = {
  bsonType: 'object',
  required: ['userId', 'name', 'theme', 'status'],
  properties: {
    userId: { bsonType: 'objectId' },
    name: { bsonType: 'string', minLength: 1, maxLength: 100 },
    theme: {
      bsonType: 'object',
      required: ['name', 'description', 'keywords'],
      properties: {
        name: { bsonType: 'string', minLength: 1, maxLength: 100 },
        description: { bsonType: 'string', minLength: 1, maxLength: 1000 },
        keywords: {
          bsonType: 'array',
          minItems: 1,
          maxItems: 10,
          items: { bsonType: 'string' },
        },
        style: { bsonType: 'string' },
        mood: { bsonType: 'string' },
      },
    },
    status: { 
      bsonType: 'string',
      enum: ['draft', 'published', 'archived'],
    },
    ...versionedDocumentSchema.properties,
  },
};

/**
 * Card document validation rules
 */
export const cardSchema = {
  bsonType: 'object',
  required: ['deckId', 'originalCard', 'status'],
  properties: {
    deckId: { bsonType: 'objectId' },
    originalCard: {
      bsonType: 'object',
      required: ['id', 'name', 'oracle_id'],
      properties: {
        id: { bsonType: 'string' },
        name: { bsonType: 'string' },
        oracle_id: { bsonType: 'string' },
      },
    },
    status: {
      bsonType: 'string',
      enum: ['pending', 'processing', 'completed', 'error'],
    },
    ...versionedDocumentSchema.properties,
  },
};

/**
 * Deck version document validation rules
 */
export const deckVersionSchema = {
  bsonType: 'object',
  required: ['name', 'theme'],
  properties: {
    name: { bsonType: 'string', minLength: 1, maxLength: 100 },
    theme: {
      bsonType: 'object',
      required: ['name', 'description', 'keywords'],
      properties: {
        name: { bsonType: 'string', minLength: 1, maxLength: 100 },
        description: { bsonType: 'string', minLength: 1, maxLength: 1000 },
        keywords: {
          bsonType: 'array',
          minItems: 1,
          maxItems: 10,
          items: { bsonType: 'string' },
        },
        style: { bsonType: 'string' },
        mood: { bsonType: 'string' },
      },
    },
    ...baseVersionSchema.properties,
  },
};

/**
 * Card version document validation rules
 */
export const cardVersionSchema = {
  bsonType: 'object',
  required: ['thematicName', 'flavorText', 'artPrompt'],
  properties: {
    thematicName: { bsonType: 'string', minLength: 1, maxLength: 100 },
    flavorText: { bsonType: 'string', minLength: 1, maxLength: 500 },
    artPrompt: { bsonType: 'string', minLength: 1, maxLength: 1000 },
    imageUrl: { bsonType: 'string' },
    rerollAspects: {
      bsonType: 'array',
      items: {
        bsonType: 'string',
        enum: ['name', 'flavor', 'art'],
      },
    },
    ...baseVersionSchema.properties,
  },
};