import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { deckApi } from '../../services/deckApi';
import { handleError } from '../../utils/errorHandling';
import { DeckVisibility, SharedUser } from '../../../../shared/src/types';

export interface Card {
  id: string;
  name: string;
  imageUrl: string;
  manaCost: string;
  type: string;
  text: string;
  flavorText?: string;
  power?: string;
  toughness?: string;
  rarity: string;
  set: string;
  artist: string;
}

export interface DeckCard extends Card {
  quantity: number;
  isCommander?: boolean;
}

export type DeckStatus = 'processing' | 'complete' | 'error';

export interface Deck {
  id: string;
  name: string;
  description: string;
  format: string;
  theme: string;
  isPublic: boolean;
  colorIdentity: string[];
  cardCount: number;
  completedCount: number;
  status: DeckStatus;
  createdAt: string;
  updatedAt: string;
  lastModified: string;
  userId: string;
  cards: DeckCard[];
  // New privacy and sharing properties
  visibility: DeckVisibility;
  sharedWith: SharedUser[];
  shareLink?: string;
}

export type DeckDetail = Deck;

export interface CreateDeckPayload {
  name: string;
  description: string;
  format: string;
  theme: string;
  isPublic: boolean;
  colorIdentity: string[];
  source?: string;
}

export interface UpdateDeckPayload {
  id: string;
  deck: Partial<CreateDeckPayload>;
}

export interface RegenerateCardPayload {
  deckId: string;
  cardIndex: number;
  preserveProperties?: string[];
}

interface DeckState {
  decks: Deck[];
  currentDeck: Deck | null;
  loading: boolean;
  error: string | null;
}

const initialState: DeckState = {
  decks: [],
  currentDeck: null,
  loading: false,
  error: null
};

export const fetchDecks = createAsyncThunk(
  'decks/fetchDecks',
  async () => {
    try {
      return await deckApi.getDecks();
    } catch (error) {
      throw handleError(error);
    }
  }
);

export const fetchDeckById = createAsyncThunk(
  'decks/fetchDeckById',
  async (id: string) => {
    try {
      return await deckApi.getDeck(id);
    } catch (error) {
      throw handleError(error);
    }
  }
);

export const createDeck = createAsyncThunk(
  'decks/createDeck',
  async (deck: CreateDeckPayload) => {
    try {
      return await deckApi.createDeck(deck);
    } catch (error) {
      throw handleError(error);
    }
  }
);

export const updateDeck = createAsyncThunk(
  'decks/updateDeck',
  async ({ id, deck }: UpdateDeckPayload) => {
    try {
      return await deckApi.updateDeck(id, deck);
    } catch (error) {
      throw handleError(error);
    }
  }
);

export const updateDeckTheme = createAsyncThunk(
  'decks/updateDeckTheme',
  async ({ id, theme }: { id: string; theme: string }) => {
    try {
      return await deckApi.updateDeck(id, { theme });
    } catch (error) {
      throw handleError(error);
    }
  }
);

export const deleteDeck = createAsyncThunk(
  'decks/deleteDeck',
  async (id: string) => {
    try {
      await deckApi.deleteDeck(id);
      return id;
    } catch (error) {
      throw handleError(error);
    }
  }
);

export const regenerateCard = createAsyncThunk(
  'decks/regenerateCard',
  async ({ deckId, cardIndex }: RegenerateCardPayload) => {
    try {
      return await deckApi.rerollCard(deckId, cardIndex);
    } catch (error) {
      throw handleError(error);
    }
  }
);

const deckSlice = createSlice({
  name: 'decks',
  initialState,
  reducers: {
    clearCurrentDeck: (state) => {
      state.currentDeck = null;
    },
    clearDeckError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Decks
      .addCase(fetchDecks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDecks.fulfilled, (state, action) => {
        state.loading = false;
        state.decks = action.payload;
      })
      .addCase(fetchDecks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch decks';
      })
      // Fetch Deck by ID
      .addCase(fetchDeckById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeckById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDeck = action.payload;
      })
      .addCase(fetchDeckById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch deck';
      })
      // Create Deck
      .addCase(createDeck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeck.fulfilled, (state, action) => {
        state.loading = false;
        state.decks.push(action.payload);
        state.currentDeck = action.payload;
      })
      .addCase(createDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create deck';
      })
      // Update Deck
      .addCase(updateDeck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDeck.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.decks.findIndex((deck) => deck.id === action.payload.id);
        if (index !== -1) {
          state.decks[index] = action.payload;
        }
        state.currentDeck = action.payload;
      })
      .addCase(updateDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update deck';
      })
      // Update Deck Theme
      .addCase(updateDeckTheme.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDeckTheme.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.decks.findIndex((deck) => deck.id === action.payload.id);
        if (index !== -1) {
          state.decks[index] = action.payload;
        }
        state.currentDeck = action.payload;
      })
      .addCase(updateDeckTheme.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update deck theme';
      })
      // Delete Deck
      .addCase(deleteDeck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDeck.fulfilled, (state, action) => {
        state.loading = false;
        state.decks = state.decks.filter((deck) => deck.id !== action.payload);
        if (state.currentDeck?.id === action.payload) {
          state.currentDeck = null;
        }
      })
      .addCase(deleteDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete deck';
      })
      // Regenerate Card
      .addCase(regenerateCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(regenerateCard.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentDeck && action.payload) {
          state.currentDeck = action.payload;
          const index = state.decks.findIndex((deck) => deck.id === action.payload.id);
          if (index !== -1) {
            state.decks[index] = action.payload;
          }
        }
      })
      .addCase(regenerateCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to regenerate card';
      });
  }
});

export const { clearCurrentDeck, clearDeckError } = deckSlice.actions;

export const selectDecks = (state: RootState) => state.decks.decks;
export const selectAllDecks = selectDecks; // Alias for backward compatibility
export const selectCurrentDeck = (state: RootState) => state.decks.currentDeck;
export const selectDeckLoading = (state: RootState) => state.decks.loading;
export const selectDeckError = (state: RootState) => state.decks.error;

export default deckSlice.reducer;