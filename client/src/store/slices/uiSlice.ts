import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ViewMode = 'grid' | 'list' | 'detail';
export type SortField = 'name' | 'created' | 'updated' | 'price';
export type SortDirection = 'asc' | 'desc';

export interface Toast {
  show: boolean;
  message: string;
  type: ToastType;
}

export interface Filter {
  field: string;
  value: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith';
}

export interface SortOrder {
  field: SortField;
  direction: SortDirection;
}

interface UIState {
  toast: Toast;
  isLoading: boolean;
  error: string | null;
  currentView: ViewMode;
  selectedCardId: string | null;
  filters: Filter[];
  sortOrder: SortOrder;
}

const initialState: UIState = {
  toast: {
    show: false,
    message: '',
    type: 'info'
  },
  isLoading: false,
  error: null,
  currentView: 'grid',
  selectedCardId: null,
  filters: [],
  sortOrder: {
    field: 'name',
    direction: 'asc'
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<{ message: string; type: ToastType }>) => {
      state.toast = {
        show: true,
        message: action.payload.message,
        type: action.payload.type
      };
    },
    hideToast: (state) => {
      state.toast.show = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setView: (state, action: PayloadAction<ViewMode>) => {
      state.currentView = action.payload;
    },
    selectCard: (state, action: PayloadAction<string | null>) => {
      state.selectedCardId = action.payload;
    },
    setFilters: (state, action: PayloadAction<Filter[]>) => {
      state.filters = action.payload;
    },
    updateFilter: (state, action: PayloadAction<{ index: number; filter: Filter }>) => {
      const { index, filter } = action.payload;
      state.filters[index] = filter;
    },
    removeFilter: (state, action: PayloadAction<number>) => {
      state.filters.splice(action.payload, 1);
    },
    clearFilters: (state) => {
      state.filters = [];
    },
    setSortOrder: (state, action: PayloadAction<SortOrder>) => {
      state.sortOrder = action.payload;
    },
    resetUi: () => initialState
  }
});

export const {
  showToast,
  hideToast,
  setLoading,
  setError,
  clearError,
  setView,
  selectCard,
  setFilters,
  updateFilter,
  removeFilter,
  clearFilters,
  setSortOrder,
  resetUi
} = uiSlice.actions;

export const selectToast = (state: RootState) => state.ui.toast;
export const selectIsLoading = (state: RootState) => state.ui.isLoading;
export const selectError = (state: RootState) => state.ui.error;
export const selectCurrentView = (state: RootState) => state.ui.currentView;
export const selectSelectedCardId = (state: RootState) => state.ui.selectedCardId;
export const selectFilters = (state: RootState) => state.ui.filters;
export const selectSortOrder = (state: RootState) => state.ui.sortOrder;

export default uiSlice.reducer;