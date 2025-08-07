import { AxiosResponse } from 'axios';
import api from './api';
import { Deck } from '../store/slices/deckSlice';
import { handleError } from '../utils/errorHandling';

export const deckApi = {
  getDecks: async (): Promise<Deck[]> => {
    try {
      const response: AxiosResponse<Deck[]> = await api.get('/decks');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  getDeck: async (id: string): Promise<Deck> => {
    try {
      const response: AxiosResponse<Deck> = await api.get(`/decks/${id}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  createDeck: async (deck: Partial<Deck>): Promise<Deck> => {
    try {
      const response: AxiosResponse<Deck> = await api.post('/decks', deck);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  updateDeck: async (id: string, deck: Partial<Deck>): Promise<Deck> => {
    try {
      const response: AxiosResponse<Deck> = await api.put(`/decks/${id}`, deck);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  deleteDeck: async (id: string): Promise<void> => {
    try {
      await api.delete(`/decks/${id}`);
    } catch (error) {
      throw handleError(error);
    }
  },

  exportDeck: async (id: string, format: 'json' | 'txt'): Promise<Blob> => {
    try {
      const response: AxiosResponse<Blob> = await api.get(
        `/decks/${id}/export/${format}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  importDeck: async (file: File): Promise<Deck> => {
    try {
      const formData = new FormData();
      formData.append('deck', file);

      const response: AxiosResponse<Deck> = await api.post('/decks/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  rerollCard: async (deckId: string, cardIndex: number): Promise<Deck> => {
    try {
      const response: AxiosResponse<Deck> = await api.post(
        `/decks/${deckId}/cards/${cardIndex}/reroll`
      );
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }
};