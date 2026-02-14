import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { updateCampaign } from '../actions';
import type { Campaign } from '../../../types';

interface CampaignEditSheetProps {
  campaign: Campaign | null;
  open: boolean;
  onClose: () => void;
}

export function CampaignEditSheet({ campaign, open, onClose }: CampaignEditSheetProps) {
  const [patron, setPatron] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (campaign) {
      setPatron(campaign.patron);
      setNotes(campaign.notes);
    }
  }, [campaign]);

  if (!campaign) return null;

  const handleSave = async () => {
    if (!patron.trim()) return;
    await updateCampaign(campaign.id, { patron: patron.trim(), notes });
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-accent-gold/15 rounded-t-2xl p-5 pb-8 safe-bottom max-h-[75vh] overflow-y-auto animate-slide-up">
          <div className="w-8 h-1 bg-border-default rounded-full mx-auto mb-5" />
          <Dialog.Title className="text-lg font-bold mb-1">Edit Campaign</Dialog.Title>
          <Dialog.Description className="text-text-muted text-xs mb-4">Change patron and notes</Dialog.Description>

          {/* Patron */}
          <div className="mb-4">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Patron</label>
            <input
              type="text"
              value={patron}
              onChange={(e) => setPatron(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim"
              autoFocus
            />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Campaign notes..."
              rows={3}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim resize-none"
            />
          </div>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!patron.trim()}
            className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
