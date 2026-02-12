import * as Dialog from '@radix-ui/react-dialog';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRulesStore } from '../../features/rules/store';
import { db } from '../../data/db';
import { KeywordText } from '../keyword/KeywordText';

const categoryLabels: Record<string, string> = {
  ranged: 'Ranged Weapon',
  melee: 'Melee Weapon',
  armour: 'Armour',
  equipment: 'Equipment',
};

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center bg-bg-tertiary rounded-lg px-2.5 py-1.5 min-w-[40px]">
      <span className="text-[9px] text-text-muted uppercase tracking-wider">{label}</span>
      <span className="text-[13px] font-bold text-text-primary">{value}</span>
    </div>
  );
}

export function EquipmentSheet() {
  const selectedEquipmentId = useRulesStore((s) => s.selectedEquipmentId);
  const setSelectedEquipment = useRulesStore((s) => s.setSelectedEquipment);

  const eq = useLiveQuery(
    () => selectedEquipmentId ? db.equipmentTemplates.get(selectedEquipmentId) : undefined,
    [selectedEquipmentId]
  );

  return (
    <Dialog.Root
      open={!!selectedEquipmentId}
      onOpenChange={(open) => { if (!open) setSelectedEquipment(null); }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-accent-gold/15 rounded-t-2xl p-5 pb-8 safe-bottom max-h-[70vh] overflow-y-auto animate-slide-up">
          {eq && (
            <>
              <div className="w-8 h-1 bg-border-default rounded-full mx-auto mb-5" />

              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                  {categoryLabels[eq.category] ?? eq.category}
                </span>
                {eq.equipType && (
                  <span className="text-[10px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">{eq.equipType}</span>
                )}
              </div>

              <Dialog.Title className="text-lg font-bold text-text-primary mb-1 leading-tight">
                {eq.name}
              </Dialog.Title>

              {/* Stats row */}
              {(eq.range || eq.modifiers.length > 0) && (
                <div className="flex gap-1.5 my-3 flex-wrap">
                  {eq.range && <StatPill label="RNG" value={eq.range} />}
                  {eq.modifiers.map((mod, i) => (
                    <StatPill key={i} label="MOD" value={mod} />
                  ))}
                </div>
              )}

              {/* Tags */}
              {eq.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {eq.tags.map((tag) => (
                    <span key={tag} className="text-[9px] text-accent-gold/70 bg-accent-gold/8 px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              )}

              {/* Description */}
              <Dialog.Description asChild>
                <div className="text-text-secondary text-[13px] leading-relaxed whitespace-pre-line">
                  {eq.description ? <KeywordText text={eq.description} /> : 'No additional details.'}
                </div>
              </Dialog.Description>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
