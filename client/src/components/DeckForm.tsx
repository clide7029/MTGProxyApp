import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createDeck, updateDeck, selectCurrentDeck } from '../store/slices/deckSlice';
import { showToast } from '../store/slices/uiSlice';

interface DeckFormProps {
  isEditing?: boolean;
  deckId?: string;
}

export const DeckForm: FC<DeckFormProps> = ({ isEditing = false, deckId }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentDeck = useAppSelector(selectCurrentDeck);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    format: 'commander',
    isPublic: false,
    theme: '',
    colorIdentity: [] as string[]
  });

  useEffect(() => {
    if (isEditing && currentDeck) {
      setFormData({
        name: currentDeck.name,
        description: currentDeck.description || '',
        format: currentDeck.format,
        isPublic: currentDeck.isPublic,
        theme: currentDeck.theme || '',
        colorIdentity: currentDeck.colorIdentity || []
      });
    }
  }, [isEditing, currentDeck]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && deckId) {
        await dispatch(updateDeck({ id: deckId, deck: formData })).unwrap();
        dispatch(showToast({ message: 'Deck updated successfully', type: 'success' }));
      } else {
        const newDeck = await dispatch(createDeck(formData)).unwrap();
        dispatch(showToast({ message: 'Deck created successfully', type: 'success' }));
        navigate(`/decks/${newDeck.id}`);
      }
    } catch (error) {
      dispatch(
        showToast({
          message: error instanceof Error ? error.message : 'Failed to save deck',
          type: 'error'
        })
      );
    }
  };

  const handleColorIdentityChange = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colorIdentity: prev.colorIdentity.includes(color)
        ? prev.colorIdentity.filter((c) => c !== color)
        : [...prev.colorIdentity, color]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Deck Name
        </label>
        <input
          type="text"
          id="name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div>
        <label htmlFor="format" className="block text-sm font-medium text-gray-700">
          Format
        </label>
        <select
          id="format"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.format}
          onChange={(e) => setFormData((prev) => ({ ...prev, format: e.target.value }))}
        >
          <option value="commander">Commander</option>
          <option value="modern">Modern</option>
          <option value="standard">Standard</option>
          <option value="legacy">Legacy</option>
          <option value="vintage">Vintage</option>
          <option value="pauper">Pauper</option>
        </select>
      </div>

      <div>
        <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
          Theme
        </label>
        <input
          type="text"
          id="theme"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.theme}
          onChange={(e) => setFormData((prev) => ({ ...prev, theme: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Color Identity</label>
        <div className="mt-2 flex space-x-4">
          {['W', 'U', 'B', 'R', 'G'].map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full ${
                formData.colorIdentity.includes(color)
                  ? 'ring-2 ring-offset-2 ring-indigo-500'
                  : 'opacity-50'
              }`}
              onClick={() => handleColorIdentityChange(color)}
            >
              <span className="sr-only">{color}</span>
              <div
                className={`w-full h-full rounded-full ${
                  color === 'W'
                    ? 'bg-yellow-100'
                    : color === 'U'
                    ? 'bg-blue-500'
                    : color === 'B'
                    ? 'bg-gray-900'
                    : color === 'R'
                    ? 'bg-red-600'
                    : 'bg-green-600'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          checked={formData.isPublic}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))
          }
        />
        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
          Make this deck public
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isEditing ? 'Update Deck' : 'Create Deck'}
        </button>
      </div>
    </form>
  );
};

export default DeckForm;