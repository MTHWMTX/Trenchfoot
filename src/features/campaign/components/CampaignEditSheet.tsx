import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { updateCampaign, deleteCampaign } from '../actions';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import type { Campaign } from '../../../types';

interface CampaignEditSheetProps {
  campaign: Campaign | null;
  open: boolean;
  onClose: () => void;
}

export function CampaignEditSheet({ campaign, open, onClose }: CampaignEditSheetProps) {
  const navigate = useNavigate();
  const [patron, setPatron] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

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

          {/* Danger zone */}
          <div className="mt-6 pt-4 border-t border-border-default">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full py-3 bg-accent-red/10 border border-accent-red/20 rounded-xl text-accent-red-bright text-sm font-semibold hover:bg-accent-red/20 transition-colors cursor-pointer"
            >
              Delete Campaign
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Campaign"
        description="This will permanently delete this campaign and all its game history. This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={async () => {
          await deleteCampaign(campaign.id);
          onClose();
          navigate('/campaign');
        }}
      />
    </Dialog.Root>
  );
}
