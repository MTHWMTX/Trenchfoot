import * as Dialog from '@radix-ui/react-dialog';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRulesStore } from '../../features/rules/store';
import { db } from '../../data/db';
import { KeywordText } from '../keyword/KeywordText';

function formatDice(val: number | null): string {
  if (val === null || val === undefined) return '\u2014';
  if (val > 0) return `+${val}`;
  return `${val}`;
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center bg-bg-tertiary rounded-lg px-2.5 py-1.5 min-w-[40px]">
      <span className="text-[9px] text-text-muted uppercase tracking-wider">{label}</span>
      <span className="text-[13px] font-bold text-text-primary">{value}</span>
    </div>
  );
}

const tagColors: Record<string, string> = {
  elite: 'text-purple-400 bg-purple-400/10',
  hero: 'text-accent-gold bg-accent-gold/10',
  tough: 'text-green-400 bg-green-400/10',
  fear: 'text-red-400 bg-red-400/10',
};

export function ModelSheet() {
  const selectedModelId = useRulesStore((s) => s.selectedModelId);
  const setSelectedModel = useRulesStore((s) => s.setSelectedModel);

  const model = useLiveQuery(
    () => selectedModelId ? db.modelTemplates.get(selectedModelId) : undefined,
    [selectedModelId]
  );

  const faction = useLiveQuery(
    () => model?.factionId ? db.factions.get(model.factionId) : undefined,
    [model?.factionId]
  );

  return (
    <Dialog.Root
      open={!!selectedModelId}
      onOpenChange={(open) => { if (!open) setSelectedModel(null); }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-accent-gold/15 rounded-t-2xl p-5 pb-8 safe-bottom max-h-[70vh] overflow-y-auto animate-slide-up">
          {model && (
            <>
              <div className="w-8 h-1 bg-border-default rounded-full mx-auto mb-5" />

              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-blue">Model</span>
                {faction && (
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">{faction.name}</span>
                )}
              </div>

              <Dialog.Title className="text-lg font-bold text-text-primary mb-1 leading-tight flex items-center gap-2">
                {model.name}
                {model.tags.filter(t => tagColors[t]).map(tag => (
                  <span key={tag} className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${tagColors[tag]}`}>
                    {tag}
                  </span>
                ))}
              </Dialog.Title>

              {/* Stats */}
              <div className="flex gap-1.5 my-3">
                <StatPill label="MV" value={model.stats.movement} />
                <StatPill label="RNG" value={formatDice(model.stats.ranged)} />
                <StatPill label="MEL" value={formatDice(model.stats.melee)} />
                <StatPill label="ARM" value={model.stats.armour} />
                <StatPill label="BASE" value={model.stats.base.join('x')} />
              </div>

              {/* Tags */}
              {model.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {model.tags.map((tag) => (
                    <span key={tag} className="text-[9px] text-accent-gold/70 bg-accent-gold/8 px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              )}

              {/* Blurb */}
              <Dialog.Description asChild>
                <div className="text-text-secondary text-[13px] leading-relaxed whitespace-pre-line">
                  {model.blurb && <KeywordText text={model.blurb} />}
                </div>
              </Dialog.Description>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
