import { Db } from 'mongodb';

/**
 * Interface for migration metadata
 */
interface MigrationMeta {
  version: number;
  name: string;
  timestamp: Date;
  description: string;
}

/**
 * Interface for migration implementation
 */
export interface Migration extends MigrationMeta {
  up: (db: Db) => Promise<void>;
  down: (db: Db) => Promise<void>;
}

/**
 * Interface for migration history record
 */
interface MigrationRecord extends MigrationMeta {
  appliedAt: Date;
  status: 'completed' | 'failed' | 'reverted';
  error?: string;
}

/**
 * Migration manager class
 */
export class MigrationManager {
  private readonly MIGRATION_COLLECTION = '_migrations';
  private migrations: Migration[] = [];

  constructor(private db: Db) {}

  /**
   * Register a new migration
   */
  register(migration: Migration): void {
    this.migrations.push(migration);
    // Sort migrations by version to ensure correct order
    this.migrations.sort((a, b) => a.version - b.version);
  }

  /**
   * Get current database version
   */
  private async getCurrentVersion(): Promise<number> {
    const collection = this.db.collection<MigrationRecord>(this.MIGRATION_COLLECTION);
    const lastMigration = await collection
      .find({ status: 'completed' })
      .sort({ version: -1 })
      .limit(1)
      .toArray();

    return lastMigration.length > 0 ? lastMigration[0].version : 0;
  }

  /**
   * Get pending migrations
   */
  private async getPendingMigrations(): Promise<Migration[]> {
    const currentVersion = await this.getCurrentVersion();
    return this.migrations.filter(m => m.version > currentVersion);
  }

  /**
   * Apply a single migration
   */
  private async applyMigration(migration: Migration): Promise<void> {
    const collection = this.db.collection<MigrationRecord>(this.MIGRATION_COLLECTION);
    const record: MigrationRecord = {
      version: migration.version,
      name: migration.name,
      timestamp: migration.timestamp,
      description: migration.description,
      appliedAt: new Date(),
      status: 'completed',
    };

    try {
      await migration.up(this.db);
      await collection.insertOne(record);
      console.log(`Applied migration ${migration.version}: ${migration.name}`);
    } catch (error) {
      record.status = 'failed';
      record.error = error instanceof Error ? error.message : String(error);
      await collection.insertOne(record);
      throw new Error(
        `Failed to apply migration ${migration.version}: ${migration.name}\n${record.error}`
      );
    }
  }

  /**
   * Revert a single migration
   */
  private async revertMigration(migration: Migration): Promise<void> {
    const collection = this.db.collection<MigrationRecord>(this.MIGRATION_COLLECTION);
    const record: MigrationRecord = {
      version: migration.version,
      name: migration.name,
      timestamp: migration.timestamp,
      description: migration.description,
      appliedAt: new Date(),
      status: 'reverted',
    };

    try {
      await migration.down(this.db);
      await collection.insertOne(record);
      console.log(`Reverted migration ${migration.version}: ${migration.name}`);
    } catch (error) {
      record.status = 'failed';
      record.error = error instanceof Error ? error.message : String(error);
      await collection.insertOne(record);
      throw new Error(
        `Failed to revert migration ${migration.version}: ${migration.name}\n${record.error}`
      );
    }
  }

  /**
   * Run pending migrations up to target version
   */
  async migrate(targetVersion?: number): Promise<void> {
    const collection = this.db.collection(this.MIGRATION_COLLECTION);
    
    // Ensure migration collection exists with index
    await collection.createIndex({ version: 1 }, { unique: true });
    await collection.createIndex({ status: 1 });

    const pendingMigrations = await this.getPendingMigrations();
    const migrationsToApply = targetVersion
      ? pendingMigrations.filter(m => m.version <= targetVersion)
      : pendingMigrations;

    for (const migration of migrationsToApply) {
      await this.applyMigration(migration);
    }
  }

  /**
   * Rollback migrations down to target version
   */
  async rollback(targetVersion: number): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const migrationsToRevert = this.migrations
      .filter(m => m.version > targetVersion && m.version <= currentVersion)
      .reverse();

    for (const migration of migrationsToRevert) {
      await this.revertMigration(migration);
    }
  }

  /**
   * Get migration history
   */
  async getHistory(): Promise<MigrationRecord[]> {
    const collection = this.db.collection<MigrationRecord>(this.MIGRATION_COLLECTION);
    return collection.find().sort({ version: -1 }).toArray();
  }

  /**
   * Check if database is up to date
   */
  async isUpToDate(): Promise<boolean> {
    const currentVersion = await this.getCurrentVersion();
    const latestVersion = this.migrations.length > 0
      ? this.migrations[this.migrations.length - 1].version
      : 0;
    return currentVersion === latestVersion;
  }
}