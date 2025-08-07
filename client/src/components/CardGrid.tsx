import { FC } from 'react';
import { DeckCard } from '../store/slices/deckSlice';
import CardPreview from './CardPreview';

interface CardGridProps {
  cards: DeckCard[];
  isEditing?: boolean;
  onRerollCard?: (cardIndex: number) => Promise<void>;
  gridCols?: 2 | 3 | 4 | 5;
  className?: string;
}

const CardGrid: FC<CardGridProps> = ({
  cards,
  isEditing = false,
  onRerollCard,
  gridCols = 4,
  className = ''
}) => {
  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
  }[gridCols];

  if (!cards.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No cards to display</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${gridColsClass} ${className}`}>
      {cards.map((card, index) => (
        <div key={`${card.id}-${index}`} className="relative">
          {card.quantity > 1 && (
            <div className="absolute -top-2 -right-2 z-10 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
              {card.quantity}
            </div>
          )}
          {card.isCommander && (
            <div className="absolute -top-2 -left-2 z-10 bg-amber-500 text-white px-2 py-1 rounded-md text-xs font-medium">
              Commander
            </div>
          )}
          <CardPreview
            card={card}
            isEditing={isEditing}
            onReroll={onRerollCard ? () => onRerollCard(index) : undefined}
          />
        </div>
      ))}
    </div>
  );
};

export default CardGrid;