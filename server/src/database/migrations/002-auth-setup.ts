import { Db } from 'mongodb';
import { Migration } from './migration-manager';
import { userValidation, sessionValidation, userIndexes, sessionIndexes } from '../../types/auth';

const migration: Migration = {
  version: 2,
  name: 'auth-setup',
  timestamp: new Date('2025-08-07T03:56:00Z'),
  description: 'Set up authentication collections with validation and indexes',
  
  async up(db: Db): Promise<void> {
    // Create users collection
    await db.createCollection('users', {
      validator: { $jsonSchema: userValidation },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    // Create sessions collection
    await db.createCollection('sessions', {
      validator: { $jsonSchema: sessionValidation },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    // Create indexes
    await db.collection('users').createIndexes(userIndexes);
    await db.collection('sessions').createIndexes(sessionIndexes);
  },

  async down(db: Db): Promise<void> {
    // Drop collections in reverse order
    await db.collection('sessions').drop();
    await db.collection('users').drop();
  },
};

export default migration;