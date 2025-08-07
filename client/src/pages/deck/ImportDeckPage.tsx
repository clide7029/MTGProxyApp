import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '../../components/Layout';
import DeckImporter from '../../components/DeckImporter';

const ImportDeckPage: FC = () => {
  const navigate = useNavigate();

  return (
    <ProtectedRoute>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Import Deck</h1>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/decks/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Deck
              </button>
              <button
                onClick={() => navigate('/decks')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Decks
              </button>
            </div>
          </div>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-lg font-medium text-gray-900">
                  Import your deck from a file
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Supported formats: .txt (plain text deck list) or .json (exported deck file)
                </p>
              </div>
              <DeckImporter />
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900">Supported file formats:</h3>
                <dl className="mt-3 space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-700">.txt format</dt>
                    <dd className="mt-1 text-sm text-gray-500">
                      Plain text file with one card per line in the format: 
                      <code className="ml-2 px-2 py-1 bg-gray-100 rounded">
                        {`1 Card Name`}
                      </code>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-700">.json format</dt>
                    <dd className="mt-1 text-sm text-gray-500">
                      JSON file exported from this or other supported applications containing deck data and metadata
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ImportDeckPage;