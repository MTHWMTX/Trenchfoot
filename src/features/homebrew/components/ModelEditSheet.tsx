import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { createModelTemplate } from '../actions';
import { useHomebrewAddons } from '../hooks';
import type { ModelStats } from '../../../types';

interface ModelEditSheetProps {
  factionId: string | null;
  rulesetId: string;
  open: boolean;
  onClose: () => void;
}

export function ModelEditSheet({ factionId, rulesetId, open, onClose }: ModelEditSheetProps) {
  const [name, setName] = useState('');
  const [mv, setMv] = useState(6);
  const [rng, setRng] = useState<number | ''>('');
  const [mel, setMel] = useState<number | ''>('');
  const [arm, setArm] = useState(0);
  const [base, setBase] = useState(25);
  const [tagsInput, setTagsInput] = useState('');
  const [blurb, setBlurb] = useState('');
  const [promotion, setPromotion] = useState(0);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  const addons = useHomebrewAddons(rulesetId);
  const factionAddons = factionId
    ? addons.filter(a => a.factionId === factionId || a.factionId === 'fc_none')
    : [];

  const reset = () => {
    setName(''); setMv(6); setRng(''); setMel(''); setArm(0); setBase(25);
    setTagsInput(''); setBlurb(''); setPromotion(0); setSelectedAddonIds([]);
  };

  const handleSave = async () => {
    if (!factionId || !name.trim()) return;
    const stats: ModelStats = {
      movement: mv,
      ranged: rng === '' ? null : rng,
      melee: mel === '' ? null : mel,
      armour: arm,
      base: [base],
    };
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    await createModelTemplate(factionId, rulesetId, { name: name.trim(), stats, tags, blurb, promotion });
    reset();
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-accent-gold/15 rounded-t-2xl p-5 pb-8 safe-bottom max-h-[85vh] overflow-y-auto animate-slide-up">
          <div className="w-8 h-1 bg-border-default rounded-full mx-auto mb-5" />
          <Dialog.Title className="text-lg font-bold mb-1">New Model</Dialog.Title>
          <Dialog.Description className="text-text-muted text-xs mb-4">Create a new model template</Dialog.Description>

          {/* Name */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim" autoFocus />
          </div>

          {/* Stats */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Stats</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'MV', value: mv, set: (v: number) => setMv(v) },
                { label: 'RNG', value: rng, set: (v: number | '') => setRng(v) },
                { label: 'MEL', value: mel, set: (v: number | '') => setMel(v) },
                { label: 'ARM', value: arm, set: (v: number) => setArm(v) },
                { label: 'BASE', value: base, set: (v: number) => setBase(v) },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <label className="text-[9px] text-text-muted block mb-0.5 text-center">{label}</label>
                  <input type="number" value={value} onChange={(e) => set(e.target.value === '' ? '' as any : +e.target.value)}
                    className="w-full px-1.5 py-1.5 bg-bg-tertiary border border-border-default rounded-lg text-text-primary text-xs text-center focus:outline-none focus:border-accent-gold-dim" />
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Tags (comma-separated)</label>
            <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="ELITE, TOUGH, LEADER"
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim" />
            {tagsInput && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tagsInput.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                  <span key={i} className="text-[9px] text-accent-gold bg-accent-gold/10 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Blurb */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Description</label>
            <textarea value={blurb} onChange={(e) => setBlurb(e.target.value)} rows={2}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm focus:outline-none focus:border-accent-gold-dim resize-none" />
          </div>

          {/* Promotion */}
          <div className="mb-3">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Promotion Dice</label>
            <div className="flex gap-2">
              {[0, 1, 2].map(v => (
                <button key={v} type="button" onClick={() => setPromotion(v)}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-medium border transition-all cursor-pointer ${
                    promotion === v
                      ? 'border-accent-gold/30 bg-accent-gold/10 text-accent-gold'
                      : 'border-border-default bg-bg-tertiary text-text-muted'
                  }`}>
                  {v === 0 ? 'None' : `${v} Die`}
                </button>
              ))}
            </div>
          </div>

          {/* Abilities */}
          {factionAddons.length > 0 && (
            <div className="mb-4">
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Abilities</label>
              <div className="flex flex-wrap gap-1.5">
                {factionAddons.map(a => {
                  const selected = selectedAddonIds.includes(a.id);
                  return (
                    <button key={a.id} type="button"
                      onClick={() => setSelectedAddonIds(selected ? selectedAddonIds.filter(id => id !== a.id) : [...selectedAddonIds, a.id])}
                      className={`text-[10px] px-2 py-1 rounded-lg border cursor-pointer transition-all ${
                        selected
                          ? 'border-accent-gold/30 bg-accent-gold/10 text-accent-gold'
                          : 'border-border-default bg-bg-tertiary text-text-muted'
                      }`}>
                      {a.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Save */}
          <button type="button" onClick={handleSave} disabled={!name.trim()}
            className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            Create Model
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
