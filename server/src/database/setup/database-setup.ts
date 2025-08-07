import { Db, Collection } from 'mongodb';
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
  initializeIndexes,
} from '../indexes/config';

/**
 * Collection names
 */
export const COLLECTIONS = {
  USERS: 'users',
  DECKS: 'decks',
  CARDS: 'cards',
  DECK_VERSIONS: 'deck_versions',
  CARD_VERSIONS: 'card_versions',
} as const;

/**
 * Database setup configuration
 */
interface CollectionSetup {
  name: string;
  validationSchema: object;
  indexes: any[];
}

const collections: CollectionSetup[] = [
  {
    name: COLLECTIONS.USERS,
    validationSchema: userSchema,
    indexes: userIndexes,
  },
  {
    name: COLLECTIONS.DECKS,
    validationSchema: deckSchema,
    indexes: deckIndexes,
  },
  {
    name: COLLECTIONS.CARDS,
    validationSchema: cardSchema,
    indexes: cardIndexes,
  },
  {
    name: COLLECTIONS.DECK_VERSIONS,
    validationSchema: deckVersionSchema,
    indexes: deckVersionIndexes,
  },
  {
    name: COLLECTIONS.CARD_VERSIONS,
    validationSchema: cardVersionSchema,
    indexes: cardVersionIndexes,
  },
];

/**
 * Setup validation rules for a collection
 */
async function setupCollectionValidation(
  db: Db,
  collectionName: string,
  schema: object
): Promise<void> {
  try {
    await db.command({
      collMod: collectionName,
      validator: { $jsonSchema: schema },
      validationLevel: 'strict',
      validationAction: 'error',
    });
  } catch (error) {
    if ((error as any).code === 26) {
      // Collection doesn't exist, create it with validation
      await db.createCollection(collectionName, {
        validator: { $jsonSchema: schema },
        validationLevel: 'strict',
        validationAction: 'error',
      });
    } else {
      throw error;
    }
  }
}

/**
 * Initialize database collections with validation and indexes
 */
export async function initializeDatabase(db: Db): Promise<void> {
  try {
    // Setup collections with validation rules
    for (const collection of collections) {
      await setupCollectionValidation(db, collection.name, collection.validationSchema);
    }

    // Initialize indexes
    const collectionInstances = {
      users: db.collection(COLLECTIONS.USERS),
      decks: db.collection(COLLECTIONS.DECKS),
      cards: db.collection(COLLECTIONS.CARDS),
      deckVersions: db.collection(COLLECTIONS.DECK_VERSIONS),
      cardVersions: db.collection(COLLECTIONS.CARD_VERSIONS),
    };

    await initializeIndexes(collectionInstances);

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get typed collection instances
 */
export interface DatabaseCollections {
  users: Collection;
  decks: Collection;
  cards: Collection;
  deckVersions: Collection;
  cardVersions: Collection;
}

export function getCollections(db: Db): DatabaseCollections {
  return {
    users: db.collection(COLLECTIONS.USERS),
    decks: db.collection(COLLECTIONS.DECKS),
    cards: db.collection(COLLECTIONS.CARDS),
    deckVersions: db.collection(COLLECTIONS.DECK_VERSIONS),
    cardVersions: db.collection(COLLECTIONS.CARD_VERSIONS),
  };
}