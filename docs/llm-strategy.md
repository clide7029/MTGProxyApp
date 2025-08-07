# LLM Integration Strategy

## Batch Processing Configuration

- **Batch Size**: 10 cards per LLM request
- **Processing Approach**: Maintain theme consistency across entire deck
- **Prompt Control**: System-controlled templates only
- **Processing Order**: Process cards in order of importance (Commanders first, then other legendaries, then remaining cards)

## Context Management

For each deck processing session:
1. Create and maintain a theme context object
2. Pass relevant theme context to each batch
3. Update theme context with each batch completion
4. Ensure naming conventions and references stay consistent

## Base Prompt Template

```typescript
interface ThemeContext {
  theme: string;
  setting: string;
  namedCharacters: Map<string, string>; // Track used character names
  keyReferences: string[];              // Important theme elements
  userSpecifications: Map<string, string>; // User-specified card mappings
}

interface CardBatchPrompt {
  systemPrompt: string;
  userPrompt: string;
  batchCards: CardData[];
  themeContext: ThemeContext;
}

const SYSTEM_PROMPT = `You are a creative card designer tasked with transforming Magic: The Gathering cards into themed versions while maintaining their mechanical identity. Follow these rules:

1. Preserve the card's game mechanics and fundamental purpose
2. Ensure thematic consistency across the deck
3. Maintain proper naming conventions for card types
4. Create resonant flavor text that connects mechanics to theme
5. Generate clear art direction that captures the essence
6. Respect the original card type (creatures as characters, artifacts as objects, etc.)`;

const USER_PROMPT = `Theme: {theme}
Setting Context: {setting}
Previously Used References: {existingReferences}

For each card, provide:
1. Thematic Name: Follow the format appropriate for the card type
2. Flavor Text: A quote or description that connects the mechanical effect to the theme
3. Art Description: A detailed scene description with specific Midjourney prompt (--ar 3:5)

Cards to process:
{cardBatch}

Special considerations:
- Legendary creatures use "NAME, TITLE" format
- Maintain consistency with existing character/location references
- Consider card color identity in thematic mapping`;
```

## Processing Pipeline

1. **Pre-processing**
```typescript
async function prepareThemeContext(deckData: DeckData): ThemeContext {
  return {
    theme: deckData.theme,
    setting: deriveThemeSetting(deckData),
    namedCharacters: new Map(),
    keyReferences: [],
    userSpecifications: extractUserSpecs(deckData)
  };
}

async function createCardBatches(cards: Card[]): CardBatch[] {
  // Sort cards by priority
  const sortedCards = sortCardsByPriority(cards);
  // Create batches of 10 cards
  return chunkArray(sortedCards, 10);
}
```

2. **Batch Processing**
```typescript
async function processBatch(
  batch: CardBatch,
  themeContext: ThemeContext
): Promise<ProcessedCards[]> {
  const prompt = generateBatchPrompt(batch, themeContext);
  const response = await callLLMAPI(prompt);
  const processed = parseAndValidateResponse(response);
  updateThemeContext(themeContext, processed);
  return processed;
}
```

3. **Post-processing**
```typescript
async function validateAndStoreBatch(
  processedCards: ProcessedCards[]
): Promise<void> {
  // Validate thematic consistency
  // Check naming conventions
  // Store in database
  // Generate art prompts
}
```

## Example Card Processing

Input:
```json
{
  "originalCard": {
    "name": "Swords to Plowshares",
    "type": "Instant",
    "text": "Exile target creature. Its controller gains life equal to its power."
  },
  "theme": "Star Wars",
  "context": {
    "setting": "Galactic Empire Era"
  }
}
```

Output:
```json
{
  "thematicName": "Force Pacification",
  "flavorText": "\"A Jedi uses the Force for knowledge and defense, never for attack.\" —Luke Skywalker",
  "artPrompt": "A Jedi using the Force to calm a raging creature, peaceful blue energy surrounding them, Imperial architecture in background --ar 3:5 --v 6",
  "thematicReference": {
    "source": "Star Wars: The Empire Strikes Back",
    "connection": "Jedi philosophy of peaceful resolution"
  }
}
```

## Error Handling

1. **Invalid Response Format**
   - Retry with simplified prompt
   - Fall back to basic themeing if multiple failures

2. **Theme Inconsistency**
   - Track failed mappings
   - Provide alternative suggestions
   - Allow manual override

3. **Rate Limiting**
   - Implement exponential backoff
   - Queue system for large decks
   - Status updates to user

## Quality Assurance

1. **Thematic Consistency Checks**
   - Track named characters
   - Verify naming conventions
   - Check for theme appropriateness

2. **Mechanical Integrity**
   - Ensure game terms remain clear
   - Preserve card type relationships
   - Maintain color identity relevance

3. **User Feedback Loop**
   - Track successful themes
   - Monitor reroll requests
   - Adjust prompt weights based on feedback

## Performance Considerations

1. **Batch Optimization**
   - Process similar card types together
   - Cache theme context
   - Reuse successful patterns

2. **Resource Management**
   - Token usage tracking
   - Response size optimization
   - Prompt template versioning