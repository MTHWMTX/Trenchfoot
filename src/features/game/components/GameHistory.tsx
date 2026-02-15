import { useState } from 'react';
import { useCompletedGamesForWarband } from '../hooks';
import { deleteGameSession } from '../actions';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

interface GameHistoryProps {
  warbandId: string;
}

export function GameHistory({ warbandId }: GameHistoryProps) {
  const games = useCompletedGamesForWarband(warbandId);
  const [showAll, setShowAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (games.length === 0) return null;

  const visible = showAll ? games : games.slice(0, 5);

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-text-secondary mb-3">Game Sessions</h2>
      <div className="flex flex-col gap-1.5">
        {visible.map(session => {
          const active = session.modelStates.filter(m => m.status === 'active').length;
          const down = session.modelStates.filter(m => m.status === 'down').length;
          const out = session.modelStates.filter(m => m.status === 'out').length;
          const date = session.updatedAt instanceof Date
            ? session.updatedAt
            : new Date(session.updatedAt);

          return (
            <div key={session.id} className="p-3 bg-bg-secondary border border-border-default rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-text-primary font-medium">
                    {session.scenarioName || 'Unnamed Game'}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {date.toLocaleDateString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDeletingId(session.id)}
                  className="w-6 h-6 flex items-center justify-center rounded bg-transparent border-none cursor-pointer text-text-muted hover:text-accent-red-bright transition-colors"
                  title="Delete session"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-text-muted">{session.turn} turn{session.turn !== 1 ? 's' : ''}</span>
                <span className="text-green-400">{active} active</span>
                <span className="text-yellow-400">{down} down</span>
                <span className="text-accent-red-bright">{out} out</span>
              </div>
            </div>
          );
        })}
      </div>

      {games.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-2 py-2 text-[11px] text-text-muted hover:text-accent-gold bg-transparent border-none cursor-pointer transition-colors"
        >
          {showAll ? 'Show less' : `Show all (${games.length})`}
        </button>
      )}

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => { if (!open) setDeletingId(null); }}
        title="Delete Session"
        description="Delete this game session? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => {
          if (deletingId) deleteGameSession(deletingId);
        }}
      />
    </div>
  );
}
