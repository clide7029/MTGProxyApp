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