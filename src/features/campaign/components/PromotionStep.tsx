import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { rollD6, lookupEntry } from '../dice';
import { addAdvancementToModel, updatePromotionDice, updatePostGameSession } from '../actions';
import type { PostGameSession, WarbandModel, SkillTable } from '../../../types';

interface PromotionStepProps {
  session: PostGameSession;
  models: WarbandModel[];
  skillTables: SkillTable[];
  gameNumber: number;
  onComplete: () => void;
}

export function PromotionStep({ session, models, skillTables, gameNumber, onComplete }: PromotionStepProps) {
  // Models alive with promotion potential
  const eligibleModels = models.filter(m => {
    if ((m.campaignStatus ?? 'active') !== 'active') return false;
    return true; // We'll check promotion dice per-model below
  });

  const noEligible = eligibleModels.length === 0;

  return (
    <div>
      <h2 className="text-sm font-semibold text-text-secondary mb-1">Promotions</h2>
      <p className="text-text-muted text-xs mb-4">
        Roll skill advancements for eligible models. Each model earns promotion dice based on their template.
      </p>

      {noEligible ? (
        <div className="text-center py-8 bg-bg-secondary border border-border-default rounded-xl mb-4">
          <div className="text-text-muted text-xs">No eligible models for promotion</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mb-4">
          {eligibleModels.map(model => (
            <PromotionModelRow
              key={model.id}
              model={model}
              session={session}
              skillTables={skillTables}
              gameNumber={gameNumber}
            />
          ))}
        </div>
      )}

      {/* Results summary */}
      {session.promotionResults.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Results</div>
          <div className="flex flex-col gap-1">
            {session.promotionResults.map((r, i) => (
              <div key={i} className="p-2 bg-bg-secondary rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-text-primary font-medium">{r.modelName}</span>
                  <span className="text-[10px] text-text-muted">Roll: {r.roll}</span>
                </div>
                <div className="text-[11px] text-accent-gold mt-0.5">{r.skillName} ({r.tableName})</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onComplete}
        className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer"
      >
        {noEligible ? 'Skip — No Eligible Models' : 'Continue'}
      </button>
    </div>
  );
}

function PromotionModelRow({ model, session, skillTables, gameNumber }: {
  model: WarbandModel;
  session: PostGameSession;
  skillTables: SkillTable[];
  gameNumber: number;
}) {
  const template = useLiveQuery(() => db.modelTemplates.get(model.templateId), [model.templateId]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);

  const name = model.customName || template?.name || 'Unknown';
  const promotionPerGame = template?.promotion ?? 0;
  const earned = model.promotionDiceEarned ?? 0;
  const spent = model.promotionDiceSpent ?? 0;

  // This game earns promotion dice — compute new earned
  const newEarned = earned + promotionPerGame;
  const available = newEarned - spent;

  // Check if already rolled this session
  const alreadyRolled = session.promotionResults.filter(r => r.modelId === model.id);
  const diceRemaining = available - alreadyRolled.length;

  if (promotionPerGame === 0 || diceRemaining <= 0) {
    if (promotionPerGame === 0) return null;
    return (
      <div className="p-3 bg-bg-secondary border border-border-default rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-text-primary font-medium truncate">{name}</div>
            <div className="text-[10px] text-text-muted">All promotion dice used</div>
          </div>
          <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-md">Done</span>
        </div>
      </div>
    );
  }

  const handleRoll = async () => {
    if (!selectedTable || rolling) return;
    setRolling(true);

    const table = skillTables.find(t => t.id === selectedTable);
    if (!table) { setRolling(false); return; }

    const roll = rollD6();
    const entry = lookupEntry(table.entries, roll);
    if (!entry) { setRolling(false); return; }

    // Apply advancement
    await addAdvancementToModel(model.id, {
      name: entry.name,
      description: entry.description,
      table: table.name,
      gameNumber,
    });

    // Update promotion dice tracking
    await updatePromotionDice(model.id, newEarned, spent + 1);

    // Log to session
    const promotionResult = {
      modelId: model.id,
      modelName: name,
      tableId: table.id,
      tableName: table.name,
      roll,
      entryId: entry.id,
      skillName: entry.name,
    };

    await updatePostGameSession(session.id, {
      promotionResults: [...session.promotionResults, promotionResult],
    });

    setSelectedTable(null);
    setRolling(false);
  };

  return (
    <div className="p-3 bg-bg-secondary border border-border-default rounded-xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-text-primary font-medium truncate">{name}</div>
          <div className="text-[10px] text-text-muted">
            {diceRemaining} dice remaining
          </div>
        </div>
        <span className="text-[10px] text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-md">
          {diceRemaining}d
        </span>
      </div>

      {/* Table selection */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {skillTables.map(table => (
          <button
            key={table.id}
            type="button"
            onClick={() => setSelectedTable(table.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all cursor-pointer ${
              selectedTable === table.id
                ? 'border-accent-gold/30 bg-accent-gold/10 text-accent-gold'
                : 'border-border-default bg-bg-tertiary text-text-muted hover:border-accent-gold/15'
            }`}
          >
            {table.name}
          </button>
        ))}
      </div>

      {selectedTable && (
        <button
          type="button"
          onClick={handleRoll}
          disabled={rolling}
          className="w-full py-2 bg-accent-gold/15 border border-accent-gold/30 rounded-lg text-accent-gold text-[11px] font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer disabled:opacity-40"
        >
          {rolling ? 'Rolling...' : 'Roll Promotion'}
        </button>
      )}
    </div>
  );
}
