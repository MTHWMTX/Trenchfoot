import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { updateEquipmentTemplate } from '../actions';
import type { EquipmentTemplate, EquipmentCategory } from '../../../types';

interface EquipmentEditSheetProps {
  equipment: EquipmentTemplate | null;
  open: boolean;
  onClose: () => void;
}

export function EquipmentEditSheet({ equipment, open, onClose }: EquipmentEditSheetProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('equipment');
  const [equipType, setEquipType] = useState('');
  const [range, setRange] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [modifiersInput, setModifiersInput] = useState('');
  const [description, setDescription] = useState('');
  const [blurb, setBlurb] = useState('');

  useEffect(() => {
    if (equipment) {
      setName(equipment.name);
      setCategory(equipment.category);
      setEquipType(equipment.equipType ?? '');
      setRange(equipment.range ?? '');
      setTagsInput(equipment.tags.join(', '));
      setModifiersInput(equipment.modifiers.join(', '));
      setDescription(equipment.description);
      setBlurb(equipment.blurb);
    }
  }, [equipment]);

  if (!equipment) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const modifiers = modifiersInput.split(',').map(m => m.trim()).filter(Boolean);
    await updateEquipmentTemplate(equipment.id, {
      name: name.trim(), category, equipType: equipType || null,
      range: range || null, tags, modifiers, description, blurb,
    });
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-accent-gold/15 rounded-t-2xl p-5 pb-8 safe-bottom max-h-[85vh] overflow-y-auto animate-slide-up">
          <div className="w-8 h-1 bg-border-default rounded-full mx-auto mb-5" />
          <Dialog.Title className="text-lg font-bold mb-1">Edit Equipment</Dialog.Title>
          <Dialog.Description className="text-text-muted text-xs mb-4">Configure equipment properties</Dialog.Description>

          {/* Name */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim" autoFocus />
          </div>

          {/* Category */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Category</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['ranged', 'melee', 'armour', 'equipment'] as const).map((c) => (
                <button key={c} type="button" onClick={() => setCategory(c)}
                  className={`py-2 rounded-xl text-[11px] font-medium border transition-all cursor-pointer capitalize ${
                    category === c
                      ? 'border-accent-gold/30 bg-accent-gold/10 text-accent-gold'
                      : 'border-border-default bg-bg-tertiary text-text-muted'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Type & Range */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Equip Type</label>
              <input type="text" value={equipType} onChange={(e) => setEquipType(e.target.value)} placeholder="e.g. 2-Handed"
                className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim" />
            </div>
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Range</label>
              <input type="text" value={range} onChange={(e) => setRange(e.target.value)} placeholder='e.g. 18"'
                className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim" />
            </div>
          </div>

          {/* Tags */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Tags (comma-separated)</label>
            <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="HEAVY, FIRE, CRITICAL"
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim" />
            {tagsInput && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tagsInput.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                  <span key={i} className="text-[9px] text-accent-gold bg-accent-gold/10 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Modifiers */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Modifiers (comma-separated)</label>
            <input type="text" value={modifiersInput} onChange={(e) => setModifiersInput(e.target.value)} placeholder="+1 DICE, -1 INJURY"
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim" />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim resize-none" />
          </div>

          {/* Blurb */}
          <div className="mb-4">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Flavour Text</label>
            <textarea value={blurb} onChange={(e) => setBlurb(e.target.value)} rows={2}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim resize-none" />
          </div>

          {/* Save */}
          <button type="button" onClick={handleSave} disabled={!name.trim()}
            className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            Save Equipment
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
