import { FC, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { updateDeckTheme } from '../store/slices/deckSlice';
import { showToast } from '../store/slices/uiSlice';
import LoadingSpinner from './LoadingSpinner';

interface ThemeEditorProps {
  deckId: string;
  currentTheme: string;
  onClose: () => void;
}

interface ThemeSuggestion {
  theme: string;
  description: string;
}

const THEME_SUGGESTIONS: ThemeSuggestion[] = [
  {
    theme: 'Dragon\'s Hoard',
    description: 'A treasure-focused theme with dragons as guardians'
  },
  {
    theme: 'Enchanted Forest',
    description: 'Nature-based magic and mystical creatures'
  },
  {
    theme: 'Ancient Ruins',
    description: 'Archaeological discoveries and forgotten powers'
  },
  {
    theme: 'Clockwork Citadel',
    description: 'Artifacts and mechanical constructs'
  },
  {
    theme: 'Shadow Carnival',
    description: 'Dark circus and mysterious performers'
  }
];

const ThemeEditor: FC<ThemeEditorProps> = ({ deckId, currentTheme, onClose }) => {
  const [theme, setTheme] = useState(currentTheme);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dispatch = useAppDispatch();

  const handleSave = async () => {
    if (!theme.trim() || theme === currentTheme) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(
        updateDeckTheme({
          id: deckId,
          theme: theme.trim()
        })
      ).unwrap();

      dispatch(
        showToast({
          message: 'Theme updated successfully',
          type: 'success'
        })
      );
      onClose();
    } catch (error) {
      dispatch(
        showToast({
          message: error instanceof Error ? error.message : 'Failed to update theme',
          type: 'error'
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Edit Deck Theme</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
            Theme Description
          </label>
          <div className="mt-1">
            <textarea
              id="theme"
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Describe your deck's theme..."
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500"
          >
            {showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
            <svg
              className={`ml-1 h-5 w-5 transform ${
                showSuggestions ? 'rotate-180' : ''
              } transition-transform`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showSuggestions && (
            <div className="mt-3 space-y-3">
              {THEME_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.theme}
                  onClick={() => setTheme(suggestion.theme)}
                  className="block w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <span className="block font-medium text-gray-900">
                    {suggestion.theme}
                  </span>
                  <span className="block text-sm text-gray-500">
                    {suggestion.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !theme.trim() || theme === currentTheme}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              'Save Theme'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeEditor;