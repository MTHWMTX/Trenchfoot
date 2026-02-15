import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { updateAddon } from '../actions';
import type { Addon, Faction } from '../../../types';

interface AddonEditSheetProps {
  addon: Addon | null;
  factions: Faction[];
  open: boolean;
  onClose: () => void;
}

export function AddonEditSheet({ addon, factions, open, onClose }: AddonEditSheetProps) {
  const [name, setName] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [description, setDescription] = useState('');
  const [factionId, setFactionId] = useState('fc_none');

  useEffect(() => {
    if (addon) {
      setName(addon.name);
      setTagsInput(addon.tags.join(', '));
      setDescription(addon.description);
      setFactionId(addon.factionId);
    }
  }, [addon]);

  if (!addon) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    await updateAddon(addon.id, { name: name.trim(), factionId, tags, description });
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-accent-gold/15 rounded-t-2xl p-5 pb-8 safe-bottom max-h-[75vh] overflow-y-auto animate-slide-up">
          <div className="w-8 h-1 bg-border-default rounded-full mx-auto mb-5" />
          <Dialog.Title className="text-lg font-bold mb-1">Edit Ability</Dialog.Title>
          <Dialog.Description className="text-text-muted text-xs mb-4">Configure ability properties</Dialog.Description>

          {/* Name */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim" autoFocus />
          </div>

          {/* Faction */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Faction</label>
            <select value={factionId} onChange={(e) => setFactionId(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim">
              <option value="fc_none">General (no faction)</option>
              {factions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Tags (comma-separated)</label>
            <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="PASSIVE, PRAYER, etc."
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim" />
            {tagsInput && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tagsInput.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                  <span key={i} className="text-[9px] text-accent-gold bg-accent-gold/10 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim resize-none" />
          </div>

          {/* Save */}
          <button type="button" onClick={handleSave} disabled={!name.trim()}
            className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            Save Ability
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
