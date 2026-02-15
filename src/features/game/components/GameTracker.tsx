import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { useGameSession } from '../hooks';
import { advanceTurn, endGameSession, undoGameState, redoGameState } from '../actions';
import { useGameStore } from '../store';
import { useUndoStore } from '../undoStore';
import { useCampaign } from '../../campaign/hooks';
import { GameModelCard } from './GameModelCard';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { RecordGameSheet } from '../../campaign/components/RecordGameSheet';

export function GameTracker() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const session = useGameSession(sessionId ?? '');
  const navigate = useNavigate();
  const { setExpandedModel } = useGameStore();
  const undoPast = useUndoStore(s => s.past);
  const undoFuture = useUndoStore(s => s.future);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [recordingEnd, setRecordingEnd] = useState(false);
  const campaign = useCampaign(session?.campaignId ?? '');

  const warband = useLiveQuery(
    () => session ? db.warbands.get(session.warbandId) : undefined,
    [session?.warbandId]
  );
  const faction = useLiveQuery(
    () => warband ? db.factions.get(warband.factionId) : undefined,
    [warband?.factionId]
  );

  if (session === undefined) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-24 bg-bg-tertiary rounded" />
          <div className="h-6 w-48 bg-bg-tertiary rounded" />
          <div className="h-20 w-full bg-bg-tertiary rounded-xl" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <Link to="/warband" className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <div className="text-center py-16 text-text-muted text-sm mt-4">Game session not found.</div>
      </div>
    );
  }

  const backTo = session.campaignId
    ? `/campaign/${session.campaignId}`
    : `/warband/${session.warbandId}`;
  const backLabel = session.campaignId ? 'Campaign' : 'Warband';

  const activeModels = session.modelStates.filter(m => m.status !== 'out');
  const outModels = session.modelStates.filter(m => m.status === 'out');
  const activatedCount = activeModels.filter(m => m.activated).length;
  const totalActive = activeModels.length;

  async function handleEndGame() {
    await endGameSession(session!.id);
    setExpandedModel(null);
    navigate(backTo);
  }

  async function handleNextTurn() {
    await advanceTurn(session!.id);
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Back */}
      <Link to={backTo} className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
        {backLabel}
      </Link>

      {/* Header */}
      <div className="mb-4">
        {faction && (
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold mb-2 ${
            faction.team === 'heaven' ? 'bg-accent-gold/10 text-accent-gold' : 'bg-accent-red/10 text-accent-red-bright'
          }`}>
            {faction.name}
          </div>
        )}
        <h1 className="text-xl font-bold">{warband?.name ?? 'Game'}</h1>
        {session.scenarioName && (
          <div className="text-text-muted text-xs mt-1">{session.scenarioName}</div>
        )}
      </div>

      {/* Sticky turn bar */}
      <div className="sticky top-[53px] z-20 -mx-4 px-4 py-3 bg-bg-primary/90 backdrop-blur-lg border-b border-border-subtle mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => undoGameState(session.id)}
                disabled={undoPast.length === 0}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-bg-tertiary border-none cursor-pointer text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-default transition-colors"
                title="Undo"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6.69 3L3 13" /></svg>
              </button>
              <button
                type="button"
                onClick={() => redoGameState(session.id)}
                disabled={undoFuture.length === 0}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-bg-tertiary border-none cursor-pointer text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-default transition-colors"
                title="Redo"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 019-9 9 9 0 016.69 3L21 13" /></svg>
              </button>
            </div>
            <span className="text-sm font-bold text-text-primary">Turn {session.turn}</span>
            <span className="text-[11px] text-text-muted">
              {activatedCount}/{totalActive} activated
            </span>
          </div>
          <button
            type="button"
            onClick={handleNextTurn}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-gold/15 border border-accent-gold/30 rounded-lg text-accent-gold text-[11px] font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer"
          >
            Next Turn
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      {/* Active / Down model cards */}
      <div className="flex flex-col gap-2 mb-4">
        {activeModels.map((model, i) => (
          <div key={model.modelId} className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}>
            <GameModelCard model={model} sessionId={session.id} />
          </div>
        ))}
      </div>

      {/* Out-of-action section */}
      {outModels.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-text-muted mb-2">
            Out of Action ({outModels.length})
          </div>
          <div className="flex flex-col gap-1.5">
            {outModels.map(model => (
              <GameModelCard key={model.modelId} model={model} sessionId={session.id} />
            ))}
          </div>
        </div>
      )}

      {/* End game */}
      <button
        type="button"
        onClick={() => {
          if (session.campaignId && campaign) {
            setRecordingEnd(true);
          } else {
            setConfirmEnd(true);
          }
        }}
        className="w-full py-3 bg-accent-red/10 border border-accent-red/20 rounded-xl text-accent-red-bright text-sm font-semibold hover:bg-accent-red/20 transition-colors cursor-pointer mb-4"
      >
        End Game
      </button>

      {/* Standalone end confirm */}
      <ConfirmDialog
        open={confirmEnd}
        onOpenChange={setConfirmEnd}
        title="End Game"
        description="Are you sure you want to end this game session? The session will be marked as completed."
        confirmLabel="End Game"
        confirmVariant="danger"
        onConfirm={handleEndGame}
      />

      {/* Campaign end → record game */}
      {session.campaignId && campaign && (
        <RecordGameSheet
          open={recordingEnd}
          onClose={() => setRecordingEnd(false)}
          campaignId={session.campaignId}
          gameNumber={campaign.currentGame}
          defaultScenario={session.scenarioName}
          onRecorded={async () => {
            await endGameSession(session.id);
            setExpandedModel(null);
            navigate(backTo);
          }}
        />
      )}
    </div>
  );
}
