import { Db } from 'mongodb';
import { Migration } from './migration-manager';
import {
  userSchema,
  deckSchema,
  cardSchema,
  deckVersionSchema,
  cardVersionSchema,
} from '../validation/schemas';
import {
  userIndexes,
  deckIndexes,
  cardIndexes,
  deckVersionIndexes,
  cardVersionIndexes,
} from '../indexes/config';

const migration: Migration = {
  version: 1,
  name: 'initial-setup',
  timestamp: new Date('2025-08-07T03:52:00Z'),
  description: 'Initial database setup with collections, validation rules, and indexes',
  
  async up(db: Db): Promise<void> {
    // Create collections with validation
    await db.createCollection('users', {
      validator: { $jsonSchema: userSchema },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    await db.createCollection('decks', {
      validator: { $jsonSchema: deckSchema },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    await db.createCollection('cards', {
      validator: { $jsonSchema: cardSchema },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    await db.createCollection('deck_versions', {
      validator: { $jsonSchema: deckVersionSchema },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    await db.createCollection('card_versions', {
      validator: { $jsonSchema: cardVersionSchema },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    // Create indexes
    await db.collection('users').createIndexes(userIndexes);
    await db.collection('decks').createIndexes(deckIndexes);
    await db.collection('cards').createIndexes(cardIndexes);
    await db.collection('deck_versions').createIndexes(deckVersionIndexes);
    await db.collection('card_versions').createIndexes(cardVersionIndexes);
  },

  async down(db: Db): Promise<void> {
    // Drop collections in reverse order
    await db.collection('card_versions').drop();
    await db.collection('deck_versions').drop();
    await db.collection('cards').drop();
    await db.collection('decks').drop();
    await db.collection('users').drop();
  },
};

export default migration;