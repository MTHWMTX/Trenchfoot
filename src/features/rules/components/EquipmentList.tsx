import { Link } from 'react-router-dom';
import { useEquipmentTemplates } from '../../warband/hooks';
import { KeywordText } from '../../../components/keyword/KeywordText';
import type { EquipmentTemplate, EquipmentCategory } from '../../../types';

const categoryLabels: Record<EquipmentCategory, string> = {
  ranged: 'Ranged Weapons',
  melee: 'Melee Weapons',
  armour: 'Armour',
  equipment: 'Equipment',
};

const categoryOrder: EquipmentCategory[] = ['ranged', 'melee', 'armour', 'equipment'];

function EquipmentCard({ eq }: { eq: EquipmentTemplate }) {
  return (
    <div className="p-3 bg-bg-secondary border border-border-default rounded-xl">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-[13px] text-text-primary">{eq.name}</span>
        {eq.equipType && (
          <span className="text-[9px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">{eq.equipType}</span>
        )}
      </div>

      <div className="flex gap-1.5 mb-1.5 flex-wrap">
        {eq.range && (
          <div className="flex flex-col items-center bg-bg-tertiary rounded-lg px-2 py-1.5 min-w-[36px]">
            <span className="text-[9px] text-text-muted uppercase tracking-wider">RNG</span>
            <span className="text-[13px] font-bold text-text-primary">{eq.range}</span>
          </div>
        )}
        {eq.modifiers.map((mod, i) => (
          <div key={i} className="flex flex-col items-center bg-bg-tertiary rounded-lg px-2 py-1.5 min-w-[36px]">
            <span className="text-[9px] text-text-muted uppercase tracking-wider">MOD</span>
            <span className="text-[13px] font-bold text-text-primary">{mod}</span>
          </div>
        ))}
      </div>

      {eq.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {eq.tags.map((tag) => (
            <span key={tag} className="text-[9px] text-accent-gold/70 bg-accent-gold/8 px-1.5 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      )}

      {eq.description && (
        <div className="text-[11px] text-text-secondary leading-relaxed">
          <KeywordText text={eq.description} />
        </div>
      )}
    </div>
  );
}

export function EquipmentList() {
  const equipment = useEquipmentTemplates();

  const groups = categoryOrder
    .map((cat) => ({
      category: cat,
      label: categoryLabels[cat],
      items: equipment.filter((eq) => eq.category === cat),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <Link
        to="/rules"
        className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors mb-4"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Rules
      </Link>

      <div className="mb-5">
        <h1 className="text-xl font-bold">Equipment</h1>
        <p className="text-text-muted text-xs mt-0.5">{equipment.length} items</p>
      </div>

      {groups.map((group) => (
        <div key={group.category} className="mb-5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted/60 mb-2 block">{group.label}</span>
          <div className="flex flex-col gap-2">
            {group.items.map((eq, i) => (
              <div key={eq.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}>
                <EquipmentCard eq={eq} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {equipment.length === 0 && (
        <div className="text-center py-16 text-text-muted text-sm">
          No equipment data loaded yet.
        </div>
      )}
    </div>
  );
}
