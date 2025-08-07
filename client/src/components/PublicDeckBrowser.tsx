import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { Deck, DeckVisibility } from '../../../shared/src/types';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { fetchDecks } from '../store/slices/decksSlice';

interface PublicDeckBrowserProps {
  onDeckSelect?: (deck: Deck) => void;
}

const PublicDeckBrowser: React.FC<PublicDeckBrowserProps> = ({ onDeckSelect }) => {
  const dispatch = useAppDispatch();
  const { items: decks, loading } = useAppSelector((state) => state.decks);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    dispatch(fetchDecks());
  }, [dispatch]);

  // Filter public decks only
  const publicDecks = decks.filter(deck => deck.visibility === DeckVisibility.PUBLIC);

  // Apply search and filters
  const filteredDecks = publicDecks.filter(deck => {
    const matchesSearch = deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deck.theme.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = !selectedFormat || deck.theme.setting === selectedFormat;
    
    return matchesSearch && matchesFormat;
  });

  // Sort decks
  const sortedDecks = [...filteredDecks].sort((a, b) => {
    let aValue: string | Date;
    let bValue: string | Date;

    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'createdAt':
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      case 'updatedAt':
        aValue = a.updatedAt;
        bValue = b.updatedAt;
        break;
      default:
        aValue = a.updatedAt;
        bValue = b.updatedAt;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Get unique formats for filter dropdown
  const formats = Array.from(new Set(publicDecks.map(deck => deck.theme.setting).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search decks by name or theme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Format Filter */}
          <div className="lg:w-48">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Formats</option>
              {formats.map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="lg:w-48">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'name' | 'createdAt' | 'updatedAt');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="updatedAt-desc">Recently Updated</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {sortedDecks.length} of {publicDecks.length} public decks
      </div>

      {/* Deck Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedDecks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onSelect={() => onDeckSelect?.(deck)}
          />
        ))}
      </div>

      {/* Empty State */}
      {sortedDecks.length === 0 && !loading && (
        <div className="text-center py-12">
          <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No decks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

interface DeckCardProps {
  deck: Deck;
  onSelect: () => void;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {deck.name}
          </h3>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Public
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Theme:</span> {deck.theme.name}
          </p>
          {deck.theme.setting && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Format:</span> {deck.theme.setting}
            </p>
          )}
          <p className="text-sm text-gray-600">
            <span className="font-medium">Cards:</span> {deck.cards.length}
          </p>
          <p className="text-sm text-gray-500">
            Updated {new Date(deck.updatedAt).toLocaleDateString()}
          </p>
        </div>

        <Button onClick={onSelect} fullWidth>
          View Deck
        </Button>
      </div>
    </div>
  );
};

export default PublicDeckBrowser;