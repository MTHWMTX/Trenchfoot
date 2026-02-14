import { MAX_GAMES } from '../progression';

interface CampaignSummaryProps {
  currentGame: number;
  thresholdValue: number;
  fieldStrength: number;
  gloryPoints: number;
  ducatStash: number;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-bg-tertiary">
      <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-text-primary">{value}</span>
    </div>
  );
}

export function CampaignSummary({ currentGame, thresholdValue, fieldStrength, gloryPoints, ducatStash }: CampaignSummaryProps) {
  const gameDisplay = `${Math.min(currentGame, MAX_GAMES)}/${MAX_GAMES}`;

  return (
    <div className="flex gap-2 flex-wrap">
      <Stat label="Game" value={gameDisplay} />
      <Stat label="Threshold" value={thresholdValue} />
      <Stat label="Strength" value={fieldStrength} />
      <Stat label="Glory" value={gloryPoints} />
      <Stat label="Ducats" value={ducatStash} />
    </div>
  );
}
