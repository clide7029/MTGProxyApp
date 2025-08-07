import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import {
  setBatchStatus,
  updateBatchStatus,
  setBatchProgress,
  setProgress,
  logError,
  clearErrors,
  setProcessing,
  resetProcessing,
  selectBatchStatus,
  selectProgress,
  selectIsProcessing,
  selectErrorLog,
  selectHasErrors
} from './slices/processingSlice';
import {
  fetchDecks,
  fetchDeckById,
  createDeck,
  updateDeckTheme,
  regenerateCard,
  clearCurrentDeck,
  selectAllDecks,
  selectCurrentDeck,
  selectDeckLoading,
  selectDeckError
} from './slices/deckSlice';

// Use these hooks throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hooks for specific slices
export const useDeck = () => {
  const dispatch = useAppDispatch();
  const decks = useAppSelector(selectAllDecks);
  const currentDeck = useAppSelector(selectCurrentDeck);
  const loading = useAppSelector(selectDeckLoading);
  const error = useAppSelector(selectDeckError);

  return {
    decks,
    currentDeck,
    loading,
    error,
    actions: {
      fetchDecks: () => dispatch(fetchDecks()),
      fetchDeckById: (id: string) => dispatch(fetchDeckById(id)),
      createDeck: (payload: Parameters<typeof createDeck>[0]) =>
        dispatch(createDeck(payload)),
      updateTheme: (payload: Parameters<typeof updateDeckTheme>[0]) =>
        dispatch(updateDeckTheme(payload)),
      regenerateCard: (payload: Parameters<typeof regenerateCard>[0]) =>
        dispatch(regenerateCard(payload)),
      clearCurrentDeck: () => dispatch(clearCurrentDeck()),
    },
  };
};

export const useProcessing = () => {
  const dispatch = useAppDispatch();
  const batchStatus = useAppSelector(selectBatchStatus);
  const progress = useAppSelector(selectProgress);
  const isProcessing = useAppSelector(selectIsProcessing);
  const errorLog = useAppSelector(selectErrorLog);
  const hasErrors = useAppSelector(selectHasErrors);

  return {
    batchStatus,
    progress,
    isProcessing,
    errorLog,
    hasErrors,
    actions: {
      setBatchStatus: (payload: Parameters<typeof setBatchStatus>[0]) =>
        dispatch(setBatchStatus(payload)),
      updateBatchStatus: (payload: Parameters<typeof updateBatchStatus>[0]) =>
        dispatch(updateBatchStatus(payload)),
      setBatchProgress: (payload: Parameters<typeof setBatchProgress>[0]) =>
        dispatch(setBatchProgress(payload)),
      setProgress: (payload: Parameters<typeof setProgress>[0]) =>
        dispatch(setProgress(payload)),
      logError: (payload: string) => dispatch(logError(payload)),
      clearErrors: () => dispatch(clearErrors()),
      setProcessing: (payload: boolean) => dispatch(setProcessing(payload)),
      resetProcessing: () => dispatch(resetProcessing()),
    },
  };
};

export const useUI = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.ui.isLoading);
  const error = useAppSelector((state) => state.ui.error);
  const toast = useAppSelector((state) => state.ui.toast);
  const currentView = useAppSelector((state) => state.ui.currentView);
  const selectedCardId = useAppSelector((state) => state.ui.selectedCardId);
  const filters = useAppSelector((state) => state.ui.filters);
  const sortOrder = useAppSelector((state) => state.ui.sortOrder);

  return {
    isLoading,
    error,
    toast,
    currentView,
    selectedCardId,
    filters,
    sortOrder,
  };
};