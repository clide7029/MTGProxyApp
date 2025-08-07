import 'reflect-metadata';
import { container } from 'tsyringe';
import { ScryfallService } from './services/scryfall/scryfall-service';
import { ScryfallClient } from './services/scryfall/scryfall-client';
import { CacheService } from './services/cache/cache-service';
import { DeckAnalysisService } from './services/deck/deck-analysis-service';
import { PromptEngineeringService } from './services/ai/prompt-engineering-service';
import { ThemeGenerationService } from './services/theme/theme-generation-service';

// Register services
container.registerSingleton(CacheService);
container.registerSingleton(ScryfallClient);
container.registerSingleton(ScryfallService);
container.registerSingleton(DeckAnalysisService);
container.registerSingleton(PromptEngineeringService);
container.registerSingleton(ThemeGenerationService);

// Export services for use in other parts of the application
export const scryfallService = container.resolve(ScryfallService);
export const scryfallClient = container.resolve(ScryfallClient);
export const cacheService = container.resolve(CacheService);
export const deckAnalysisService = container.resolve(DeckAnalysisService);
export const promptEngineeringService = container.resolve(PromptEngineeringService);
export const themeGenerationService = container.resolve(ThemeGenerationService);

// Re-export types
export * from './services/scryfall/types';
export * from './services/deck/deck-analysis-service';
export * from './services/ai/prompt-engineering-service';
export * from './services/theme/theme-generation-service';