import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '../../components/Layout';
import PublicDeckBrowser from '../../components/PublicDeckBrowser';
import { Deck } from '../../../../shared/src/types';

const PublicDecksPage: React.FC = () => {
  const navigate = useNavigate();

  const handleDeckSelect = (deck: Deck) => {
    navigate(`/decks/${deck.id}`);
  };

  return (
    <ProtectedRoute>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Public Decks</h1>
            <p className="mt-2 text-gray-600">
              Discover and explore decks shared by the community
            </p>
          </div>

          <PublicDeckBrowser onDeckSelect={handleDeckSelect} />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PublicDecksPage;