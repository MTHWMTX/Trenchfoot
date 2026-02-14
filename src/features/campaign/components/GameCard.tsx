import type { CampaignGame } from '../../../types';

interface GameCardProps {
  game: CampaignGame;
}

const resultStyles = {
  win: 'bg-accent-gold/15 text-accent-gold border-accent-gold/30',
  loss: 'bg-accent-red/15 text-accent-red-bright border-accent-red/30',
  draw: 'bg-bg-tertiary text-text-muted border-border-default',
};

export function GameCard({ game }: GameCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-bg-secondary border border-border-default rounded-xl">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-bg-tertiary text-text-secondary text-sm font-bold">
        {game.gameNumber}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-text-primary font-medium truncate">
          vs {game.opponentName || 'Unknown'}
        </div>
        {game.scenarioName && (
          <div className="text-[11px] text-text-muted truncate">{game.scenarioName}</div>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {game.postGameCompleted && (
          <span className="text-[9px] text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded" title="Post-game completed">PG</span>
        )}
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border capitalize ${resultStyles[game.result]}`}>
          {game.result}
        </span>
      </div>
    </div>
  );
}
