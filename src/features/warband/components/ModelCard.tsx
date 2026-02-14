import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { useAddons } from '../hooks';
import type { WarbandModel, Faction } from '../../../types';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

interface ModelCardProps {
  model: WarbandModel;
  faction: Faction | undefined;
  onTap: () => void;
  onDelete: () => void;
}

function formatDice(val: number | null): string {
  if (val === null || val === undefined) return '\u2014';
  if (val > 0) return `+${val}`;
  return `${val}`;
}

export function ModelCard({ model, faction, onTap, onDelete }: ModelCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const template = useLiveQuery(() => db.modelTemplates.get(model.templateId), [model.templateId]);
  const equipment = useLiveQuery(
    () => Promise.all(model.equipmentIds.map((id) => db.equipmentTemplates.get(id))),
    [model.equipmentIds]
  );
  const addons = useAddons(template?.addonIds ?? []);

  if (!template) return null;

  // Look up cost from faction
  const modelEntry = faction?.modelList.find(m => m.modelId === model.templateId);
  const modelCost = modelEntry?.cost ?? 0;
  const modelCostType = modelEntry?.costType ?? 'ducats';

  // Equipment costs from faction
  const eqCost = (model.equipmentIds ?? []).reduce((sum, eqId) => {
    const entry = faction?.equipmentList.find(e => e.equipId === eqId);
    return sum + (entry && entry.costType === 'ducats' ? entry.cost : 0);
  }, 0);
  const eqGlory = (model.equipmentIds ?? []).reduce((sum, eqId) => {
    const entry = faction?.equipmentList.find(e => e.equipId === eqId);
    return sum + (entry && entry.costType === 'glory' ? entry.cost : 0);
  }, 0);

  const totalDucats = (modelCostType === 'ducats' ? modelCost : 0) + eqCost;
  const totalGlory = (modelCostType === 'glory' ? modelCost : 0) + eqGlory;

  const primaryTag = template.tags.find(t => ['elite', 'hero', 'tough', 'fear'].includes(t));
  const tagColors: Record<string, string> = {
    elite: 'bg-accent-gold/15 text-accent-gold',
    hero: 'bg-purple-900/30 text-purple-300',
    tough: 'bg-green-900/30 text-green-300',
    fear: 'bg-accent-red/20 text-accent-red-bright',
  };

  return (
    <div
      className="group bg-bg-secondary border border-border-default rounded-xl p-3.5 hover:border-accent-gold/20 transition-all duration-200 cursor-pointer relative"
      onClick={onTap}
    >
      {/* Delete button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-bg-tertiary text-text-muted hover:bg-accent-red/20 hover:text-accent-red-bright transition-colors opacity-0 group-hover:opacity-100 border-none cursor-pointer"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>

      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[13px] text-text-primary truncate">
            {model.customName || template.name}
          </div>
          {model.customName && (
            <div className="text-[11px] text-text-muted truncate">{template.name}</div>
          )}
        </div>
        {primaryTag && (
          <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${tagColors[primaryTag] ?? 'bg-bg-tertiary text-text-muted'}`}>
            {primaryTag}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex gap-2 mb-2">
        {[
          { label: 'MV', value: `${template.stats.movement}` },
          { label: 'RNG', value: formatDice(template.stats.ranged) },
          { label: 'MEL', value: formatDice(template.stats.melee) },
          { label: 'ARM', value: `${template.stats.armour}` },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center">
            <span className="text-[8px] text-text-muted uppercase">{s.label}</span>
            <span className="text-[11px] font-bold text-text-secondary">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Equipment */}
      {equipment && equipment.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {equipment.map((eq, i) => eq && (
            <span key={i} className="text-[10px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
              {eq.name}
            </span>
          ))}
        </div>
      )}

      {/* Addons */}
      {addons.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {addons.map((addon) => (
            <span key={addon.id} className="text-[10px] text-accent-blue/70 bg-accent-blue/8 px-1.5 py-0.5 rounded">
              {addon.name}
            </span>
          ))}
        </div>
      )}

      {/* Cost */}
      <div className="flex items-center justify-between">
        {totalDucats > 0 && <span className="text-[11px] text-accent-gold font-semibold">{totalDucats} ducats</span>}
        {totalGlory > 0 && <span className="text-[11px] text-purple-300 font-semibold">{totalGlory} glory</span>}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Remove Model"
        description={`Remove ${model.customName || template.name} from this warband?`}
        confirmLabel="Remove"
        confirmVariant="danger"
        onConfirm={onDelete}
      />
    </div>
  );
}
