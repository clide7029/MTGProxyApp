# Database Implementation Plan

## 1. Initial Setup

### 1.1 Collection Creation
```typescript
// In server/src/database/setup.ts
async function setupCollections() {
  const collections = [
    {
      name: 'users',
      validator: userSchema,
      indices: [
        { email: 1 },
        { createdAt: -1 }
      ]
    },
    {
      name: 'decks',
      validator: deckSchema,
      indices: [
        { userId: 1 },
        { 'theme.name': 1 },
        { status: 1 },
        { updatedAt: -1 }
      ]
    },
    // ... other collections
  ];
  
  for (const collection of collections) {
    await createCollection(collection);
  }
}
```

### 1.2 Directory Structure
```
server/src/database/
├── setup/
│   ├── index.ts
│   ├── collections.ts
│   ├── indexes.ts
│   └── validators.ts
├── migrations/
│   ├── framework.ts
│   └── versions/
│       ├── 001_initial_schema.ts
│       └── 002_add_version_support.ts
├── models/
│   ├── user.ts
│   ├── deck.ts
│   └── card.ts
└── version-control/
    ├── types.ts
    ├── manager.ts
    └── operations.ts
```

## 2. Version Control Implementation

### 2.1 Version Manager Class
```typescript
class VersionManager<T extends VersionedDocument> {
  constructor(
    private collection: Collection<T>,
    private versionCollection: Collection<VersionDocument<T>>,
    private options: VersionManagerOptions
  ) {}

  async createVersion(
    documentId: ObjectId,
    changes: Partial<T>,
    metadata: VersionMetadata
  ): Promise<number> {
    // Implementation details in code
  }

  async rollback(
    documentId: ObjectId,
    options: RollbackOptions
  ): Promise<T> {
    // Implementation details in code
  }

  async getHistory(
    documentId: ObjectId,
    options?: HistoryOptions
  ): Promise<VersionHistory<T>> {
    // Implementation details in code
  }
}
```

### 2.2 Version Control Operations
1. Create Version:
   - Increment version number
   - Store complete snapshot
   - Update current document
   - Record metadata

2. Rollback:
   - Verify target version exists
   - Create new version with old content
   - Update current document
   - Record rollback metadata

3. View History:
   - Query version collection
   - Sort by version number
   - Apply any filters

## 3. Migration System

### 3.1 Migration Framework
```typescript
interface Migration {
  version: number;
  name: string;
  up(): Promise<void>;
  down(): Promise<void>;
}

class MigrationManager {
  private migrations: Migration[] = [];

  register(migration: Migration): void {
    this.migrations.push(migration);
  }

  async migrate(targetVersion?: number): Promise<void> {
    // Implementation details in code
  }

  async rollback(steps: number = 1): Promise<void> {
    // Implementation details in code
  }
}
```

### 3.2 Example Migration
```typescript
// migrations/versions/002_add_version_support.ts
export default {
  version: 2,
  name: 'add_version_support',
  
  async up() {
    // Add version fields
    await db.decks.updateMany({}, {
      $set: { currentVersion: 1 }
    });
    
    // Create version records
    const decks = await db.decks.find().toArray();
    for (const deck of decks) {
      await db.deckVersions.insertOne({
        deckId: deck._id,
        version: 1,
        ...deck,
        timestamp: new Date(),
        changedBy: deck.userId
      });
    }
  },
  
  async down() {
    // Remove version fields
    await db.decks.updateMany({}, {
      $unset: { currentVersion: "" }
    });
    
    // Drop version collections
    await db.deckVersions.drop();
  }
};
```

## 4. Implementation Guidelines

### 4.1 Version Control Rules
1. Every update must go through version manager
2. Version numbers are immutable and sequential
3. Store complete snapshots for reliable rollbacks
4. Include metadata with every version
5. Maintain referential integrity

### 4.2 Schema Validation Rules
1. Required fields must always be present
2. Types must match specifications exactly
3. Enums must use predefined values
4. Arrays should have reasonable limits
5. Nested objects should be validated

### 4.3 Index Optimization Rules
1. Support common query patterns
2. Consider compound indexes for filters
3. Use text indexes for search
4. Monitor index usage
5. Balance index size with performance

### 4.4 Error Handling
1. Version conflicts
2. Validation failures
3. Migration errors
4. Rollback failures
5. Concurrent modifications

## 5. Testing Strategy

### 5.1 Unit Tests
```typescript
describe('VersionManager', () => {
  it('should create new versions', async () => {
    // Test implementation
  });

  it('should handle rollbacks', async () => {
    // Test implementation
  });

  it('should maintain version history', async () => {
    // Test implementation
  });
});
```

### 5.2 Integration Tests
```typescript
describe('Database Migrations', () => {
  it('should apply migrations in order', async () => {
    // Test implementation
  });

  it('should rollback migrations successfully', async () => {
    // Test implementation
  });
});
```

## 6. Performance Considerations

### 6.1 Indexing Strategy
- Create indexes before inserting data
- Monitor index usage and size
- Use compound indexes for common queries
- Consider partial indexes for filtered queries

### 6.2 Version Control Optimization
- Limit version history size
- Archive old versions
- Compress version data
- Use change-only versioning for large documents

### 6.3 Batch Operations
- Use bulk operations when possible
- Process versions in batches
- Implement retry mechanisms
- Handle partial failures

## Next Steps

1. Switch to Code mode
2. Create database setup files
3. Implement version control system
4. Set up migration framework
5. Add initial migrations
6. Write tests
7. Monitor performance

Remember to maintain type safety throughout the implementation and ensure all operations are properly versioned.