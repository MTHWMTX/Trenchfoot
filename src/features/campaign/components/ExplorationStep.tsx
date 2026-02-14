import { useState } from 'react';
import { rollD6, lookupEntry } from '../dice';
import { addDucatsToStash, addGloryPoints, updatePostGameSession } from '../actions';
import type { PostGameSession, ExplorationTable } from '../../../types';

interface ExplorationStepProps {
  session: PostGameSession;
  campaignId: string;
  explorationTables: ExplorationTable[];
  onComplete: () => void;
}

const tierOrder = ['common', 'rare', 'legendary'] as const;
const tierStyles: Record<string, string> = {
  common: 'border-border-default bg-bg-tertiary text-text-secondary',
  rare: 'border-accent-gold/30 bg-accent-gold/10 text-accent-gold',
  legendary: 'border-purple-400/30 bg-purple-400/10 text-purple-300',
};

export function ExplorationStep({ session, campaignId, explorationTables, onComplete }: ExplorationStepProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);

  const handleRoll = async () => {
    if (!selectedTier || rolling) return;
    setRolling(true);

    const table = explorationTables.find(t => t.tier === selectedTier);
    if (!table) { setRolling(false); return; }

    const roll = rollD6();
    const entry = lookupEntry(table.entries, roll);
    if (!entry) { setRolling(false); return; }

    // Apply reward
    let rewardText = '';
    if (entry.reward.type === 'ducats' && entry.reward.value) {
      await addDucatsToStash(campaignId, entry.reward.value);
      rewardText = `+${entry.reward.value} ducats`;
    } else if (entry.reward.type === 'glory' && entry.reward.value) {
      await addGloryPoints(campaignId, entry.reward.value);
      rewardText = `+${entry.reward.value} glory`;
    } else if (entry.reward.type === 'equipment') {
      rewardText = `Equipment: ${entry.reward.equipmentId ?? 'unknown'}`;
    } else if (entry.reward.type === 'special') {
      rewardText = entry.reward.specialText ?? 'Special reward';
    }

    // Log to session
    const explorationResult = {
      tier: selectedTier,
      roll,
      entryId: entry.id,
      entryName: entry.name,
      rewardText,
    };

    await updatePostGameSession(session.id, {
      explorationResults: [...session.explorationResults, explorationResult],
    });

    setSelectedTier(null);
    setRolling(false);
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-text-secondary mb-1">Exploration</h2>
      <p className="text-text-muted text-xs mb-4">Pick a tier and roll for rewards.</p>

      {/* Tier selection */}
      <div className="flex gap-2 mb-4">
        {tierOrder.map(tier => {
          const table = explorationTables.find(t => t.tier === tier);
          if (!table) return null;
          const isSelected = selectedTier === tier;
          return (
            <button
              key={tier}
              type="button"
              onClick={() => setSelectedTier(tier)}
              className={`flex-1 py-3 rounded-xl text-[12px] font-medium border transition-all cursor-pointer capitalize ${
                isSelected ? tierStyles[tier] : 'border-border-default bg-bg-secondary text-text-muted hover:bg-bg-tertiary'
              }`}
            >
              {tier}
            </button>
          );
        })}
      </div>

      {/* Roll button */}
      {selectedTier && (
        <button
          type="button"
          onClick={handleRoll}
          disabled={rolling}
          className="w-full py-2.5 mb-4 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-[12px] font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer disabled:opacity-40"
        >
          {rolling ? 'Rolling...' : `Roll ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Exploration`}
        </button>
      )}

      {/* Results */}
      {session.explorationResults.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Results</div>
          <div className="flex flex-col gap-1.5">
            {session.explorationResults.map((r, i) => (
              <div key={i} className="p-3 bg-bg-secondary border border-border-default rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-text-primary font-medium">{r.entryName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted capitalize">{r.tier}</span>
                    <span className="text-[10px] text-text-muted">Roll: {r.roll}</span>
                  </div>
                </div>
                <div className="text-[11px] text-accent-gold">{r.rewardText}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {explorationTables.length === 0 && (
        <div className="text-center py-8 bg-bg-secondary border border-border-default rounded-xl mb-4">
          <div className="text-text-muted text-xs">No exploration tables loaded</div>
        </div>
      )}

      <button
        type="button"
        onClick={onComplete}
        className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer"
      >
        {session.explorationResults.length === 0 ? 'Skip Exploration' : 'Continue'}
      </button>
    </div>
  );
}
