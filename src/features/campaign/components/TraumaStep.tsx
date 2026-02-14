import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { rollD6, rollD66, lookupEntry } from '../dice';
import { updateModelCampaignStatus, addScarToModel, updatePostGameSession } from '../actions';
import type { PostGameSession, WarbandModel, TraumaTable } from '../../../types';

interface TraumaStepProps {
  session: PostGameSession;
  models: WarbandModel[];
  traumaTables: TraumaTable[];
  gameNumber: number;
  onComplete: () => void;
}

const outcomeBadge = {
  dead: 'bg-accent-red/15 text-accent-red-bright',
  recovered: 'bg-green-400/15 text-green-400',
  scar: 'bg-yellow-400/15 text-yellow-400',
};

export function TraumaStep({ session, models, traumaTables, gameNumber, onComplete }: TraumaStepProps) {
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [rolledModels, setRolledModels] = useState<Set<string>>(
    new Set(session.traumaResults.map(r => r.modelId))
  );

  const aliveModels = models.filter(m => (m.campaignStatus ?? 'active') === 'active');

  const toggleModel = (id: string) => {
    setSelectedModels(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleRollTrauma = async (model: WarbandModel) => {
    const template = await db.modelTemplates.get(model.templateId);
    if (!template) return;

    const isElite = template.tags.some(t => t.toLowerCase().includes('elite'));
    const tableType = isElite ? 'elite' : 'non-elite';
    const table = traumaTables.find(t => t.modelType === tableType);
    if (!table) return;

    const roll = table.diceType === 'd66' ? rollD66() : rollD6();
    const entry = lookupEntry(table.entries, roll);
    if (!entry) return;

    // Apply effects
    if (entry.outcome === 'dead') {
      await updateModelCampaignStatus(model.id, 'dead');
    } else if (entry.outcome === 'scar') {
      await addScarToModel(model.id, {
        name: entry.name,
        effect: entry.effect,
        gameNumber,
      });
    }
    // 'recovered' = no status change needed

    // Log to session
    const modelName = model.customName || template.name;
    const traumaResult = {
      modelId: model.id,
      modelName,
      roll,
      entryId: entry.id,
      outcome: entry.outcome,
      entryName: entry.name,
    };

    await updatePostGameSession(session.id, {
      traumaResults: [...session.traumaResults, traumaResult],
    });

    setRolledModels(prev => new Set([...prev, model.id]));
  };

  const allSelectedRolled = selectedModels.size === 0 || [...selectedModels].every(id => rolledModels.has(id));

  return (
    <div>
      <h2 className="text-sm font-semibold text-text-secondary mb-1">Trauma Rolls</h2>
      <p className="text-text-muted text-xs mb-4">Select models that were taken Out of Action, then roll for each.</p>

      {/* Model selection */}
      {aliveModels.length > 0 ? (
        <div className="flex flex-col gap-1.5 mb-4">
          {aliveModels.map(model => {
            const isSelected = selectedModels.has(model.id);
            const hasRolled = rolledModels.has(model.id);
            const result = session.traumaResults.find(r => r.modelId === model.id);

            return (
              <TraumaModelRow
                key={model.id}
                model={model}
                isSelected={isSelected}
                hasRolled={hasRolled}
                result={result}
                onToggle={() => !hasRolled && toggleModel(model.id)}
                onRoll={() => handleRollTrauma(model)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-bg-secondary border border-border-default rounded-xl mb-4">
          <div className="text-text-muted text-xs">No active models in warband</div>
        </div>
      )}

      {/* Results summary */}
      {session.traumaResults.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Results</div>
          <div className="flex flex-col gap-1">
            {session.traumaResults.map((r, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-bg-secondary rounded-lg">
                <span className="text-[12px] text-text-primary font-medium flex-1">{r.modelName}</span>
                <span className="text-[10px] text-text-muted">Roll: {r.roll}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${outcomeBadge[r.outcome]}`}>
                  {r.outcome === 'scar' ? r.entryName : r.outcome}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continue */}
      <button
        type="button"
        onClick={onComplete}
        disabled={!allSelectedRolled}
        className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {selectedModels.size === 0 && session.traumaResults.length === 0 ? 'Skip — No Casualties' : 'Continue'}
      </button>
    </div>
  );
}

function TraumaModelRow({ model, isSelected, hasRolled, result, onToggle, onRoll }: {
  model: WarbandModel;
  isSelected: boolean;
  hasRolled: boolean;
  result?: PostGameSession['traumaResults'][0];
  onToggle: () => void;
  onRoll: () => void;
}) {
  const template = useLiveQuery(() => db.modelTemplates.get(model.templateId), [model.templateId]);
  const name = model.customName || template?.name || 'Unknown';

  return (
    <div className={`p-3 rounded-xl border transition-all ${
      hasRolled
        ? 'bg-bg-tertiary border-border-default'
        : isSelected
          ? 'bg-accent-red/5 border-accent-red/20'
          : 'bg-bg-secondary border-border-default'
    }`}>
      <div className="flex items-center gap-3">
        {!hasRolled && (
          <button
            type="button"
            onClick={onToggle}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
              isSelected ? 'border-accent-red bg-accent-red/20' : 'border-border-default bg-bg-tertiary'
            }`}
          >
            {isSelected && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent-red-bright"><path d="M20 6L9 17l-5-5" /></svg>
            )}
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-text-primary font-medium truncate">{name}</div>
          {template && (
            <div className="text-[10px] text-text-muted">
              {template.tags.some(t => t.toLowerCase().includes('elite')) ? 'Elite' : 'Non-Elite'}
            </div>
          )}
        </div>
        {isSelected && !hasRolled && (
          <button
            type="button"
            onClick={onRoll}
            className="px-3 py-1.5 bg-accent-red/15 border border-accent-red/30 rounded-lg text-accent-red-bright text-[11px] font-semibold hover:bg-accent-red/25 transition-colors cursor-pointer shrink-0"
          >
            Roll Trauma
          </button>
        )}
        {hasRolled && result && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${outcomeBadge[result.outcome]}`}>
            {result.outcome === 'scar' ? result.entryName : result.outcome}
          </span>
        )}
      </div>
    </div>
  );
}
