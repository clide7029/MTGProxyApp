import { FC, useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShareIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchDeckById,
  regenerateCard,
  selectCurrentDeck,
  selectDeckLoading
} from '../../store/slices/deckSlice';
import { showToast } from '../../store/slices/uiSlice';
import { ProtectedRoute } from '../../components/Layout';
import CardGrid from '../../components/CardGrid';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import ThemeEditor from '../../components/ThemeEditor';
import DeckSharingModal from '../../components/DeckSharingModal';
import DeckExporter from '../../components/DeckExporter';
import Button from '../../components/Button';
import { Deck as SharedDeck, DeckVisibility, ThemeConfiguration } from '../../../../shared/src/types';
import { Deck as LocalDeck } from '../../store/slices/deckSlice';

const DeckViewPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const deck = useAppSelector(selectCurrentDeck);
  const isLoading = useAppSelector(selectDeckLoading);
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Convert local deck to shared deck format for sharing modal
  const sharedDeck = useMemo((): SharedDeck | null => {
    if (!deck) return null;
    
    const themeConfig: ThemeConfiguration = {
      name: deck.theme || 'Default',
      specifics: []
    };

    return {
      id: deck.id,
      userId: deck.userId,
      name: deck.name,
      theme: themeConfig,
      cards: [], // We'll populate this if needed
      status: deck.status as any, // Convert status types
      visibility: deck.visibility || (deck.isPublic ? DeckVisibility.PUBLIC : DeckVisibility.PRIVATE),
      sharedWith: deck.sharedWith || [],
      shareLink: deck.shareLink,
      createdAt: new Date(deck.createdAt),
      updatedAt: new Date(deck.updatedAt)
    };
  }, [deck]);

  useEffect(() => {
    if (id) {
      dispatch(fetchDeckById(id));
    }
  }, [dispatch, id]);

  const handleRerollCard = async (cardIndex: number) => {
    if (!id) return;

    try {
      await dispatch(regenerateCard({ deckId: id, cardIndex })).unwrap();
      dispatch(
        showToast({
          message: 'Card regenerated successfully',
          type: 'success'
        })
      );
    } catch (error) {
      dispatch(
        showToast({
          message: error instanceof Error ? error.message : 'Failed to regenerate card',
          type: 'error'
        })
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Deck not found</h2>
        <p className="mt-2 text-gray-600">
          The deck you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <button
          onClick={() => navigate('/decks')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Decks
        </button>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{deck.name}</h1>
              {deck.description && (
                <p className="mt-2 text-gray-600">{deck.description}</p>
              )}
              <div className="mt-2 flex items-center space-x-4">
                <span className="text-sm text-gray-500">Format: {deck.format}</span>
                <button
                  onClick={() => setIsThemeEditorOpen(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Theme: {deck.theme || 'Add theme'}
                </button>
                <span className="text-sm text-gray-500">
                  Cards: {deck.cardCount}
                </span>
                <span className={`text-sm ${deck.isPublic ? 'text-green-600' : 'text-gray-500'}`}>
                  {deck.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => setIsSharingModalOpen(true)} variant="secondary">
                <ShareIcon className="h-4 w-4" />
                Share
              </Button>
              <Button onClick={() => setIsExportModalOpen(true)} variant="secondary">
                <DocumentArrowDownIcon className="h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => navigate(`/decks/${id}/edit`)}>
                Edit Deck
              </Button>
              <Button
                onClick={() => navigate('/decks')}
                variant="secondary"
              >
                Back to Decks
              </Button>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="space-y-6">
              {deck.cards.length > 0 && (
                <CardGrid
                  cards={deck.cards}
                  isEditing
                  onRerollCard={handleRerollCard}
                  gridCols={4}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isThemeEditorOpen}
        onClose={() => setIsThemeEditorOpen(false)}
        maxWidth="2xl"
      >
        <ThemeEditor
          deckId={id!}
          currentTheme={deck.theme}
          onClose={() => setIsThemeEditorOpen(false)}
        />
      </Modal>

      {sharedDeck && (
        <DeckSharingModal
          deck={sharedDeck}
          isOpen={isSharingModalOpen}
          onClose={() => setIsSharingModalOpen(false)}
        />
      )}

      {sharedDeck && (
        <DeckExporter
          deck={sharedDeck}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </ProtectedRoute>
  );
};

export default DeckViewPage;