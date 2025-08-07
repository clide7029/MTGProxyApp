import { Document, Filter, OptionalId, WithId, OptionalUnlessRequiredId } from 'mongodb';
import { ObjectId } from 'mongodb';
import { DeckStatus, ProxyStatus, RerollAspect, ScryfallCard, ThemeConfiguration } from './shared';

/**
 * Base document type with MongoDB ID
 */
export type WithMongoId<T> = WithId<T>;

/**
 * Base type for all database documents
 */
export interface BaseDocument {
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
 * Base version document interface
 */
export interface BaseVersionDocument extends BaseDocument {
  documentId: ObjectId;
  version: number;
  timestamp: Date;
  changedBy: ObjectId;
  changeReason?: string;
}

/**
 * Version history for deck documents
 */
export interface DeckVersionDocument extends BaseVersionDocument {
  name: string;
  theme: ThemeConfiguration;
}

/**
 * Version history for card documents
 */
export interface CardVersionDocument extends BaseVersionDocument {
  thematicName: string;
  flavorText: string;
  artPrompt: string;
  imageUrl?: string;
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

/**
 * MongoDB type helpers
 */
export type MongoDoc<T> = WithId<T>;
export type MongoFilter<T> = Filter<T>;
export type MongoInsert<T> = OptionalUnlessRequiredId<T>;
export type MongoUpdate<T> = Partial<Omit<T, '_id'>>;

/**
 * Helper to convert document to its version type
 */
export type ToVersionDocument<T extends VersionedDocument, V extends BaseVersionDocument> = 
  Omit<WithMongoId<T>, '_id'> & V;

/**
 * Convert ModifyResult to MongoDoc
 */
export function asMongoDoc<T>(doc: T & { _id: ObjectId }): MongoDoc<T> {
  return doc as MongoDoc<T>;
}