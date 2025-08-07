# Type System Updates

The following updates to the shared type system are needed to support the enhanced features:

## Enhanced Theme System

```typescript
// Update existing ThemeConfiguration
interface ThemeConfiguration {
  name: string;
  setting?: string;
  isPublic: boolean;
  mainTheme: string;
  subthemes: ThemeSubcategory[];
  mechanicalProfile: MechanicalProfile;
}

interface ThemeSubcategory {
  mechanic: string;
  thematicElement: string;
  description: string;
}

interface MechanicalProfile {
  primaryMechanics: {
    mechanic: string;
    frequency: number;
    keyCards: string[];
  }[];
  supportMechanics: {
    mechanic: string;
    purpose: 'enabler' | 'payoff' | 'utility';
  }[];
  keywordFrequency: Record<string, number>;
  synergies: {
    cards: string[];
    description: string;
  }[];
}
```

## Version History Support

```typescript
// Add to existing ProxyCard interface
interface ProxyCard {
  // ... existing fields ...
  versions: CardVersion[];
  currentVersionId: string;
}

interface CardVersion {
  id: string;
  timestamp: Date;
  thematicName: string;
  flavorText: string;
  artPrompt: string;
  imageUrl?: string;
  promptContext: PromptContext;
  mechanicCorrelation: {
    original: string[];
    themed: string[];
  };
}

interface PromptContext {
  deckStrategy: string;
  primaryMechanics: string[];
  flavorGuidelines: string[];
  universeRules: string[];
  consistencyAnchors: string[];
}
```

## Deck Privacy and Sharing

```typescript
// Update existing Deck interface
interface Deck {
  // ... existing fields ...
  isPublic: boolean;
  description: string;
  tags: string[];
  views: number;
  likes: number;
  comments: DeckComment[];
}

interface DeckComment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Updates

```typescript
// New endpoints and request/response types
interface DeckSearchParams {
  query?: string;
  themes?: string[];
  mechanics?: string[];
  sortBy: 'recent' | 'popular' | 'likes';
  page: number;
  limit: number;
}

interface RerollWithHistoryRequest extends RerollCardRequest {
  preserveAspects?: RerollAspect[];
  mechanicalConstraints?: {
    maintainSynergy: boolean;
    keepKeywords: string[];
  };
}

interface ThemeAnalysisResponse {
  deckStrategy: string;
  mechanicalProfile: MechanicalProfile;
  suggestedThemes: {
    theme: string;
    confidence: number;
    mechanicMatches: string[];
  }[];
}
```

## Implementation Notes

1. These type updates will require corresponding schema updates in MongoDB
2. Version history implementation should use efficient storage (only deltas where possible)
3. Add indexes for:
   - Deck searching (isPublic, tags, theme)
   - Version history queries
   - Mechanical profile analysis

4. Consider implementing TypeScript utility types for:
   - Version history diffs
   - Theme mapping validation
   - Mechanical profile analysis

5. Validation considerations:
   - Theme consistency across versions
   - Mechanical correlation accuracy
   - Required fields for public decks

## Migration Plan

1. Create new collections for version history
2. Update existing deck documents with new fields
3. Generate mechanical profiles for existing decks
4. Initialize version history for existing cards
5. Add privacy settings to all decks (default private)

## Security Considerations

1. Ensure proper access control for:
   - Private decks
   - Version history
   - Theme customization
   
2. Validate all theme-related input
3. Rate limit theme generation and rerolls
4. Implement proper CRUD permissions

These type updates will enable the enhanced functionality while maintaining type safety and proper structure throughout the application.