import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { createGameSession } from '../actions';

interface SetupState {
  warbandId: string;
  campaignId: string | null;
}

export function GameSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { warbandId, campaignId } = (location.state as SetupState) ?? {};

  const warband = useLiveQuery(
    () => warbandId ? db.warbands.get(warbandId) : undefined,
    [warbandId]
  );

  const models = useLiveQuery(
    () => warbandId ? db.warbandModels.where('warbandId').equals(warbandId).sortBy('order') : [],
    [warbandId]
  ) ?? [];

  const templates = useLiveQuery(
    () => {
      const ids = models.map(m => m.templateId);
      return ids.length > 0 ? db.modelTemplates.where('id').anyOf(ids).toArray() : [];
    },
    [models.map(m => m.templateId).join(',')]
  ) ?? [];

  const templateMap = new Map(templates.map(t => [t.id, t]));

  // Filter to eligible models (active campaign models only for campaign games)
  const eligible = campaignId
    ? models.filter(m => (m.campaignStatus ?? 'active') === 'active')
    : models;

  const [scenarioName, setScenarioName] = useState('');
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [starting, setStarting] = useState(false);

  if (!warbandId) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <Link to="/warband" className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <div className="text-center py-16 text-text-muted text-sm mt-4">Missing warband info.</div>
      </div>
    );
  }

  const backTo = campaignId ? `/campaign/${campaignId}` : `/warband/${warbandId}`;
  const selectedCount = eligible.length - excluded.size;

  function toggleModel(modelId: string) {
    setExcluded(prev => {
      const next = new Set(prev);
      if (next.has(modelId)) next.delete(modelId);
      else next.add(modelId);
      return next;
    });
  }

  async function handleStart() {
    if (starting) return;
    setStarting(true);
    try {
      const newId = await createGameSession(
        warbandId,
        campaignId,
        scenarioName.trim(),
        Array.from(excluded)
      );
      navigate(`/game/${newId}`, { replace: true });
    } catch {
      setStarting(false);
    }
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Back */}
      <Link to={backTo} className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
        Back
      </Link>

      <h1 className="text-xl font-bold mb-1">Game Setup</h1>
      <p className="text-text-muted text-xs mb-5">{warband?.name ?? 'Warband'}</p>

      {/* Scenario name */}
      <div className="mb-5">
        <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Scenario</label>
        <input
          type="text"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          placeholder="Scenario name (optional)"
          className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim"
        />
      </div>

      {/* Model checklist */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] text-text-muted uppercase tracking-wider">Models</label>
          <span className="text-[11px] text-text-muted">{selectedCount}/{eligible.length} selected</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {eligible.map(model => {
            const tmpl = templateMap.get(model.templateId);
            const checked = !excluded.has(model.id);
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => toggleModel(model.id)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  checked
                    ? 'bg-bg-secondary border-border-default'
                    : 'bg-bg-secondary/50 border-border-default/50 opacity-50'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  checked
                    ? 'bg-accent-gold border-accent-gold'
                    : 'bg-transparent border-border-default'
                }`}>
                  {checked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-text-primary font-medium truncate">
                    {model.customName || tmpl?.name || 'Unknown'}
                  </div>
                  {tmpl && (
                    <div className="text-[10px] text-text-muted">
                      MV {tmpl.stats.movement} · RNG {tmpl.stats.ranged ?? '—'} · MEL {tmpl.stats.melee ?? '—'} · ARM {tmpl.stats.armour}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start button */}
      <button
        type="button"
        onClick={handleStart}
        disabled={selectedCount === 0 || starting}
        className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
      >
        {starting ? 'Starting...' : `Start Game (${selectedCount} models)`}
      </button>
    </div>
  );
}
