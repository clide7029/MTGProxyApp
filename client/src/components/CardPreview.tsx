import { FC, useState } from 'react';
import { Card } from '../store/slices/deckSlice';
import LoadingSpinner from './LoadingSpinner';

interface CardPreviewProps {
  card: Card;
  isEditing?: boolean;
  onReroll?: () => Promise<void>;
  className?: string;
}

const CardPreview: FC<CardPreviewProps> = ({
  card,
  isEditing = false,
  onReroll,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleReroll = async () => {
    if (!onReroll || isLoading) return;
    
    setIsLoading(true);
    try {
      await onReroll();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="relative aspect-[745/1040] rounded-lg overflow-hidden">
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <LoadingSpinner size="md" />
          </div>
        )}
        <img
          src={card.imageUrl}
          alt={card.name}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsImageLoaded(true)}
        />
        {isEditing && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleReroll}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Regenerating...
                  </>
                ) : (
                  'Reroll Card'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-medium text-gray-900">{card.name}</h3>
        <p className="text-sm text-gray-500">{card.type}</p>
        {card.manaCost && (
          <p className="text-sm text-gray-500 mt-1">Mana Cost: {card.manaCost}</p>
        )}
      </div>
      {isEditing && (
        <div className="mt-2 space-y-1">
          {card.rarity && (
            <p className="text-xs text-gray-500">Rarity: {card.rarity}</p>
          )}
          {card.set && (
            <p className="text-xs text-gray-500">Set: {card.set}</p>
          )}
          {card.artist && (
            <p className="text-xs text-gray-500">Artist: {card.artist}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CardPreview;