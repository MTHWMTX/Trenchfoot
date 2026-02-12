type Team = 'heaven' | 'hell';

const teamColors: Record<Team, string> = {
  heaven: 'text-accent-gold bg-accent-gold/10',
  hell: 'text-accent-red-bright bg-accent-red-bright/10',
};

export function FactionBadge({ name, team }: { name: string; team: Team }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${teamColors[team]}`}>
      {team === 'heaven' ? '\u2720' : '\u2666'} {name}
    </span>
  );
}
