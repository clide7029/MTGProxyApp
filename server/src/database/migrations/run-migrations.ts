import { MongoClient, Db } from 'mongodb';
import { MigrationManager } from './migration-manager';
import initialSetup from './001-initial-setup';

async function runMigrations(): Promise<void> {
  let client: MongoClient | null = null;

  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mtg_proxy_app';
    client = await MongoClient.connect(uri);
    const db: Db = client.db();

    console.log('Connected to database');
    console.log('Running migrations...');

    const manager = new MigrationManager(db);

    // Register all migrations in order
    manager.register(initialSetup);
    // Add new migrations here as they are created
    // manager.register(nextMigration);

    // Check current state
    const isUpToDate = await manager.isUpToDate();
    if (isUpToDate) {
      console.log('Database is up to date, no migrations needed');
      return;
    }

    // Run pending migrations
    await manager.migrate();
    console.log('Migrations completed successfully');

    // Display migration history
    const history = await manager.getHistory();
    console.log('\nMigration History:');
    history.forEach(record => {
      const status = record.status === 'completed' ? '✅' : record.status === 'failed' ? '❌' : '⏮️';
      console.log(
        `${status} v${record.version} - ${record.name} (${record.appliedAt.toISOString()})`
      );
      if (record.error) {
        console.error(`   Error: ${record.error}`);
      }
    });

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('Database connection closed');
    }
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations().catch(console.error);
}

export { runMigrations };