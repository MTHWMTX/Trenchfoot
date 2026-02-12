import * as Dialog from '@radix-ui/react-dialog';
import { useModelTemplates, useFaction } from '../hooks';
import { addModelToWarband } from '../actions';

interface ModelAddSheetProps {
  open: boolean;
  onClose: () => void;
  warbandId: string;
  factionId: string;
}

function formatDice(val: number | null): string {
  if (val === null || val === undefined) return '\u2014';
  if (val > 0) return `+${val}`;
  return `${val}`;
}

export function ModelAddSheet({ open, onClose, warbandId, factionId }: ModelAddSheetProps) {
  const templates = useModelTemplates(factionId);
  const faction = useFaction(factionId);

  const handleAdd = async (templateId: string) => {
    await addModelToWarband(warbandId, templateId);
    onClose();
  };

  // Build cost lookup from faction's model list
  const modelEntryMap = new Map((faction?.modelList ?? []).map(m => [m.modelId, m]));

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-accent-gold/15 rounded-t-2xl p-5 pb-8 safe-bottom max-h-[75vh] overflow-y-auto animate-slide-up">
          <div className="w-8 h-1 bg-border-default rounded-full mx-auto mb-5" />
          <Dialog.Title className="text-lg font-bold mb-1">Add Model</Dialog.Title>
          <Dialog.Description className="text-text-muted text-xs mb-4">Choose a model to add to your warband</Dialog.Description>

          <div className="flex flex-col gap-2">
            {templates.map((t) => {
              const entry = modelEntryMap.get(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleAdd(t.id)}
                  className="w-full text-left p-3 bg-bg-tertiary border border-border-default rounded-xl hover:border-accent-gold/20 transition-all cursor-pointer flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[13px] text-text-primary">{t.name}</span>
                      {t.tags.length > 0 && (
                        <span className="text-[9px] text-text-muted bg-bg-secondary px-1.5 py-0.5 rounded">
                          {t.tags[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      {entry && (
                        <span className={entry.costType === 'ducats' ? 'text-accent-gold' : 'text-purple-300'}>
                          {entry.cost} {entry.costType}
                        </span>
                      )}
                      {entry && entry.limitMax > 0 && <span className="text-text-muted">Max: {entry.limitMax}</span>}
                      <span className="text-text-muted">
                        MV{t.stats.movement} MEL{formatDice(t.stats.melee)} ARM{t.stats.armour}
                      </span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
                </button>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
