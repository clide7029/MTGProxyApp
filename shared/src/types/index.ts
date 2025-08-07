export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deck {
  id: string;
  userId: string;
  name: string;
  theme: ThemeConfiguration;
  cards: ProxyCard[];
  status: DeckStatus;
  visibility: DeckVisibility;
  sharedWith: SharedUser[];
  shareLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum DeckVisibility {
  PRIVATE = 'private',
  SHARED = 'shared',
  PUBLIC = 'public'
}

export interface SharedUser {
  userId: string;
  permissions: SharedPermissions[];
  sharedAt: Date;
}

export enum SharedPermissions {
  VIEW = 'view',
  EDIT = 'edit',
  SHARE = 'share'
}

export interface ThemeConfiguration {
  name: string;
  setting?: string;
  specifics: CardSpecification[];
}

export interface CardSpecification {
  cardName: string;
  thematicReference: string;
}

export interface ProxyCard {
  id: string;
  deckId: string;
  originalCard: ScryfallCard;
  thematicName: string;
  flavorText: string;
  artPrompt: string;
  imageUrl?: string;
  status: ProxyStatus;
  createdAt: Date;
  updatedAt: Date;
}

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

export enum DeckStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export enum ProxyStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ProcessDeckRequest {
  name: string;
  theme: ThemeConfiguration;
  decklist: string;
  visibility?: DeckVisibility;
}

export interface ShareDeckRequest {
  deckId: string;
  userId?: string;
  email?: string;
  permissions: SharedPermissions[];
}

export interface UpdateDeckVisibilityRequest {
  deckId: string;
  visibility: DeckVisibility;
}

export interface ShareDeckResponse {
  success: boolean;
  shareLink?: string;
  sharedWith?: SharedUser[];
}

export interface RerollCardRequest {
  cardId: string;
  aspects: RerollAspect[];
}

export enum RerollAspect {
  NAME = 'name',
  FLAVOR = 'flavor',
  ART = 'art',
  ALL = 'all'
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest extends LoginRequest {
  confirmPassword: string;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  validation?: ValidationError[];
}