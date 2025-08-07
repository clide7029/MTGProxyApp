# Database TypeScript Types

## Base Types

```typescript
interface BaseDocument {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface VersionedDocument extends BaseDocument {
  currentVersion: number;
}
```

## User Types

```typescript
interface UserDocument extends BaseDocument {
  email: string;
  password: string; // Hashed
  lastLoginAt: Date;
}
```

## Deck Types

```typescript
interface DeckDocument extends VersionedDocument {
  userId: ObjectId;
  name: string;
  theme: ThemeConfig;
  status: DeckStatus;
}

interface ThemeConfig {
  name: string;
  setting?: string;
  specifics: Array<CardThemeSpecification>;
}

interface CardThemeSpecification {
  cardName: string;
  thematicReference: string;
}

interface DeckVersionDocument extends BaseDocument {
  deckId: ObjectId;
  version: number;
  name: string;
  theme: ThemeConfig;
  timestamp: Date;
  changedBy: ObjectId;
  changeReason?: string;
}
```

## Card Types

```typescript
interface CardDocument extends VersionedDocument {
  deckId: ObjectId;
  originalCard: ScryfallCard;
  status: ProxyStatus;
}

interface CardVersionDocument extends BaseDocument {
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
```

## Enum Types

```typescript
enum DeckStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

enum ProxyStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

enum RerollAspect {
  NAME = 'name',
  FLAVOR = 'flavor',
  ART = 'art',
  ALL = 'all'
}
```

## Version Control Types

```typescript
interface VersionMetadata {
  version: number;
  timestamp: Date;
  changedBy: ObjectId;
  changeReason?: string;
}

interface VersionChange<T> {
  before: Partial<T>;
  after: Partial<T>;
  metadata: VersionMetadata;
}

interface VersionHistory<T> {
  documentId: ObjectId;
  changes: Array<VersionChange<T>>;
}
```

## Database Operations Types

```typescript
interface VersionedUpdateOptions {
  userId: ObjectId;
  changeReason?: string;
}

interface RollbackOptions extends VersionedUpdateOptions {
  targetVersion: number;
}

interface RerollOptions extends VersionedUpdateOptions {
  aspects: Array<RerollAspect>;
}
```

## Implementation Notes

1. Version Control Operations:
   - Every update to a versioned document creates a new version
   - Version numbers are sequential and increment by 1
   - Each version stores a complete snapshot for rollback support

2. Relationships:
   - Users -> Decks (1:Many)
   - Decks -> Cards (1:Many)
   - Documents -> Versions (1:Many)

3. Indexing:
   - All `_id` fields are automatically indexed
   - `currentVersion` field for quick access to latest
   - Compound indexes on version collections for efficient history queries

4. Type Usage Example:

```typescript
async function updateDeck(
  deckId: ObjectId, 
  update: Partial<DeckDocument>,
  options: VersionedUpdateOptions
): Promise<DeckDocument> {
  const deck = await decks.findOne({ _id: deckId });
  if (!deck) throw new Error('Deck not found');

  const newVersion = deck.currentVersion + 1;
  
  // Create version record
  await deckVersions.insertOne({
    deckId: deck._id,
    version: newVersion,
    ...deck,
    timestamp: new Date(),
    changedBy: options.userId,
    changeReason: options.changeReason
  });

  // Update current document
  return await decks.findOneAndUpdate(
    { _id: deckId },
    { 
      $set: { 
        ...update,
        currentVersion: newVersion,
        updatedAt: new Date()
      } 
    },
    { returnDocument: 'after' }
  );
}
```

5. Migration Support:
   - Types support both old and new schema versions
   - Version history maintains data integrity during migrations
   - Rollback operations preserve schema compatibility

These types will be implemented in:
- `shared/src/types/database.ts` for database models
- `shared/src/types/version.ts` for version control
- `shared/src/types/operations.ts` for database operations

Next steps:
1. Switch to Code mode
2. Create the type definition files
3. Update existing code to use new types
4. Implement database operations with version support