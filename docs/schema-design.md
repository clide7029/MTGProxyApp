# MongoDB Schema Design with Version History

## Core Collections

### Users Collection
```typescript
interface User {
  _id: ObjectId;
  email: string;
  password: string; // Hashed
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}
```

### Decks Collection
```typescript
interface Deck {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  theme: {
    name: string;
    setting?: string;
    specifics: Array<{
      cardName: string;
      thematicReference: string;
    }>;
  };
  status: 'draft' | 'processing' | 'completed' | 'error';
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Cards Collection
```typescript
interface Card {
  _id: ObjectId;
  deckId: ObjectId;
  originalCard: {
    id: string;
    name: string;
    type_line: string;
    oracle_text: string;
    mana_cost?: string;
    power?: string;
    toughness?: string;
    loyalty?: string;
    image_uris?: {
      normal: string;
      art_crop: string;
    };
  };
  currentVersion: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: Date;
  updatedAt: Date;
}
```

## Version History Collections

### DeckVersions Collection
```typescript
interface DeckVersion {
  _id: ObjectId;
  deckId: ObjectId;
  version: number;
  name: string;
  theme: {
    name: string;
    setting?: string;
    specifics: Array<{
      cardName: string;
      thematicReference: string;
    }>;
  };
  timestamp: Date;
  changedBy: ObjectId; // Reference to User
  changeReason?: string;
}
```

### CardVersions Collection
```typescript
interface CardVersion {
  _id: ObjectId;
  cardId: ObjectId;
  version: number;
  thematicName: string;
  flavorText: string;
  artPrompt: string;
  imageUrl?: string;
  timestamp: Date;
  changedBy: ObjectId; // Reference to User
  changeReason?: string;
  rerollAspects?: Array<'name' | 'flavor' | 'art' | 'all'>;
}
```

## Indexes

### Primary Indexes
```javascript
// Users Collection
db.users.createIndex({ "email": 1 }, { unique: true })

// Decks Collection
db.decks.createIndex({ "userId": 1 })
db.decks.createIndex({ "userId": 1, "status": 1 })
db.decks.createIndex({ "updatedAt": -1 })

// Cards Collection
db.cards.createIndex({ "deckId": 1 })
db.cards.createIndex({ "status": 1 })
db.cards.createIndex({ "originalCard.name": 1 })

// Version Collections
db.deckVersions.createIndex({ "deckId": 1, "version": 1 })
db.cardVersions.createIndex({ "cardId": 1, "version": 1 })
```

### Compound Indexes
```javascript
// Deck search and filtering
db.decks.createIndex({ 
  "userId": 1, 
  "name": "text", 
  "theme.name": "text" 
})

// Card search and filtering
db.cards.createIndex({
  "deckId": 1,
  "status": 1,
  "updatedAt": -1
})

// Version history queries
db.cardVersions.createIndex({
  "cardId": 1,
  "timestamp": -1
})
```

## Schema Validation

### Example Deck Validation
```javascript
{
  $jsonSchema: {
    bsonType: "object",
    required: ["userId", "name", "theme", "status", "currentVersion"],
    properties: {
      userId: {
        bsonType: "objectId",
        description: "must be an ObjectId and is required"
      },
      name: {
        bsonType: "string",
        minLength: 1,
        maxLength: 100,
        description: "must be a string between 1 and 100 characters"
      },
      theme: {
        bsonType: "object",
        required: ["name", "specifics"],
        properties: {
          name: { bsonType: "string" },
          setting: { bsonType: "string" },
          specifics: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["cardName", "thematicReference"],
              properties: {
                cardName: { bsonType: "string" },
                thematicReference: { bsonType: "string" }
              }
            }
          }
        }
      }
    }
  }
}
```

## Version Control Strategy

1. **Incremental Versioning**
   - Each document maintains a `currentVersion` field
   - Version numbers start at 1 and increment with each change
   - Full version history stored in separate collections

2. **Change Tracking**
   - Each version includes:
     - Timestamp
     - User who made the change
     - Reason for change (optional)
     - Modified fields

3. **Rollback Support**
   - Version collections maintain complete snapshots
   - Rollback operation:
     1. Retrieve desired version
     2. Create new version with rolled-back content
     3. Update current version number

4. **Reroll History**
   - Track which aspects were rerolled
   - Maintain art prompts for regeneration
   - Link between versions for tracking evolution

## Migration Strategy

1. **Initial Setup**
```javascript
// Create collections with validation
db.createCollection("decks", {
  validator: { $jsonSchema: deckSchema }
})

// Create versions collections
db.createCollection("deckVersions")
db.createCollection("cardVersions")
```

2. **Version 1.0 Migration**
```javascript
// Add version tracking to existing documents
db.decks.updateMany({}, {
  $set: {
    currentVersion: 1
  }
})

// Create initial versions
db.decks.find().forEach(deck => {
  db.deckVersions.insertOne({
    deckId: deck._id,
    version: 1,
    // Copy relevant fields
    timestamp: new Date(),
    changedBy: deck.userId
  })
})
```

3. **Backup Strategy**
```javascript
// Before migration
mongodump --db mtgproxy --collection decks
mongodump --db mtgproxy --collection cards

// After migration verification
db.decks.find({ currentVersion: { $exists: false } })
db.cards.find({ currentVersion: { $exists: false } })
```

## Query Patterns

1. **Get Latest Version**
```typescript
const getLatestDeck = async (deckId: ObjectId) => {
  return await decks.findOne({ _id: deckId });
}
```

2. **Get Specific Version**
```typescript
const getDeckVersion = async (deckId: ObjectId, version: number) => {
  return await deckVersions.findOne({ deckId, version });
}
```

3. **Get Version History**
```typescript
const getDeckHistory = async (deckId: ObjectId) => {
  return await deckVersions
    .find({ deckId })
    .sort({ version: -1 })
    .toArray();
}
```

4. **Rollback to Version**
```typescript
const rollbackDeck = async (deckId: ObjectId, targetVersion: number) => {
  const oldVersion = await deckVersions.findOne({ 
    deckId, 
    version: targetVersion 
  });
  
  if (!oldVersion) throw new Error('Version not found');
  
  const deck = await decks.findOne({ _id: deckId });
  const newVersion = deck.currentVersion + 1;
  
  // Create new version with old content
  await deckVersions.insertOne({
    ...oldVersion,
    version: newVersion,
    timestamp: new Date(),
    changeReason: `Rollback to version ${targetVersion}`
  });
  
  // Update current document
  await decks.updateOne(
    { _id: deckId },
    { 
      $set: {
        ...oldVersion,
        currentVersion: newVersion
      }
    }
  );
}