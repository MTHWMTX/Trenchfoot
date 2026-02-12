import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';

const categories: { id: string; link: string; label: string; icon: string; description: string }[] = [
  { id: 'core', link: '/rules/core', label: 'Core Rules', icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25', description: 'Movement, combat, morale, and campaign' },
  { id: 'faction', link: '/rules/faction', label: 'Factions', icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z', description: 'Units and warband variants' },
  { id: 'equipment', link: '/rules/equipment', label: 'Equipment', icon: 'M11.42 15.17l-5.658-3.163a2.25 2.25 0 01-1.012-1.883V6.073a2.25 2.25 0 011.012-1.883l5.658-3.163a2.25 2.25 0 012.16 0l5.658 3.163a2.25 2.25 0 011.012 1.883v4.051a2.25 2.25 0 01-1.012 1.883l-5.658 3.163a2.25 2.25 0 01-2.16 0z', description: 'Weapons, armour, and relics' },
  { id: 'scenario', link: '/rules/scenario', label: 'Scenarios', icon: 'M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z', description: 'Missions and objectives' },
];

function CategoryIcon({ path }: { path: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export function RulesHome() {
  const counts: Record<string, number> = useLiveQuery(async () => {
    const rules = await db.rules.where('rulesetId').equals('official-1.0').toArray();
    const result: Record<string, number> = {};
    for (const rule of rules) {
      result[rule.category] = (result[rule.category] || 0) + 1;
    }
    result.faction = await db.factions.count();
    result.equipment = await db.equipmentTemplates.count();
    return result;
  }) ?? {};

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-0.5">Rules Reference</h1>
        <p className="text-text-muted text-sm">Browse the official rules by category</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            to={cat.link}
            className="group block p-4 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-gold/20 hover:bg-bg-tertiary transition-all duration-200 no-underline"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-accent-gold/8 flex items-center justify-center text-accent-gold group-hover:bg-accent-gold/15 transition-colors">
                <CategoryIcon path={cat.icon} />
              </div>
              {counts[cat.id] ? (
                <span className="text-[10px] text-text-muted font-medium bg-bg-tertiary px-1.5 py-0.5 rounded-full">
                  {counts[cat.id]}
                </span>
              ) : null}
            </div>
            <div className="font-semibold text-text-primary text-[13px] leading-tight">{cat.label}</div>
            <div className="text-text-muted text-[11px] mt-0.5 leading-snug">{cat.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
