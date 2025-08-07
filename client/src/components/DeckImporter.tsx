import { FC, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { showToast } from '../store/slices/uiSlice';
import { deckApi } from '../services/deckApi';
import LoadingSpinner from './LoadingSpinner';

const DeckImporter: FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFileImport(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      handleFileImport(files[0]);
    }
  };

  const handleFileImport = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.txt') && !file.name.toLowerCase().endsWith('.json')) {
      dispatch(
        showToast({
          message: 'Please upload a .txt or .json file',
          type: 'error'
        })
      );
      return;
    }

    setIsLoading(true);
    try {
      const deck = await deckApi.importDeck(file);
      dispatch(
        showToast({
          message: 'Deck imported successfully!',
          type: 'success'
        })
      );
      navigate(`/decks/${deck.id}`);
    } catch (error) {
      dispatch(
        showToast({
          message: error instanceof Error ? error.message : 'Failed to import deck',
          type: 'error'
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const dragAreaClasses = `
    relative
    border-2
    border-dashed
    rounded-lg
    p-12
    text-center
    transition-colors
    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}
  `;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Importing deck...</p>
      </div>
    );
  }

  return (
    <div
      className={dragAreaClasses}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".txt,.json"
        className="hidden"
      />
      <div className="space-y-4">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex text-sm text-gray-600">
          <button
            type="button"
            className="relative font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
            onClick={() => fileInputRef.current?.click()}
          >
            <span>Upload a file</span>
          </button>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500">.txt or .json deck files up to 10MB</p>
      </div>
    </div>
  );
};

export default DeckImporter;