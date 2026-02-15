import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { useActiveGameSession } from '../hooks';

export function ActiveGameBanner() {
  const session = useActiveGameSession();
  const navigate = useNavigate();

  const warband = useLiveQuery(
    () => session ? db.warbands.get(session.warbandId) : undefined,
    [session?.warbandId]
  );

  if (!session) return null;

  const activeModels = session.modelStates.filter(m => m.status !== 'out');
  const activatedCount = activeModels.filter(m => m.activated).length;

  return (
    <button
      type="button"
      onClick={() => navigate(`/game/${session.id}`)}
      className="fixed bottom-16 left-0 right-0 z-25 mx-auto max-w-lg px-4"
    >
      <div className="flex items-center gap-3 px-4 py-2.5 bg-green-400/10 border border-green-400/25 rounded-xl backdrop-blur-lg cursor-pointer hover:bg-green-400/15 transition-colors">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
        <div className="flex-1 min-w-0 flex items-center gap-2 text-[11px]">
          <span className="font-semibold text-green-400">Turn {session.turn}</span>
          <span className="text-text-muted truncate">{warband?.name ?? 'Game'}</span>
          <span className="text-text-muted">{activatedCount}/{activeModels.length}</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400/60 shrink-0"><path d="M9 18l6-6-6-6" /></svg>
      </div>
    </button>
  );
}
