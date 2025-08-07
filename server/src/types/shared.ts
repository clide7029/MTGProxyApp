/**
 * Status of a deck in the system
 */
export enum DeckStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

/**
 * Status of a proxy card in the system
 */
export enum ProxyStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

/**
 * Aspects of a card that can be rerolled
 */
export enum RerollAspect {
  NAME = 'name',
  FLAVOR = 'flavor',
  ART = 'art',
  ALL = 'all'
}

/**
 * Card details from Scryfall API
 */
export interface ScryfallCard {
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
}

/**
 * Theme configuration for a deck
 */
export interface ThemeConfiguration {
  name: string;
  setting?: string;
  specifics: Array<CardSpecification>;
}

/**
 * Theme specification for a specific card
 */
export interface CardSpecification {
  cardName: string;
  thematicReference: string;
}