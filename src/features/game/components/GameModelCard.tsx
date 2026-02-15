import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { useGameStore } from '../store';
import { updateModelState } from '../actions';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import type { GameModelState, GameModelStatus } from '../../../types';

const statusConfig: Record<GameModelStatus, { label: string; badge: string; next: GameModelStatus }> = {
  active: { label: 'Active', badge: 'bg-green-400/15 text-green-400', next: 'down' },
  down: { label: 'Down', badge: 'bg-yellow-400/15 text-yellow-400', next: 'out' },
  out: { label: 'Out', badge: 'bg-accent-red/15 text-accent-red-bright', next: 'active' },
};

interface GameModelCardProps {
  model: GameModelState;
  sessionId: string;
}

function hasTough(
  templateTags: string[] | undefined,
  advancements: { name: string }[] | undefined
): boolean {
  if (templateTags?.some(t => t.toLowerCase() === 'tough')) return true;
  if (advancements?.some(a => a.name.toLowerCase() === 'tough')) return true;
  return false;
}

export function GameModelCard({ model, sessionId }: GameModelCardProps) {
  const template = useLiveQuery(() => db.modelTemplates.get(model.templateId), [model.templateId]);
  const { expandedModelId, setExpandedModel } = useGameStore();
  const isExpanded = expandedModelId === model.modelId;
  const [showToughPrompt, setShowToughPrompt] = useState(false);
  const [toughConfirmed, setToughConfirmed] = useState(false);

  // Load warbandModel eagerly (not just on expand) for TOUGH detection
  const warbandModel = useLiveQuery(
    () => db.warbandModels.get(model.modelId),
    [model.modelId]
  );

  const equipmentIds = warbandModel?.equipmentIds ?? [];
  const equipment = useLiveQuery(
    () => isExpanded && equipmentIds.length > 0
      ? db.equipmentTemplates.where('id').anyOf(equipmentIds).toArray()
      : [],
    [equipmentIds.join(','), isExpanded]
  ) ?? [];
  const addons = useLiveQuery(
    () => isExpanded && template?.addonIds?.length
      ? db.addons.where('id').anyOf(template.addonIds).toArray()
      : [],
    [template?.addonIds?.join(','), isExpanded]
  ) ?? [];

  const cfg = statusConfig[model.status];
  const isActivated = model.activated;
  const isOut = model.status === 'out';
  const modelIsTough = hasTough(template?.tags, warbandModel?.advancements);
  const toughUsed = model.toughUsed ?? false;

  function handleStatusCycle() {
    const next = cfg.next;
    // Intercept down → out for TOUGH models
    if (model.status === 'down' && next === 'out' && modelIsTough && !toughUsed) {
      setShowToughPrompt(true);
      return;
    }
    updateModelState(sessionId, model.modelId, { status: next });
  }

  function handleToughConfirm() {
    // Use TOUGH: stay down instead of going out
    setToughConfirmed(true);
    updateModelState(sessionId, model.modelId, { status: 'down', toughUsed: true });
  }

  function handleToughDecline() {
    // Decline TOUGH: go out
    updateModelState(sessionId, model.modelId, { status: 'out' });
  }

  // Out-of-action models show as collapsed summary
  if (isOut) {
    return (
      <div className="p-3 bg-bg-secondary/50 border border-accent-red/10 rounded-xl opacity-60">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-text-muted line-through">
            {model.customName || template?.name || 'Unknown'}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${cfg.badge}`}>{cfg.label}</span>
            <button
              type="button"
              onClick={() => updateModelState(sessionId, model.modelId, { status: 'active' })}
              className="text-[10px] text-text-muted hover:text-green-400 bg-transparent border-none cursor-pointer px-1"
              title="Restore to active"
            >
              Restore
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-bg-secondary border rounded-xl transition-all ${
      isActivated
        ? 'border-green-400/30 opacity-60'
        : model.status === 'down'
          ? 'border-yellow-400/20 bg-yellow-400/[0.03]'
          : 'border-border-default'
    }`}>
      {/* Header row */}
      <div className="flex items-center gap-2 p-3">
        {/* Activation toggle */}
        <button
          type="button"
          onClick={() => updateModelState(sessionId, model.modelId, { activated: !isActivated })}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
            isActivated
              ? 'bg-green-400 border-green-400'
              : 'bg-transparent border-border-default hover:border-green-400/50'
          }`}
        >
          {isActivated && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
          )}
        </button>

        {/* Name — tap to expand */}
        <button
          type="button"
          onClick={() => setExpandedModel(isExpanded ? null : model.modelId)}
          className="flex-1 text-left bg-transparent border-none cursor-pointer p-0 min-w-0"
        >
          <div className={`text-[13px] font-medium truncate ${isActivated ? 'text-text-muted' : 'text-text-primary'}`}>
            {model.customName || template?.name || 'Unknown'}
          </div>
        </button>

        {/* Status badge — tap to cycle */}
        <button
          type="button"
          onClick={handleStatusCycle}
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md cursor-pointer border-none ${cfg.badge}`}
        >
          {cfg.label}
        </button>
      </div>

      {/* Stat row */}
      {template && (
        <div className="flex items-center gap-3 px-3 pb-2 text-[10px] text-text-muted">
          <span>MV {template.stats.movement}</span>
          <span>RNG {template.stats.ranged ?? '—'}</span>
          <span>MEL {template.stats.melee ?? '—'}</span>
          <span>ARM {template.stats.armour}</span>
        </div>
      )}

      {/* Blood marker modifier reminders */}
      {model.bloodMarkers > 0 && (
        <div className="flex items-center gap-3 px-3 pb-1 text-[10px]">
          <span className="text-accent-red-bright">-{model.bloodMarkers} DICE to rolls</span>
          <span className="text-accent-red-bright">+{model.bloodMarkers} INJURY DICE against</span>
        </div>
      )}

      {/* Down status reminder */}
      {model.status === 'down' && (
        <div className="px-3 pb-1 text-[10px] text-yellow-400">
          Down: -1 DICE, +1 INJURY in melee
        </div>
      )}

      {/* Blood markers — row of 6 dots */}
      <div className="flex items-center gap-1.5 px-3 pb-2">
        <span className="text-[10px] text-text-muted w-10 shrink-0">Blood</span>
        <div className="flex gap-1">
          {Array.from({ length: 6 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => updateModelState(sessionId, model.modelId, {
                bloodMarkers: model.bloodMarkers === i + 1 ? i : i + 1,
              })}
              className={`w-4 h-4 rounded-full border-none cursor-pointer transition-colors ${
                i < model.bloodMarkers
                  ? 'bg-accent-red'
                  : 'bg-bg-tertiary hover:bg-accent-red/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Blessing & Infection counters */}
      <div className="flex items-center gap-4 px-3 pb-3 text-[10px]">
        <MarkerCounter
          label="Bless"
          value={model.blessingMarkers}
          color="text-accent-gold"
          onChange={(v) => updateModelState(sessionId, model.modelId, { blessingMarkers: v })}
        />
        <MarkerCounter
          label="Infect"
          value={model.infectionMarkers}
          color="text-purple-400"
          onChange={(v) => updateModelState(sessionId, model.modelId, { infectionMarkers: v })}
        />
      </div>

      {/* Expanded view */}
      {isExpanded && (
        <div className="border-t border-border-subtle px-3 py-2.5 space-y-2 animate-fade-in">
          {equipment.length > 0 && (
            <div>
              <div className="text-[10px] text-text-muted font-semibold mb-1">Equipment</div>
              <div className="flex flex-wrap gap-1">
                {equipment.map(e => (
                  <span key={e.id} className="text-[10px] px-1.5 py-0.5 bg-bg-tertiary border border-border-default rounded text-text-secondary">
                    {e.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {addons.length > 0 && (
            <div>
              <div className="text-[10px] text-text-muted font-semibold mb-1">Abilities</div>
              <div className="flex flex-col gap-1">
                {addons.map(a => (
                  <div key={a.id} className="text-[10px] text-text-secondary">
                    <span className="font-medium text-text-primary">{a.name}</span> — {a.description}
                  </div>
                ))}
              </div>
            </div>
          )}
          {warbandModel?.scars && warbandModel.scars.length > 0 && (
            <div>
              <div className="text-[10px] text-text-muted font-semibold mb-1">Scars</div>
              {warbandModel.scars.map(s => (
                <div key={s.id} className="text-[10px] text-accent-red-bright">{s.name}: {s.effect}</div>
              ))}
            </div>
          )}
          {warbandModel?.advancements && warbandModel.advancements.length > 0 && (
            <div>
              <div className="text-[10px] text-text-muted font-semibold mb-1">Advancements</div>
              {warbandModel.advancements.map(a => (
                <div key={a.id} className="text-[10px] text-accent-gold">{a.name}: {a.description}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOUGH prompt */}
      <ConfirmDialog
        open={showToughPrompt}
        onOpenChange={(open) => {
          if (!open && !toughConfirmed) {
            // Closed without confirming = decline TOUGH
            handleToughDecline();
          }
          setShowToughPrompt(open);
          if (!open) setToughConfirmed(false);
        }}
        title="TOUGH"
        description="This model has TOUGH. Use it to become Down instead of Out of Action?"
        confirmLabel="Use TOUGH"
        onConfirm={handleToughConfirm}
      />
    </div>
  );
}

function MarkerCounter({ label, value, color, onChange }: {
  label: string;
  value: number;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-text-muted w-9">{label}</span>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value === 0}
        className="w-5 h-5 rounded bg-bg-tertiary border-none cursor-pointer text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-default flex items-center justify-center text-xs font-bold"
      >
        −
      </button>
      <span className={`w-4 text-center font-semibold ${color}`}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-5 h-5 rounded bg-bg-tertiary border-none cursor-pointer text-text-muted hover:text-text-primary flex items-center justify-center text-xs font-bold"
      >
        +
      </button>
    </div>
  );
}
