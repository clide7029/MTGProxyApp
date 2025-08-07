import { ObjectId } from 'mongodb';
import { DeckStatus, ProxyStatus, RerollAspect } from './enums';
import { ScryfallCard, ThemeConfiguration } from './index';

/**
 * Base interface for all database documents
 */
export interface BaseDocument {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for documents that support versioning
 */
export interface VersionedDocument extends BaseDocument {
  currentVersion: number;
}

/**
 * User document stored in the database
 */
export interface UserDocument extends BaseDocument {
  email: string;
  password: string; // Hashed
  lastLoginAt: Date;
}

/**
 * Deck document stored in the database
 */
export interface DeckDocument extends VersionedDocument {
  userId: ObjectId;
  name: string;
  theme: ThemeConfiguration;
  status: DeckStatus;
}

/**
 * Card document stored in the database
 */
export interface CardDocument extends VersionedDocument {
  deckId: ObjectId;
  originalCard: ScryfallCard;
  status: ProxyStatus;
}

/**
 * Version history for deck documents
 */
export interface DeckVersionDocument extends BaseDocument {
  deckId: ObjectId;
  version: number;
  name: string;
  theme: ThemeConfiguration;
  timestamp: Date;
  changedBy: ObjectId;
  changeReason?: string;
}

/**
 * Version history for card documents
 */
export interface CardVersionDocument extends BaseDocument {
  cardId: ObjectId;
  version: number;
  thematicName: string;
  flavorText: string;
  artPrompt: string;
  imageUrl?: string;
  timestamp: Date;
  changedBy: ObjectId;
  changeReason?: string;
  rerollAspects?: Array<RerollAspect>;
}

/**
 * Common version metadata
 */
export interface VersionMetadata {
  version: number;
  timestamp: Date;
  changedBy: ObjectId;
  changeReason?: string;
}

/**
 * Options for version-controlled updates
 */
export interface VersionedUpdateOptions {
  userId: ObjectId;
  changeReason?: string;
}

/**
 * Options for rolling back to a previous version
 */
export interface RollbackOptions extends VersionedUpdateOptions {
  targetVersion: number;
}

/**
 * Options for rerolling card aspects
 */
export interface RerollOptions extends VersionedUpdateOptions {
  aspects: Array<RerollAspect>;
}

/**
 * Options for retrieving version history
 */
export interface HistoryOptions {
  limit?: number;
  skip?: number;
  fromVersion?: number;
  toVersion?: number;
}

/**
 * Structure for version change records
 */
export interface VersionChange<T> {
  before: Partial<T>;
  after: Partial<T>;
  metadata: VersionMetadata;
}

/**
 * Complete version history for a document
 */
export interface VersionHistory<T> {
  documentId: ObjectId;
  changes: Array<VersionChange<T>>;
  total: number;
}