import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import type { WarbandModel } from '../../../types';

interface ModelCardProps {
  model: WarbandModel;
  onTap: () => void;
  onDelete: () => void;
}

export function ModelCard({ model, onTap, onDelete }: ModelCardProps) {
  const template = useLiveQuery(() => db.modelTemplates.get(model.templateId), [model.templateId]);
  const equipment = useLiveQuery(
    () => Promise.all(model.equipmentIds.map((id) => db.equipmentTemplates.get(id))),
    [model.equipmentIds]
  );

  if (!template) return null;

  const eqCost = (equipment ?? []).reduce((sum, eq) => sum + (eq?.cost ?? 0), 0);
  const totalCost = template.baseCost + eqCost;

  const typeColors = {
    infantry: 'bg-accent-blue/20 text-blue-300',
    elite: 'bg-accent-gold/15 text-accent-gold',
    hero: 'bg-purple-900/30 text-purple-300',
    monster: 'bg-accent-red/20 text-accent-red-bright',
  };

  return (
    <div
      className="group bg-bg-secondary border border-border-default rounded-xl p-3.5 hover:border-accent-gold/20 transition-all duration-200 cursor-pointer relative"
      onClick={onTap}
    >
      {/* Delete button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
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
        <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${typeColors[template.type]}`}>
          {template.type}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex gap-2 mb-2">
        {[
          { label: 'MV', value: template.stats.movement },
          { label: 'RNG', value: template.stats.ranged || '-' },
          { label: 'MEL', value: template.stats.melee },
          { label: 'ARM', value: template.stats.armour },
          { label: 'WND', value: template.stats.wounds },
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

      {/* Cost */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-accent-gold font-semibold">{totalCost} ducats</span>
        {template.gloryCost > 0 && (
          <span className="text-[11px] text-purple-300 font-semibold">{template.gloryCost} glory</span>
        )}
      </div>
    </div>
  );
}
