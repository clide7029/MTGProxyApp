/**
 * Core Scryfall card types
 */

export interface ScryfallSet {
  id: string;
  code: string;
  name: string;
  uri: string;
  released_at: string;
}

export interface ScryfallPrice {
  usd: string | null;
  usd_foil: string | null;
  eur: string | null;
  eur_foil: string | null;
}

export interface ScryfallImageUris {
  small: string;
  normal: string;
  large: string;
  png: string;
  art_crop: string;
  border_crop: string;
}

export interface ScryfallCardFace {
  name: string;
  type_line: string;
  oracle_text: string;
  mana_cost: string;
  image_uris?: ScryfallImageUris;
  power?: string;
  toughness?: string;
  loyalty?: string;
}

export interface ScryfallLegalities {
  standard: string;
  future: string;
  historic: string;
  gladiator: string;
  pioneer: string;
  explorer: string;
  modern: string;
  legacy: string;
  pauper: string;
  vintage: string;
  penny: string;
  commander: string;
  oathbreaker: string;
  brawl: string;
  historicbrawl: string;
  alchemy: string;
  paupercommander: string;
  duel: string;
  oldschool: string;
  premodern: string;
  predh: string;
}

export interface ScryfallCard {
  id: string;
  oracle_id: string;
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;
  type_line: string;
  oracle_text?: string;
  mana_cost?: string;
  cmc: number;
  power?: string;
  toughness?: string;
  loyalty?: string;
  colors?: string[];
  color_identity: string[];
  keywords: string[];
  set: string;
  set_name: string;
  collector_number: string;
  rarity: string;
  image_uris?: ScryfallImageUris;
  card_faces?: ScryfallCardFace[];
  prices: ScryfallPrice;
  foil: boolean;
  nonfoil: boolean;
  digital: boolean;
  games: string[];
  reserved: boolean;
  promo: boolean;
  legalities: ScryfallLegalities;
  edhrec_rank?: number;
  penny_rank?: number;
  artist: string;
  frame: string;
  full_art: boolean;
  textless: boolean;
  border_color: string;
  produced_mana?: string[];
}

/**
 * Scryfall API response types
 */

export interface ScryfallList<T> {
  object: 'list';
  total_cards?: number;
  has_more: boolean;
  next_page?: string;
  data: T[];
}

export interface ScryfallError {
  object: 'error';
  code: string;
  status: number;
  details: string;
}

/**
 * Card search parameters
 */
export interface CardSearchParams {
  q: string;
  unique?: 'cards' | 'art' | 'prints';
  order?: 'name' | 'set' | 'released' | 'rarity' | 'usd' | 'eur';
  dir?: 'auto' | 'asc' | 'desc';
  include_extras?: boolean;
  include_multilingual?: boolean;
  include_variations?: boolean;
  page?: number;
}

/**
 * Collection query item
 */
export interface CollectionQuery {
  identifiers: Array<
    | { id: string }
    | { mtgo_id: number }
    | { oracle_id: string }
    | { illustration_id: string }
    | { name: string }
    | { name: string; set: string }
    | { collector_number: string; set: string }
  >;
}

/**
 * Auto-complete options
 */
export interface AutocompleteOptions {
  q: string;
  include_extras?: boolean;
}