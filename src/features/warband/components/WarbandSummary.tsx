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
  return (
    <div className={`flex flex-col items-center px-3 py-1.5 rounded-lg ${over ? 'bg-accent-red/20' : 'bg-bg-tertiary'}`}>
      <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-bold ${over ? 'text-accent-red-bright' : 'text-text-primary'}`}>
        {value}<span className="text-text-muted font-normal">/{limit}</span>
      </span>
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
