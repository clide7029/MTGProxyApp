import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Card {
  id: string;
  name: string;
  originalText: string;
  themedText: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  history: Array<{
    id: string;
    timestamp: string;
    text: string;
  }>;
}

interface DeckDetail {
  id: string;
  name: string;
  theme: string;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}

const DeckDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<DeckDetail | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isThemeEditing, setIsThemeEditing] = useState(false);
  const [editedTheme, setEditedTheme] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // TODO: Fetch deck details from API
    const fetchDeck = async () => {
      try {
        // Mock data for now
        setDeck({
          id: id!,
          name: 'Loading...',
          theme: '',
          cards: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error fetching deck:', error);
      }
    };

    fetchDeck();
  }, [id]);

  const handleThemeUpdate = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement theme update API call
      setIsThemeEditing(false);
    } catch (error) {
      console.error('Error updating theme:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardRegeneration = async (cardId: string) => {
    try {
      // TODO: Implement card regeneration API call
    } catch (error) {
      console.error('Error regenerating card:', error);
    }
  };

  if (!deck) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{deck.name}</h1>
          <p className="mt-2 text-sm text-gray-500">
            Created {new Date(deck.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/decks')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Decks
          </button>
          <button
            onClick={() => {/* TODO: Implement export */}}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Export Deck
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Theme</h2>
              {!isThemeEditing && (
                <button
                  onClick={() => {
                    setIsThemeEditing(true);
                    setEditedTheme(deck.theme);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Edit
                </button>
              )}
            </div>
            {isThemeEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editedTheme}
                  onChange={(e) => setEditedTheme(e.target.value)}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsThemeEditing(false)}
                    className="text-sm text-gray-600 hover:text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleThemeUpdate}
                    disabled={isProcessing}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Updating...' : 'Update Theme'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">{deck.theme || 'No theme set'}</p>
            )}
          </div>

          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Card List</h2>
            <div className="space-y-2">
              {deck.cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`w-full text-left px-4 py-2 rounded-md ${
                    selectedCard?.id === card.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{card.name}</span>
                    {card.status === 'processing' && '⏳'}
                    {card.status === 'complete' && '✅'}
                    {card.status === 'error' && '❌'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedCard ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-medium text-gray-900">
                  {selectedCard.name}
                </h2>
                <button
                  onClick={() => handleCardRegeneration(selectedCard.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Regenerate
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Original Text
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="whitespace-pre-wrap text-sm text-gray-600">
                      {selectedCard.originalText}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Themed Text
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="whitespace-pre-wrap text-sm text-gray-600">
                      {selectedCard.themedText}
                    </p>
                  </div>
                </div>
              </div>

              {selectedCard.history.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Version History
                  </h3>
                  <div className="space-y-4">
                    {selectedCard.history.map((version) => (
                      <div
                        key={version.id}
                        className="p-4 bg-gray-50 rounded-md"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-gray-500">
                            {new Date(version.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-gray-600">
                          {version.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <p className="text-gray-500">Select a card to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeckDetailPage;