import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { 
  Deck, 
  DeckVisibility, 
  SharedPermissions,
  ApiResponse,
  ShareDeckResponse,
  UpdateDeckVisibilityRequest,
  ShareDeckRequest
} from '../../../../shared/src/types';
import api from '../../services/api';

interface DecksState {
  items: Deck[];
  selectedDeck: Deck | null;
  loading: boolean;
  error: string | null;
  sharingStatus: {
    loading: boolean;
    error: string | null;
  };
}

const initialState: DecksState = {
  items: [],
  selectedDeck: null,
  loading: false,
  error: null,
  sharingStatus: {
    loading: false,
    error: null
  }
};

export const fetchDecks = createAsyncThunk(
  'decks/fetchDecks',
  async () => {
    const response = await api.get<ApiResponse<Deck[]>>('/decks');
    return response.data.data || [];
  }
);

export const updateDeckVisibility = createAsyncThunk(
  'decks/updateVisibility',
  async (request: UpdateDeckVisibilityRequest) => {
    const response = await api.patch<ApiResponse<Deck>>(
      `/decks/${request.deckId}/visibility`,
      { visibility: request.visibility }
    );
    return response.data.data;
  }
);

export const shareDeck = createAsyncThunk(
  'decks/share',
  async (request: ShareDeckRequest) => {
    const response = await api.post<ShareDeckResponse>(
      `/decks/${request.deckId}/share`,
      request
    );
    return {
      deckId: request.deckId,
      shareData: response.data
    };
  }
);

export const removeDeckShare = createAsyncThunk(
  'decks/removeShare',
  async ({ deckId, userId }: { deckId: string; userId: string }) => {
    await api.delete(`/decks/${deckId}/share/${userId}`);
    return { deckId, userId };
  }
);

const decksSlice = createSlice({
  name: 'decks',
  initialState,
  reducers: {
    setSelectedDeck: (state, action: PayloadAction<Deck | null>) => {
      state.selectedDeck = action.payload;
    },
    clearSharingError: (state) => {
      state.sharingStatus.error = null;
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
        state.items = action.payload;
      })
      .addCase(fetchDecks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch decks';
      })
      // Update Visibility
      .addCase(updateDeckVisibility.pending, (state) => {
        state.sharingStatus.loading = true;
        state.sharingStatus.error = null;
      })
      .addCase(updateDeckVisibility.fulfilled, (state, action) => {
        state.sharingStatus.loading = false;
        const updatedDeck = action.payload;
        if (updatedDeck) {
          const index = state.items.findIndex(deck => deck.id === updatedDeck.id);
          if (index !== -1) {
            state.items[index] = updatedDeck;
          }
          if (state.selectedDeck?.id === updatedDeck.id) {
            state.selectedDeck = updatedDeck;
          }
        }
      })
      .addCase(updateDeckVisibility.rejected, (state, action) => {
        state.sharingStatus.loading = false;
        state.sharingStatus.error = action.error.message || 'Failed to update deck visibility';
      })
      // Share Deck
      .addCase(shareDeck.pending, (state) => {
        state.sharingStatus.loading = true;
        state.sharingStatus.error = null;
      })
      .addCase(shareDeck.fulfilled, (state, action) => {
        state.sharingStatus.loading = false;
        const { deckId, shareData } = action.payload;
        const deck = state.items.find(d => d.id === deckId);
        if (deck) {
          deck.shareLink = shareData.shareLink;
          deck.sharedWith = shareData.sharedWith || deck.sharedWith;
          if (state.selectedDeck?.id === deckId) {
            state.selectedDeck = { ...deck };
          }
        }
      })
      .addCase(shareDeck.rejected, (state, action) => {
        state.sharingStatus.loading = false;
        state.sharingStatus.error = action.error.message || 'Failed to share deck';
      })
      // Remove Share
      .addCase(removeDeckShare.pending, (state) => {
        state.sharingStatus.loading = true;
        state.sharingStatus.error = null;
      })
      .addCase(removeDeckShare.fulfilled, (state, action) => {
        state.sharingStatus.loading = false;
        const { deckId, userId } = action.payload;
        const deck = state.items.find(d => d.id === deckId);
        if (deck) {
          deck.sharedWith = deck.sharedWith.filter(share => share.userId !== userId);
          if (state.selectedDeck?.id === deckId) {
            state.selectedDeck = { ...deck };
          }
        }
      })
      .addCase(removeDeckShare.rejected, (state, action) => {
        state.sharingStatus.loading = false;
        state.sharingStatus.error = action.error.message || 'Failed to remove share';
      });
  }
});

export const { setSelectedDeck, clearSharingError } = decksSlice.actions;
export default decksSlice.reducer;