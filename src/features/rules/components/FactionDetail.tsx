import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFaction, useModelTemplates, useEquipmentTemplates } from '../../warband/hooks';
import { FactionBadge } from '../../warband/components/FactionBadge';
import type { ModelTemplate, EquipmentTemplate, FactionEquipEntry, FactionModelEntry } from '../../../types';
import { KeywordText } from '../../../components/keyword/KeywordText';

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center bg-bg-tertiary rounded-lg px-2 py-1.5 min-w-[36px]">
      <span className="text-[9px] text-text-muted uppercase tracking-wider">{label}</span>
      <span className="text-[13px] font-bold text-text-primary">{value}</span>
    </div>
  );
}

function formatDice(val: number | null): string {
  if (val === null || val === undefined) return '\u2014';
  if (val > 0) return `+${val}`;
  return `${val}`;
}

function ModelRow({ model, entry }: { model: ModelTemplate; entry?: FactionModelEntry }) {
  const tagColors: Record<string, string> = {
    elite: 'text-purple-400 bg-purple-400/10',
    hero: 'text-accent-gold bg-accent-gold/10',
    tough: 'text-green-400 bg-green-400/10',
    fear: 'text-red-400 bg-red-400/10',
  };

  const primaryTag = model.tags.find(t => tagColors[t]);

  return (
    <div className="p-3 bg-bg-secondary border border-border-default rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[13px] text-text-primary">{model.name}</span>
          {primaryTag && (
            <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${tagColors[primaryTag]}`}>
              {primaryTag}
            </span>
          )}
        </div>
        {entry && (
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className={entry.costType === 'ducats' ? 'text-accent-gold font-medium' : 'text-purple-400 font-medium'}>
              {entry.cost}{entry.costType === 'ducats' ? 'd' : 'g'}
            </span>
            {entry.limitMax > 0 && <span className="text-text-muted">max {entry.limitMax}</span>}
          </div>
        )}
      </div>

      <div className="flex gap-1.5 mb-2">
        <StatPill label="MV" value={model.stats.movement} />
        <StatPill label="RNG" value={formatDice(model.stats.ranged)} />
        <StatPill label="MEL" value={formatDice(model.stats.melee)} />
        <StatPill label="ARM" value={model.stats.armour} />
        <StatPill label="BASE" value={model.stats.base.join('x')} />
      </div>

      {model.blurb && (
        <div className="text-[11px] text-text-secondary leading-relaxed mb-1">
          <KeywordText text={model.blurb} />
        </div>
      )}

      {model.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {model.tags.map((tag) => (
            <span key={tag} className="text-[9px] text-accent-gold/70 bg-accent-gold/8 px-1.5 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function EquipmentRow({ eq, entry }: { eq: EquipmentTemplate; entry?: FactionEquipEntry }) {
  return (
    <div className="p-3 bg-bg-secondary border border-border-default rounded-xl">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-[13px] text-text-primary">{eq.name}</span>
        {entry && (
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className={entry.costType === 'ducats' ? 'text-accent-gold font-medium' : 'text-purple-400 font-medium'}>
              {entry.cost}{entry.costType === 'ducats' ? 'd' : 'g'}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-1.5 mb-1.5 flex-wrap">
        {eq.equipType && <StatPill label="TYPE" value={eq.equipType} />}
        {eq.range && <StatPill label="RNG" value={eq.range} />}
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

type Tab = 'units' | 'equipment';

const categoryOrder = ['ranged', 'melee', 'armour', 'equipment'] as const;
const categoryLabels: Record<string, string> = {
  ranged: 'Ranged Weapons',
  melee: 'Melee Weapons',
  armour: 'Armour',
  equipment: 'Equipment',
};

export function FactionDetail() {
  const { factionId } = useParams<{ factionId: string }>();
  const faction = useFaction(factionId ?? '');
  const models = useModelTemplates(factionId ?? '');
  const allEquipment = useEquipmentTemplates();
  const [tab, setTab] = useState<Tab>('units');

  // Build a lookup of equipment by ID for the faction's equipment list
  const eqMap = new Map(allEquipment.map(eq => [eq.id, eq]));

  // Get faction equipment entries with their templates
  const factionEquipment = (faction?.equipmentList ?? [])
    .map(entry => ({ entry, eq: eqMap.get(entry.equipId) }))
    .filter((item): item is { entry: FactionEquipEntry; eq: EquipmentTemplate } => !!item.eq);

  // Group equipment by category
  const equipmentByCategory = categoryOrder
    .map(cat => ({
      category: cat,
      label: categoryLabels[cat],
      items: factionEquipment.filter(({ eq }) => eq.category === cat),
    }))
    .filter(group => group.items.length > 0);

  // Build model entries map
  const modelEntryMap = new Map((faction?.modelList ?? []).map(m => [m.modelId, m]));

  if (faction === undefined) {
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

  if (!faction) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <Link to="/rules/faction" className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
          Factions
        </Link>
        <div className="text-center py-16 text-text-muted text-sm mt-4">Faction not found.</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <Link to="/rules/faction" className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
        Factions
      </Link>

      <div className="mb-4">
        <FactionBadge name={faction.name} team={faction.team} />
        <p className="text-text-secondary text-[12px] mt-2 leading-relaxed whitespace-pre-line">{faction.flavour}</p>
      </div>

      {/* Faction rules */}
      {faction.rules.length > 0 && (
        <div className="mb-4 space-y-2">
          {faction.rules.map((rule, i) => (
            <div key={i} className="p-3 bg-bg-secondary border border-border-default rounded-xl">
              <div className="font-semibold text-[12px] text-accent-gold mb-1">{rule.title}</div>
              <div className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-line">
                <KeywordText text={rule.description} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-bg-secondary rounded-xl p-1 border border-border-default">
        {([['units', 'Units', models.length], ['equipment', 'Equipment', factionEquipment.length]] as const).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-lg text-[12px] font-medium transition-all cursor-pointer border-none ${
              tab === key
                ? 'bg-accent-gold/15 text-accent-gold'
                : 'bg-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {label} <span className="opacity-60">{count}</span>
          </button>
        ))}
      </div>

      {/* Units tab */}
      {tab === 'units' && (
        <div className="flex flex-col gap-2 animate-fade-in">
          {models.map((model, i) => (
            <div key={model.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}>
              <ModelRow model={model} entry={modelEntryMap.get(model.id)} />
            </div>
          ))}
        </div>
      )}

      {/* Equipment tab */}
      {tab === 'equipment' && (
        <div className="animate-fade-in">
          {equipmentByCategory.map((group) => (
            <div key={group.category} className="mb-4">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted/60 mb-2 block">{group.label}</span>
              <div className="flex flex-col gap-2">
                {group.items.map(({ eq, entry }, i) => (
                  <div key={eq.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}>
                    <EquipmentRow eq={eq} entry={entry} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
