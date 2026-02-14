import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { addModelToWarband } from '../../warband/actions';
import type { Campaign, Warband, Faction, WarbandModel } from '../../../types';

interface ReinforcementStepProps {
  campaign: Campaign;
  warband: Warband | undefined;
  faction: Faction | undefined;
  models: WarbandModel[];
  onComplete: () => void;
}

function formatDice(val: number | null): string {
  if (val === null || val === undefined) return '\u2014';
  if (val > 0) return `+${val}`;
  return `${val}`;
}

export function ReinforcementStep({ campaign, warband, faction, models, onComplete }: ReinforcementStepProps) {
  const templates = useLiveQuery(
    () => warband ? db.modelTemplates.where('factionId').equals(warband.factionId).toArray() : [],
    [warband?.factionId]
  ) ?? [];

  const aliveModels = models.filter(m => (m.campaignStatus ?? 'active') !== 'dead');
  const modelCount = aliveModels.length;
  const modelCountByTemplate: Record<string, number> = {};
  for (const m of models) {
    if ((m.campaignStatus ?? 'active') !== 'dead') {
      modelCountByTemplate[m.templateId] = (modelCountByTemplate[m.templateId] ?? 0) + 1;
    }
  }

  const modelEntryMap = new Map((faction?.modelList ?? []).map(m => [m.modelId, m]));
  const atCapacity = modelCount >= campaign.fieldStrength;

  const handleAdd = async (templateId: string) => {
    if (!warband || atCapacity) return;
    const entry = modelEntryMap.get(templateId);
    if (entry && entry.limitMax > 0 && (modelCountByTemplate[templateId] ?? 0) >= entry.limitMax) return;
    await addModelToWarband(warband.id, templateId);
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-text-secondary mb-1">Reinforcements</h2>
      <p className="text-text-muted text-xs mb-4">Add models to your warband within the field strength limit.</p>

      {/* Capacity bar */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-bg-secondary border border-border-default rounded-xl">
        <div className="flex-1">
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Field Strength</div>
          <div className="text-sm font-bold text-text-primary">{modelCount} / {campaign.fieldStrength}</div>
        </div>
        <div className="flex-1">
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Threshold</div>
          <div className="text-sm font-bold text-accent-gold">{campaign.thresholdValue}d</div>
        </div>
        <div className="flex-1">
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Stash</div>
          <div className="text-sm font-bold text-accent-gold">{campaign.ducatStash}d</div>
        </div>
      </div>

      {atCapacity && (
        <div className="mb-3 px-3 py-2 bg-accent-gold/10 border border-accent-gold/20 rounded-lg text-accent-gold text-[11px] text-center">
          Field strength limit reached ({campaign.fieldStrength})
        </div>
      )}

      {/* Model templates */}
      <div className="flex flex-col gap-1.5 mb-4">
        {templates.map(t => {
          const entry = modelEntryMap.get(t.id);
          const count = modelCountByTemplate[t.id] ?? 0;
          const atTemplateLimit = entry != null && entry.limitMax > 0 && count >= entry.limitMax;
          const disabled = atCapacity || atTemplateLimit;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => !disabled && handleAdd(t.id)}
              className={`w-full text-left p-3 bg-bg-secondary border border-border-default rounded-xl transition-all flex items-center gap-3 ${
                disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-accent-gold/20 cursor-pointer'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-[13px] text-text-primary">{t.name}</span>
                  {t.tags.length > 0 && (
                    <span className="text-[9px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
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
                  {entry && entry.limitMax > 0 && (
                    <span className={count >= entry.limitMax ? 'text-accent-gold' : 'text-text-muted'}>
                      {count}/{entry.limitMax}
                    </span>
                  )}
                  <span className="text-text-muted">
                    MV{t.stats.movement} RNG{formatDice(t.stats.ranged)} MEL{formatDice(t.stats.melee)} ARM{t.stats.armour}
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer"
      >
        Continue
      </button>
    </div>
  );
}
