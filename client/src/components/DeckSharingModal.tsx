import React, { useState, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ClipboardDocumentIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { Deck, DeckVisibility, SharedPermissions } from '../../../shared/src/types';
import { updateDeckVisibility, shareDeck, removeDeckShare } from '../store/slices/decksSlice';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import Button from './Button';
import toast from 'react-hot-toast';

interface Props {
  deck: Deck;
  isOpen: boolean;
  onClose: () => void;
}

const DeckSharingModal: React.FC<Props> = ({ deck, isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.decks.sharingStatus);
  
  const [visibility, setVisibility] = useState(deck.visibility);
  const [email, setEmail] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<SharedPermissions[]>([SharedPermissions.VIEW]);

  const handleVisibilityChange = async (newVisibility: DeckVisibility) => {
    try {
      await dispatch(updateDeckVisibility({ 
        deckId: deck.id, 
        visibility: newVisibility 
      })).unwrap();
      setVisibility(newVisibility);
      toast.success('Deck visibility updated');
    } catch (err) {
      toast.error('Failed to update deck visibility');
    }
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await dispatch(shareDeck({
        deckId: deck.id,
        email,
        permissions: selectedPermissions
      })).unwrap();
      setEmail('');
      toast.success('Deck shared successfully');
    } catch (err) {
      toast.error('Failed to share deck');
    }
  };

  const handleRemoveShare = async (userId: string) => {
    try {
      await dispatch(removeDeckShare({ deckId: deck.id, userId })).unwrap();
      toast.success('Share removed');
    } catch (err) {
      toast.error('Failed to remove share');
    }
  };

  const copyShareLink = useCallback(async () => {
    if (deck.shareLink) {
      try {
        await navigator.clipboard.writeText(deck.shareLink);
        toast.success('Share link copied to clipboard');
      } catch (err) {
        toast.error('Failed to copy share link');
      }
    }
  }, [deck.shareLink]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold">
              Share Deck: {deck.name}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Visibility Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Visibility Settings</h3>
            <div className="flex gap-4">
              {Object.values(DeckVisibility).map((v) => (
                <button
                  key={v}
                  onClick={() => handleVisibilityChange(v)}
                  className={`px-4 py-2 rounded-lg ${
                    visibility === v
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Share Link */}
          {deck.shareLink && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Share Link</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={deck.shareLink}
                  className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
                />
                <Button onClick={copyShareLink} variant="secondary">
                  <ClipboardDocumentIcon className="h-5 w-5" />
                  Copy
                </Button>
              </div>
            </div>
          )}

          {/* Share with User Form */}
          <form onSubmit={handleShareSubmit} className="mb-6">
            <h3 className="text-lg font-medium mb-3">Share with User</h3>
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <Button type="submit" disabled={loading || !email}>
                <UserPlusIcon className="h-5 w-5" />
                Share
              </Button>
            </div>
            <div className="mt-3 flex gap-3">
              {Object.values(SharedPermissions).map((permission) => (
                <label key={permission} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission)}
                    onChange={(e) => {
                      setSelectedPermissions(
                        e.target.checked
                          ? [...selectedPermissions, permission]
                          : selectedPermissions.filter((p) => p !== permission)
                      );
                    }}
                    className="rounded border-gray-300"
                  />
                  {permission.charAt(0).toUpperCase() + permission.slice(1)}
                </label>
              ))}
            </div>
          </form>

          {/* Shared Users List */}
          {deck.sharedWith && deck.sharedWith.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Shared With</h3>
              <ul className="divide-y">
                {deck.sharedWith.map((share) => (
                  <li key={share.userId} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{share.userId}</p>
                      <p className="text-sm text-gray-500">
                        {share.permissions.join(', ')}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRemoveShare(share.userId)}
                      variant="danger"
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DeckSharingModal;