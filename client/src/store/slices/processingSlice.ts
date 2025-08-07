import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../types';

export interface BatchStatus {
  batchId: string;
  type: 'theme' | 'cards';
  status: 'pending' | 'processing' | 'complete' | 'error';
  message: string;
  completed: number;
  total: number;
  errorLog?: string[];
}

export interface ProcessingState {
  batchStatus: BatchStatus[];
  currentBatch: number;
  totalBatches: number;
  isProcessing: boolean;
  errorLog: string[];
}

const initialState: ProcessingState = {
  batchStatus: [],
  currentBatch: 0,
  totalBatches: 0,
  isProcessing: false,
  errorLog: [],
};

const processingSlice = createSlice({
  name: 'processing',
  initialState,
  reducers: {
    initializeBatches: (state, action: PayloadAction<number>) => {
      state.totalBatches = action.payload;
      state.currentBatch = 0;
      state.batchStatus = [];
      state.errorLog = [];
      state.isProcessing = true;
    },
    addBatch: (state, action: PayloadAction<Omit<BatchStatus, 'completed' | 'total'>>) => {
      state.batchStatus.push({
        ...action.payload,
        completed: 0,
        total: 0,
      });
    },
    setBatchStatus: (state, action: PayloadAction<BatchStatus[]>) => {
      state.batchStatus = action.payload;
    },
    updateBatchStatus: (
      state,
      action: PayloadAction<{
        batchId: string;
        status: BatchStatus['status'];
        message?: string;
        completed?: number;
        total?: number;
      }>
    ) => {
      const batch = state.batchStatus.find(b => b.batchId === action.payload.batchId);
      if (batch) {
        batch.status = action.payload.status;
        if (action.payload.message) {
          batch.message = action.payload.message;
        }
        if (typeof action.payload.completed === 'number') {
          batch.completed = action.payload.completed;
        }
        if (typeof action.payload.total === 'number') {
          batch.total = action.payload.total;
        }
      }
    },
    setBatchProgress: (
      state,
      action: PayloadAction<{
        batchId: string;
        completed: number;
        total: number;
      }>
    ) => {
      const batch = state.batchStatus.find(b => b.batchId === action.payload.batchId);
      if (batch) {
        batch.completed = action.payload.completed;
        batch.total = action.payload.total;
      }
    },
    setProgress: (
      state,
      action: PayloadAction<{ current: number; total: number }>
    ) => {
      state.currentBatch = action.payload.current;
      state.totalBatches = action.payload.total;
    },
    logError: (state, action: PayloadAction<string>) => {
      state.errorLog.push(action.payload);
    },
    clearErrors: (state) => {
      state.errorLog = [];
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    resetProcessing: (state) => {
      return initialState;
    },
  },
});

export const {
  initializeBatches,
  addBatch,
  setBatchStatus,
  updateBatchStatus,
  setBatchProgress,
  setProgress,
  logError,
  clearErrors,
  setProcessing,
  resetProcessing,
} = processingSlice.actions;

// Selectors
export const selectBatchStatus = (state: RootState) => state.processing.batchStatus;
export const selectCurrentBatch = (state: RootState) => state.processing.currentBatch;
export const selectTotalBatches = (state: RootState) => state.processing.totalBatches;
export const selectProgress = (state: RootState) => ({
  current: state.processing.currentBatch,
  total: state.processing.totalBatches,
  percentage: state.processing.totalBatches > 0
    ? (state.processing.currentBatch / state.processing.totalBatches) * 100
    : 0,
});
export const selectIsProcessing = (state: RootState) => state.processing.isProcessing;
export const selectErrorLog = (state: RootState) => state.processing.errorLog;
export const selectHasErrors = (state: RootState) => state.processing.errorLog.length > 0;

export default processingSlice.reducer;