import { Collection, ObjectId, UpdateFilter, Filter, WithId } from 'mongodb';
import {
  BaseVersionDocument,
  HistoryOptions,
  MongoDoc,
  MongoFilter,
  MongoInsert,
  RollbackOptions,
  ToVersionDocument,
  VersionChange,
  VersionHistory,
  VersionedDocument,
  VersionedUpdateOptions,
} from '../../types/database';

/**
 * Manages version control for MongoDB documents
 */
export class VersionControlManager<
  TDoc extends VersionedDocument,
  TVersion extends BaseVersionDocument
> {
  constructor(
    private collection: Collection<TDoc>,
    private versionCollection: Collection<TVersion>
  ) {}

  /**
   * Creates a new document with version tracking
   */
  async create(doc: MongoInsert<TDoc>, options: VersionedUpdateOptions): Promise<MongoDoc<TDoc>> {
    const now = new Date();
    const initialDoc = {
      ...doc,
      createdAt: now,
      updatedAt: now,
      currentVersion: 1,
    } as MongoInsert<TDoc>;

    const result = await this.collection.insertOne(initialDoc);
    const insertedDoc = { ...initialDoc, _id: result.insertedId } as MongoDoc<TDoc>;

    // Create initial version document
    const versionFields = this.extractVersionFields<TDoc>(insertedDoc);
    const versionDoc: MongoInsert<TVersion> = {
      documentId: result.insertedId,
      version: 1,
      timestamp: now,
      changedBy: options.userId,
      changeReason: options.changeReason || 'Initial version',
      createdAt: now,
      updatedAt: now,
      ...versionFields,
    } as unknown as MongoInsert<TVersion>;

    await this.versionCollection.insertOne(versionDoc);
    return insertedDoc;
  }

  /**
   * Updates a document and creates a new version
   */
  async update(
    filter: MongoFilter<TDoc>,
    update: Partial<Omit<TDoc, '_id'>>,
    options: VersionedUpdateOptions
  ): Promise<MongoDoc<TDoc>> {
    const doc = await this.collection.findOne(filter);
    if (!doc) {
      throw new Error('Document not found');
    }

    const now = new Date();
    const nextVersion = doc.currentVersion + 1;

    // Create new version document before updating
    const versionFields = this.extractVersionFields<TDoc>(doc);
    const versionDoc: MongoInsert<TVersion> = {
      documentId: doc._id,
      version: nextVersion,
      timestamp: now,
      changedBy: options.userId,
      changeReason: options.changeReason,
      createdAt: now,
      updatedAt: now,
      ...versionFields,
    } as unknown as MongoInsert<TVersion>;

    await this.versionCollection.insertOne(versionDoc);

    // Prepare update with version metadata
    const updateDoc: UpdateFilter<TDoc> = {
      $set: {
        ...update,
        currentVersion: nextVersion,
        updatedAt: now,
      } as Partial<TDoc>,
    };

    const result = await this.collection.findOneAndUpdate(
      filter,
      updateDoc,
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Failed to update document');
    }

    return { ...result } as unknown as MongoDoc<TDoc>;
  }

  /**
   * Rolls back a document to a specific version
   */
  async rollback(filter: MongoFilter<TDoc>, options: RollbackOptions): Promise<MongoDoc<TDoc>> {
    const doc = await this.collection.findOne(filter);
    if (!doc) {
      throw new Error('Document not found');
    }

    const versionFilter: Filter<TVersion> = {
      documentId: doc._id,
      version: options.targetVersion,
    } as unknown as Filter<TVersion>;

    const versionDoc = await this.versionCollection.findOne(versionFilter);
    if (!versionDoc) {
      throw new Error(`Version ${options.targetVersion} not found`);
    }

    const now = new Date();
    const nextVersion = doc.currentVersion + 1;

    // Extract versioned fields and prepare update
    const versionedFields = this.extractVersionFields<TVersion>(versionDoc);
    const updateDoc: UpdateFilter<TDoc> = {
      $set: {
        ...versionedFields,
        currentVersion: nextVersion,
        updatedAt: now,
      } as Partial<TDoc>,
    };

    const result = await this.collection.findOneAndUpdate(
      filter,
      updateDoc,
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Failed to rollback document');
    }

    // Create new version document for rollback
    const newVersionDoc: MongoInsert<TVersion> = {
      documentId: doc._id,
      version: nextVersion,
      timestamp: now,
      changedBy: options.userId,
      changeReason: options.changeReason || `Rollback to version ${options.targetVersion}`,
      createdAt: now,
      updatedAt: now,
      ...versionedFields,
    } as unknown as MongoInsert<TVersion>;

    await this.versionCollection.insertOne(newVersionDoc);
    return { ...result } as unknown as MongoDoc<TDoc>;
  }

  /**
   * Retrieves version history for a document
   */
  async getHistory(
    documentId: ObjectId,
    options: HistoryOptions = {}
  ): Promise<VersionHistory<TDoc>> {
    const baseFilter = { documentId } as unknown as Filter<TVersion>;
    let filter: Filter<TVersion> = baseFilter;

    if (options.fromVersion || options.toVersion) {
      const versionFilter: { $gte?: number; $lte?: number } = {};
      if (options.fromVersion) versionFilter.$gte = options.fromVersion;
      if (options.toVersion) versionFilter.$lte = options.toVersion;
      filter = {
        ...baseFilter,
        version: versionFilter,
      } as unknown as Filter<TVersion>;
    }

    const versionDocs = await this.versionCollection
      .find(filter)
      .sort({ version: 1 })
      .skip(options.skip || 0)
      .limit(options.limit || 0)
      .toArray();

    const total = await this.versionCollection.countDocuments(filter);

    const changes: Array<VersionChange<TDoc>> = [];
    for (let i = 0; i < versionDocs.length - 1; i++) {
      const before = versionDocs[i];
      const after = versionDocs[i + 1];

      changes.push({
        before: this.extractVersionFields<TVersion>(before),
        after: this.extractVersionFields<TVersion>(after),
        metadata: {
          version: after.version,
          timestamp: after.timestamp,
          changedBy: after.changedBy,
          changeReason: after.changeReason,
        },
      });
    }

    return {
      documentId,
      changes,
      total,
    };
  }

  /**
   * Extracts version-specific fields from a document
   */
  private extractVersionFields<T extends TDoc | TVersion>(doc: WithId<T>): Partial<TDoc> {
    const excludeFields = [
      '_id',
      'documentId',
      'version',
      'timestamp',
      'changedBy',
      'changeReason',
      'createdAt',
      'updatedAt',
      'currentVersion',
    ];

    const result: Partial<TDoc> = {};
    for (const [key, value] of Object.entries(doc)) {
      if (!excludeFields.includes(key)) {
        (result as any)[key] = value;
      }
    }
    return result;
  }
}