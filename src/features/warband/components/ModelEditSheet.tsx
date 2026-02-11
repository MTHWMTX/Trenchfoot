import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { updateWarbandModel } from '../actions';
import { useEquipmentTemplates } from '../hooks';
import { KeywordText } from '../../../components/keyword/KeywordText';
import type { WarbandModel } from '../../../types';

interface ModelEditSheetProps {
  model: WarbandModel | null;
  onClose: () => void;
}

export function ModelEditSheet({ model, onClose }: ModelEditSheetProps) {
  const template = useLiveQuery(
    () => (model ? db.modelTemplates.get(model.templateId) : undefined),
    [model?.templateId]
  );
  const allEquipment = useEquipmentTemplates();
  const [customName, setCustomName] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  useEffect(() => {
    if (model) {
      setCustomName(model.customName);
      setSelectedEquipment([...model.equipmentIds]);
    }
  }, [model]);

  if (!model || !template) return null;

  const availableEquipment = allEquipment.filter(
    (eq) => !eq.factionId || eq.factionId === template.factionId
  );

  const groupedEquipment = template.equipmentSlots.map((slot) => ({
    slot,
    items: availableEquipment.filter((eq) => eq.type === slot.type),
  }));

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
              { label: 'MV', value: template.stats.movement },
              { label: 'RNG', value: template.stats.ranged || '-' },
              { label: 'MEL', value: template.stats.melee },
              { label: 'ARM', value: template.stats.armour },
              { label: 'WND', value: template.stats.wounds },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center flex-1">
                <span className="text-[9px] text-text-muted uppercase">{s.label}</span>
                <span className="text-sm font-bold text-text-primary">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Equipment slots */}
          {groupedEquipment.map(({ slot, items }, si) => (
            <div key={si} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] text-text-muted uppercase tracking-wider">
                  {slot.type.replace('_', ' ')}
                </span>
                {slot.required && <span className="text-[9px] text-accent-red-bright">Required</span>}
              </div>
              <div className="flex flex-col gap-1">
                {items.map((eq) => {
                  const selected = selectedEquipment.includes(eq.id);
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
                        <span className="text-[11px] text-accent-gold">{eq.cost > 0 ? `${eq.cost}d` : 'Free'}</span>
                      </div>
                      {eq.specialRules.length > 0 && (
                        <div className="text-[10px] text-text-muted mt-0.5 leading-relaxed">
                          <KeywordText text={eq.specialRules[0]} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Rules */}
          {template.specialRules.length > 0 && (
            <div className="mb-4">
              <span className="text-[11px] text-text-muted uppercase tracking-wider block mb-2">Special Rules</span>
              <div className="space-y-1.5">
                {template.specialRules.map((rule, i) => (
                  <div key={i} className="text-[12px] text-text-secondary leading-relaxed p-2 bg-bg-tertiary rounded-lg">
                    <KeywordText text={rule} />
                  </div>
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
