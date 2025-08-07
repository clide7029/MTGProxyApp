import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, DocumentArrowDownIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { Deck } from '../../../shared/src/types';
import Button from './Button';
import toast from 'react-hot-toast';

interface Props {
  deck: Deck;
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'text' | 'json' | 'csv' | 'mtgo';

const DeckExporter: React.FC<Props> = ({ deck, isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('text');

  const generateExport = (format: ExportFormat): string => {
    switch (format) {
      case 'text':
        return generateTextExport();
      case 'json':
        return generateJSONExport();
      case 'csv':
        return generateCSVExport();
      case 'mtgo':
        return generateMTGOExport();
      default:
        return '';
    }
  };

  const generateTextExport = (): string => {
    const lines = [
      `// ${deck.name}`,
      `// Theme: ${deck.theme.name}`,
      `// Cards: ${deck.cards.length}`,
      `// Created: ${new Date(deck.createdAt).toLocaleDateString()}`,
      '',
    ];

    // Group cards by type or rarity for better organization
    const cardsByType = deck.cards.reduce((acc, card) => {
      const key = card.originalCard.type_line.split(' ')[0] || 'Other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(card);
      return acc;
    }, {} as Record<string, typeof deck.cards>);

    Object.entries(cardsByType).forEach(([type, cards]) => {
      lines.push(`// ${type}s`);
      cards.forEach(card => {
        lines.push(`1 ${card.thematicName} // ${card.originalCard.name}`);
      });
      lines.push('');
    });

    return lines.join('\n');
  };

  const generateJSONExport = (): string => {
    const exportData = {
      name: deck.name,
      theme: deck.theme,
      format: 'proxy',
      cards: deck.cards.map(card => ({
        originalName: card.originalCard.name,
        thematicName: card.thematicName,
        flavorText: card.flavorText,
        artPrompt: card.artPrompt,
        type: card.originalCard.type_line,
        manaCost: card.originalCard.mana_cost,
        oracleText: card.originalCard.oracle_text,
        power: card.originalCard.power,
        toughness: card.originalCard.toughness,
      })),
      metadata: {
        createdAt: deck.createdAt,
        updatedAt: deck.updatedAt,
        cardCount: deck.cards.length,
      }
    };

    return JSON.stringify(exportData, null, 2);
  };

  const generateCSVExport = (): string => {
    const headers = [
      'Original Name',
      'Thematic Name',
      'Type',
      'Mana Cost',
      'Power',
      'Toughness',
      'Flavor Text',
      'Art Prompt'
    ];

    const rows = deck.cards.map(card => [
      card.originalCard.name,
      card.thematicName,
      card.originalCard.type_line,
      card.originalCard.mana_cost || '',
      card.originalCard.power || '',
      card.originalCard.toughness || '',
      card.flavorText.replace(/"/g, '""'), // Escape quotes
      card.artPrompt.replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  const generateMTGOExport = (): string => {
    // MTGO format: quantity cardname
    const lines = deck.cards.map(card => `1 ${card.originalCard.name}`);
    return lines.join('\n');
  };

  const handleCopyToClipboard = async () => {
    try {
      const content = generateExport(selectedFormat);
      await navigator.clipboard.writeText(content);
      toast.success('Deck list copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const content = generateExport(selectedFormat);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deck.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${getFileExtension(selectedFormat)}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Deck exported successfully');
  };

  const getFileExtension = (format: ExportFormat): string => {
    switch (format) {
      case 'json': return 'json';
      case 'csv': return 'csv';
      case 'mtgo': return 'txt';
      default: return 'txt';
    }
  };

  const formatDescriptions = {
    text: 'Human-readable text format with thematic names and original card references',
    json: 'Structured JSON format with complete card data and metadata',
    csv: 'Spreadsheet-compatible CSV format for data analysis',
    mtgo: 'Magic Online compatible format with original card names only'
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold">
              Export Deck: {deck.name}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Export Format</h3>
            <div className="space-y-3">
              {Object.entries(formatDescriptions).map(([format, description]) => (
                <label key={format} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={selectedFormat === format}
                    onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                    className="mt-1 text-blue-600"
                  />
                  <div>
                    <div className="font-medium capitalize">{format}</div>
                    <div className="text-sm text-gray-600">{description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {generateExport(selectedFormat).substring(0, 500)}
                {generateExport(selectedFormat).length > 500 && '...'}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleCopyToClipboard} variant="secondary" className="flex-1">
              <ClipboardDocumentIcon className="h-5 w-5" />
              Copy to Clipboard
            </Button>
            <Button onClick={handleDownload} className="flex-1">
              <DocumentArrowDownIcon className="h-5 w-5" />
              Download File
            </Button>
          </div>

          {/* Deck Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Cards:</span> {deck.cards.length}
              </div>
              <div>
                <span className="font-medium">Theme:</span> {deck.theme.name}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(deck.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {new Date(deck.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DeckExporter;