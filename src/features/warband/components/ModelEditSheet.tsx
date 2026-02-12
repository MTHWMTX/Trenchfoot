import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { updateWarbandModel } from '../actions';
import { KeywordText } from '../../../components/keyword/KeywordText';
import type { WarbandModel, Faction, EquipmentCategory } from '../../../types';

interface ModelEditSheetProps {
  model: WarbandModel | null;
  faction: Faction | undefined;
  onClose: () => void;
}

function formatDice(val: number | null): string {
  if (val === null || val === undefined) return '\u2014';
  if (val > 0) return `+${val}`;
  return `${val}`;
}

const categoryLabels: Record<EquipmentCategory, string> = {
  ranged: 'Ranged Weapons',
  melee: 'Melee Weapons',
  armour: 'Armour',
  equipment: 'Equipment',
};

const categoryOrder: EquipmentCategory[] = ['ranged', 'melee', 'armour', 'equipment'];

export function ModelEditSheet({ model, faction, onClose }: ModelEditSheetProps) {
  const template = useLiveQuery(
    () => (model ? db.modelTemplates.get(model.templateId) : undefined),
    [model?.templateId]
  );

  // Get all equipment templates that this faction can use
  const factionEquipIds = (faction?.equipmentList ?? []).map(e => e.equipId);
  const availableEquipment = useLiveQuery(
    async () => factionEquipIds.length > 0
      ? db.equipmentTemplates.where('id').anyOf(factionEquipIds).toArray()
      : [],
    [factionEquipIds.join(',')]
  ) ?? [];

  const [customName, setCustomName] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  useEffect(() => {
    if (model) {
      setCustomName(model.customName);
      setSelectedEquipment([...model.equipmentIds]);
    }
  }, [model]);

  if (!model || !template) return null;

  const equipEntryMap = new Map((faction?.equipmentList ?? []).map(e => [e.equipId, e]));

  // Group available equipment by category
  const groupedEquipment = categoryOrder
    .map(cat => ({
      category: cat,
      label: categoryLabels[cat],
      items: availableEquipment.filter(eq => eq.category === cat),
    }))
    .filter(group => group.items.length > 0);

  const toggleEquipment = (eqId: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eqId) ? prev.filter((id) => id !== eqId) : [...prev, eqId]
    );
  };

  const handleSave = async () => {
    await updateWarbandModel(model.id, {
      customName,
      equipmentIds: selectedEquipment,
    });
    onClose();
  };

  return (
    <Dialog.Root open={!!model} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-accent-gold/15 rounded-t-2xl p-5 pb-8 safe-bottom max-h-[80vh] overflow-y-auto animate-slide-up">
          <div className="w-8 h-1 bg-border-default rounded-full mx-auto mb-5" />

          <Dialog.Title className="text-lg font-bold mb-1">{template.name}</Dialog.Title>
          <Dialog.Description className="text-text-muted text-xs mb-4">Edit model loadout</Dialog.Description>

          {/* Custom name */}
          <div className="mb-4">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">Custom Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={template.name}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border-default rounded-lg text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim"
            />
          </div>

          {/* Stats */}
          <div className="flex gap-3 mb-4 p-3 bg-bg-tertiary rounded-lg">
            {[
              { label: 'MV', value: `${template.stats.movement}` },
              { label: 'RNG', value: formatDice(template.stats.ranged) },
              { label: 'MEL', value: formatDice(template.stats.melee) },
              { label: 'ARM', value: `${template.stats.armour}` },
              { label: 'BASE', value: template.stats.base.join('x') },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center flex-1">
                <span className="text-[9px] text-text-muted uppercase">{s.label}</span>
                <span className="text-sm font-bold text-text-primary">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Blurb */}
          {template.blurb && (
            <div className="mb-4 p-3 bg-bg-tertiary rounded-lg">
              <div className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-line">
                <KeywordText text={template.blurb} />
              </div>
            </div>
          )}

          {/* Equipment selection by category */}
          {groupedEquipment.map(({ category, label, items }) => (
            <div key={category} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] text-text-muted uppercase tracking-wider">{label}</span>
              </div>
              <div className="flex flex-col gap-1">
                {items.map((eq) => {
                  const selected = selectedEquipment.includes(eq.id);
                  const entry = equipEntryMap.get(eq.id);
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => toggleEquipment(eq.id)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                        selected
                          ? 'border-accent-gold/30 bg-accent-gold/8'
                          : 'border-border-default bg-bg-tertiary hover:border-border-default'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-text-primary">{eq.name}</span>
                        <span className={`text-[11px] ${entry?.costType === 'glory' ? 'text-purple-300' : 'text-accent-gold'}`}>
                          {entry ? (entry.cost > 0 ? `${entry.cost}${entry.costType === 'ducats' ? 'd' : 'g'}` : 'Free') : ''}
                        </span>
                      </div>
                      {eq.description && (
                        <div className="text-[10px] text-text-muted mt-0.5 leading-relaxed line-clamp-2">
                          <KeywordText text={eq.description} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Tags */}
          {template.tags.length > 0 && (
            <div className="mb-4">
              <span className="text-[11px] text-text-muted uppercase tracking-wider block mb-2">Tags</span>
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <span key={tag} className="text-[10px] text-accent-gold/70 bg-accent-gold/8 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer mt-2"
          >
            Save Changes
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
