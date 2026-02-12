import { Link } from 'react-router-dom';
import { useFactions } from '../../warband/hooks';
import { FactionBadge } from '../../warband/components/FactionBadge';

export function FactionList() {
  const factions = useFactions();
  const faithful = factions.filter((f) => f.team === 'heaven');
  const heretic = factions.filter((f) => f.team === 'hell');

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
        <h1 className="text-xl font-bold">Factions</h1>
        <p className="text-text-muted text-xs mt-0.5">{factions.length} factions</p>
      </div>

      {/* Faithful */}
      <div className="mb-5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-gold/60 mb-2 block">Faithful</span>
        <div className="flex flex-col gap-2">
          {faithful.map((f, i) => (
            <Link
              key={f.id}
              to={`/rules/faction/${f.id}`}
              className="group block p-4 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-gold/20 hover:bg-bg-tertiary transition-all duration-200 no-underline animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
            >
              <FactionBadge name={f.name} team={f.team} />
              <div className="text-text-secondary text-[11px] mt-2 leading-relaxed line-clamp-3">{f.flavour}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Heretic */}
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-red-bright/60 mb-2 block">Heretic</span>
        <div className="flex flex-col gap-2">
          {heretic.map((f, i) => (
            <Link
              key={f.id}
              to={`/rules/faction/${f.id}`}
              className="group block p-4 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-red/20 hover:bg-bg-tertiary transition-all duration-200 no-underline animate-fade-in-up"
              style={{ animationDelay: `${(faithful.length + i) * 50}ms`, animationFillMode: 'both' }}
            >
              <FactionBadge name={f.name} team={f.team} />
              <div className="text-text-secondary text-[11px] mt-2 leading-relaxed line-clamp-3">{f.flavour}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
