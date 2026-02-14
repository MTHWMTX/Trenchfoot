import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { updateWarband } from '../actions';
import type { Warband } from '../../../types';

interface WarbandEditSheetProps {
  warband: Warband | null;
  open: boolean;
  onClose: () => void;
}

export function WarbandEditSheet({ warband, open, onClose }: WarbandEditSheetProps) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (warband) {
      setName(warband.name);
      setNotes(warband.notes);
    }
  }, [warband]);

  if (!warband) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    await updateWarband(warband.id, { name: name.trim(), notes });
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-accent-gold/15 rounded-t-2xl p-5 pb-8 safe-bottom max-h-[75vh] overflow-y-auto animate-slide-up">
          <div className="w-8 h-1 bg-border-default rounded-full mx-auto mb-5" />
          <Dialog.Title className="text-lg font-bold mb-1">Edit Warband</Dialog.Title>
          <Dialog.Description className="text-text-muted text-xs mb-4">Change warband name and notes</Dialog.Description>

          {/* Name */}
          <div className="mb-4">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Warband Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              placeholder="Add warband notes..."
              rows={3}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim resize-none"
            />
          </div>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
