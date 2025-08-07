import { FC, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDeckById, selectCurrentDeck, selectDeckLoading } from '../../store/slices/deckSlice';
import DeckForm from '../../components/DeckForm';
import { ProtectedRoute } from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';

const EditDeckPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const deck = useAppSelector(selectCurrentDeck);
  const isLoading = useAppSelector(selectDeckLoading);

  useEffect(() => {
    if (id) {
      dispatch(fetchDeckById(id));
    }
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Deck not found</h2>
        <p className="mt-2 text-gray-600">The deck you're looking for doesn't exist or you don't have permission to edit it.</p>
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Deck: {deck.name}</h1>
            <button
              onClick={() => navigate(`/decks/${id}`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          </div>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <DeckForm isEditing deckId={id} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default EditDeckPage;