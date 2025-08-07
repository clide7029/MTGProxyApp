import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDeck } from '../../store/hooks';
import type { Deck } from '../../store/slices/deckSlice';

const DeckListPage: React.FC = () => {
  const { decks, loading, error, actions } = useDeck();

  useEffect(() => {
    actions.fetchDecks();
  }, [actions]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 p-6 rounded-lg h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => actions.fetchDecks()}
          className="mt-4 text-blue-600 hover:text-blue-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Proxy Decks</h1>
        <div className="space-x-4">
          <Link
            to="/decks/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Create New
          </Link>
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => {/* TODO: Add import action */}}
          >
            Import
          </button>
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No decks yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating a new deck or importing an existing one.
          </p>
          <div className="mt-6">
            <Link
              to="/decks/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Your First Deck
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck: Deck) => (
            <Link
              key={deck.id}
              to={`/decks/${deck.id}`}
              className="block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{deck.name}</h3>
                <p className="mt-2 text-sm text-gray-500">Theme: {deck.theme}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>
                      {deck.completedCount}/{deck.cardCount} cards completed
                    </span>
                    <span>
                      {deck.status === 'processing' && '⏳'}
                      {deck.status === 'complete' && '✅'}
                      {deck.status === 'error' && '❌'}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-2 rounded-full ${
                        deck.status === 'error'
                          ? 'bg-red-500'
                          : deck.status === 'complete'
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${(deck.completedCount / deck.cardCount) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  Last modified: {new Date(deck.lastModified).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeckListPage;