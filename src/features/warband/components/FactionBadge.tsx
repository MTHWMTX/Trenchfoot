import type { FactionSide } from '../../../types';

const sideColors: Record<FactionSide, string> = {
  faithful: 'text-accent-gold bg-accent-gold/10',
  heretic: 'text-accent-red-bright bg-accent-red-bright/10',
};

export function FactionBadge({ name, side }: { name: string; side: FactionSide }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${sideColors[side]}`}>
      {side === 'faithful' ? '\u2720' : '\u2666'} {name}
    </span>
  );
}
