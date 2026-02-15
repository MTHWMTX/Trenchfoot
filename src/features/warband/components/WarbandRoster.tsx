import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWarband, useWarbandModels, useWarbandCost, useFaction } from '../hooks';
import { removeModelFromWarband } from '../actions';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { WarbandSummary } from './WarbandSummary';
import { FactionBadge } from './FactionBadge';
import { ModelCard } from './ModelCard';
import { ModelAddSheet } from './ModelAddSheet';
import { ModelEditSheet } from './ModelEditSheet';
import { WarbandEditSheet } from './WarbandEditSheet';
import { useActiveGameForWarband } from '../../game/hooks';
import { GameHistory } from '../../game/components/GameHistory';

export function WarbandRoster() {
  const { id } = useParams<{ id: string }>();
  const warband = useWarband(id ?? '');
  const models = useWarbandModels(id ?? '');
  const cost = useWarbandCost(id ?? '');
  const faction = useFaction(warband?.factionId ?? '');
  const navigate = useNavigate();
  const activeGame = useActiveGameForWarband(id ?? '');
  const [addingModel, setAddingModel] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [editingWarband, setEditingWarband] = useState(false);

  const editingModel = useLiveQuery(
    () => (editingModelId ? db.warbandModels.get(editingModelId) : undefined),
    [editingModelId]
  );

  if (warband === undefined) {
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

  if (!warband) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <Link to="/warband" className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
          Warbands
        </Link>
        <div className="text-center py-16 text-text-muted text-sm mt-4">Warband not found.</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Back */}
      <Link to="/warband" className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
        Warbands
      </Link>

      {/* Header */}
      <div className="mb-4">
        {faction && <FactionBadge name={faction.name} team={faction.team} />}
        <div className="flex items-center gap-2 mt-2">
          <h1 className="text-xl font-bold">{warband.name}</h1>
          <button
            type="button"
            onClick={() => setEditingWarband(true)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-bg-tertiary text-text-muted hover:text-accent-gold hover:bg-accent-gold/10 transition-colors border-none cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
          </button>
          {activeGame ? (
            <button
              type="button"
              onClick={() => navigate(`/game/${activeGame.id}`)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-green-400/15 border border-green-400/30 rounded-lg text-green-400 text-[11px] font-semibold hover:bg-green-400/25 transition-colors cursor-pointer"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Resume Game
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/game/setup', { state: { warbandId: warband.id, campaignId: null } })}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-accent-gold/15 border border-accent-gold/30 rounded-lg text-accent-gold text-[11px] font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              Start Game
            </button>
          )}
        </div>
        {warband.notes && (
          <p className="text-text-muted text-xs mt-1.5 whitespace-pre-line">{warband.notes}</p>
        )}
      </div>

      {/* Summary bar */}
      <div className="sticky top-[53px] z-20 -mx-4 px-4 py-3 bg-bg-primary/90 backdrop-blur-lg border-b border-border-subtle mb-4">
        <WarbandSummary
          ducats={cost.ducats}
          ducatLimit={warband.ducatLimit}
          glory={cost.glory}
          gloryLimit={warband.gloryLimit}
          modelCount={cost.modelCount}
          modelLimit={warband.modelLimit}
        />
      </div>

      {/* Model cards */}
      <div className="grid grid-cols-1 gap-2 mb-4">
        {models.map((model, i) => (
          <div key={model.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}>
            <ModelCard
              model={model}
              faction={faction}
              onTap={() => setEditingModelId(model.id)}
              onDelete={() => removeModelFromWarband(model.id)}
            />
          </div>
        ))}

        {/* Add model card */}
        <button
          type="button"
          onClick={() => setAddingModel(true)}
          className="p-4 border-2 border-dashed border-border-default rounded-xl text-text-muted hover:border-accent-gold/30 hover:text-accent-gold transition-all cursor-pointer bg-transparent flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
          <span className="text-sm font-medium">Add Model</span>
        </button>
      </div>

      {/* Game history */}
      <GameHistory warbandId={warband.id} />

      {/* Add model sheet */}
      <ModelAddSheet
        open={addingModel}
        onClose={() => setAddingModel(false)}
        warbandId={warband.id}
        factionId={warband.factionId}
        modelCountByTemplate={cost.modelCountByTemplate}
        modelCount={cost.modelCount}
        modelLimit={warband.modelLimit}
      />

      {/* Edit model sheet */}
      <ModelEditSheet
        model={editingModel ?? null}
        faction={faction}
        onClose={() => setEditingModelId(null)}
      />

      {/* Edit warband sheet */}
      <WarbandEditSheet
        warband={warband}
        open={editingWarband}
        onClose={() => setEditingWarband(false)}
      />
    </div>
  );
}
