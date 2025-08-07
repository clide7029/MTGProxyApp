// Re-export all types from slices
export type {
  Card,
  Deck,
  DeckDetail,
  CreateDeckPayload,
} from './slices/deckSlice';

export type {
  Toast,
  ViewMode,
  Filter,
  SortField,
  SortDirection,
} from './slices/uiSlice';

export type {
  BatchStatus,
  ProcessingState,
} from './slices/processingSlice';

// Export store types
export type { RootState, AppDispatch } from './store';

// Common types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  page: number;
  totalPages: number;
  totalItems: number;
}