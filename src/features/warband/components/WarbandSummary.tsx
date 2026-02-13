interface WarbandSummaryProps {
  ducats: number;
  ducatLimit: number;
  glory: number;
  gloryLimit: number;
  modelCount: number;
  modelLimit: number;
}

function StatPill({ label, value, limit }: { label: string; value: number; limit: number }) {
  const over = value > limit;
  const remaining = limit - value;
  const nearLimit = !over && limit > 0 && remaining <= limit * 0.1;

  let bgClass = 'bg-bg-tertiary';
  let valueClass = 'text-text-primary';
  let remainingClass = 'text-text-muted';
  let remainingText = `${remaining} left`;

  if (over) {
    bgClass = 'bg-accent-red/20';
    valueClass = 'text-accent-red-bright';
    remainingClass = 'text-accent-red-bright';
    remainingText = `${Math.abs(remaining)} over`;
  } else if (nearLimit) {
    bgClass = 'bg-accent-gold/15';
    valueClass = 'text-accent-gold';
    remainingClass = 'text-accent-gold';
  }

  return (
    <div className={`flex flex-col items-center px-3 py-1.5 rounded-lg ${bgClass}`}>
      <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-bold ${valueClass}`}>
        {value}<span className="text-text-muted font-normal">/{limit}</span>
      </span>
      <span className={`text-[9px] ${remainingClass}`}>{remainingText}</span>
    </div>
  );
}

export function WarbandSummary({ ducats, ducatLimit, glory, gloryLimit, modelCount, modelLimit }: WarbandSummaryProps) {
  return (
    <div className="flex gap-2">
      <StatPill label="Ducats" value={ducats} limit={ducatLimit} />
      <StatPill label="Glory" value={glory} limit={gloryLimit} />
      <StatPill label="Models" value={modelCount} limit={modelLimit} />
    </div>
  );
}
