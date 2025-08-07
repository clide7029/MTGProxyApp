import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import DeckForm from '../../components/DeckForm';
import { ProtectedRoute } from '../../components/Layout';

const CreateDeckPage: FC = () => {
  const navigate = useNavigate();

  return (
    <ProtectedRoute>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Deck</h1>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </button>
          </div>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <DeckForm />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreateDeckPage;