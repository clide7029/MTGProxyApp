import { Collection, Document, IndexDescription } from 'mongodb';

/**
 * Index configurations for collections
 */

export const userIndexes: IndexDescription[] = [
  { key: { email: 1 }, unique: true },
  { key: { lastLoginAt: -1 } },
];

export const deckIndexes: IndexDescription[] = [
  // Core indexes
  { key: { userId: 1, status: 1 } },
  { key: { name: 1 } },
  { key: { currentVersion: -1 } },
  { key: { 'theme.name': 1 } },
  { key: { 'theme.keywords': 1 } },
  { key: { updatedAt: -1 } },
  
  // Compound indexes for common queries
  { key: { userId: 1, updatedAt: -1 } },
  { key: { status: 1, updatedAt: -1 } },
];

export const cardIndexes: IndexDescription[] = [
  // Core indexes
  { key: { deckId: 1 } },
  { key: { status: 1 } },
  { key: { currentVersion: -1 } },
  { key: { 'originalCard.id': 1 } },
  { key: { 'originalCard.oracle_id': 1 } },
  
  // Compound indexes for performance
  { key: { deckId: 1, status: 1 } },
  { key: { deckId: 1, currentVersion: -1 } },
];

export const deckVersionIndexes: IndexDescription[] = [
  // Core indexes
  { key: { documentId: 1 } },
  { key: { version: -1 } },
  { key: { timestamp: -1 } },
  { key: { changedBy: 1 } },
  
  // Compound indexes for version queries
  { key: { documentId: 1, version: -1 } },
  { key: { documentId: 1, timestamp: -1 } },
];

export const cardVersionIndexes: IndexDescription[] = [
  // Core indexes
  { key: { documentId: 1 } },
  { key: { version: -1 } },
  { key: { timestamp: -1 } },
  { key: { changedBy: 1 } },
  
  // Compound indexes for version queries
  { key: { documentId: 1, version: -1 } },
  { key: { documentId: 1, timestamp: -1 } },
];

/**
 * Helper function to ensure indexes exist
 */
export async function ensureIndexes<T extends Document>(
  collection: Collection<T>,
  indexes: IndexDescription[]
): Promise<void> {
  try {
    await collection.createIndexes(indexes);
  } catch (error) {
    console.error(`Failed to create indexes for collection ${collection.collectionName}:`, error);
    throw error;
  }
}

/**
 * Initialize all collection indexes
 */
export async function initializeIndexes(collections: {
  users: Collection<Document>;
  decks: Collection<Document>;
  cards: Collection<Document>;
  deckVersions: Collection<Document>;
  cardVersions: Collection<Document>;
}): Promise<void> {
  await Promise.all([
    ensureIndexes(collections.users, userIndexes),
    ensureIndexes(collections.decks, deckIndexes),
    ensureIndexes(collections.cards, cardIndexes),
    ensureIndexes(collections.deckVersions, deckVersionIndexes),
    ensureIndexes(collections.cardVersions, cardVersionIndexes),
  ]);
}