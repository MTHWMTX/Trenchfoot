import { Link } from 'react-router-dom';
import { useWarbands, useFactions } from '../hooks';
import { deleteWarband, duplicateWarband } from '../actions';
import { FactionBadge } from './FactionBadge';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

function WarbandCard({ warband }: { warband: { id: string; name: string; factionId: string; gameType: string } }) {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const faction = useLiveQuery(() => db.factions.get(warband.factionId), [warband.factionId]);
  const modelCount = useLiveQuery(
    () => db.warbandModels.where('warbandId').equals(warband.id).count(),
    [warband.id]
  ) ?? 0;

  return (
    <div className="relative group">
      <Link
        to={`/warband/${warband.id}`}
        className="block p-4 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-gold/20 hover:bg-bg-tertiary transition-all duration-200 no-underline"
      >
        {faction && <FactionBadge name={faction.name} team={faction.team} />}
        <div className="font-semibold text-text-primary text-[14px] mt-2">{warband.name}</div>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-text-muted">
          <span>{modelCount} {modelCount === 1 ? 'model' : 'models'}</span>
          <span className="capitalize">{warband.gameType}</span>
        </div>
      </Link>

      {/* Actions menu */}
      <div className="absolute top-3 right-3">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-tertiary text-text-muted hover:text-text-secondary transition-colors border-none cursor-pointer opacity-0 group-hover:opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-8 z-50 bg-bg-elevated border border-border-default rounded-lg shadow-lg py-1 min-w-[120px]">
              <button
                type="button"
                onClick={async () => { await duplicateWarband(warband.id); setShowMenu(false); }}
                className="w-full text-left px-3 py-2 text-[12px] text-text-primary hover:bg-bg-tertiary transition-colors border-none bg-transparent cursor-pointer"
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={() => { setShowMenu(false); setConfirmDelete(true); }}
                className="w-full text-left px-3 py-2 text-[12px] text-accent-red-bright hover:bg-accent-red/10 transition-colors border-none bg-transparent cursor-pointer"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Warband"
        description={`Are you sure you want to delete "${warband.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => deleteWarband(warband.id)}
      />
    </div>
  );
}

export function WarbandList() {
  const warbands = useWarbands();
  const factions = useFactions();

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">Warbands</h1>
          <p className="text-text-muted text-xs mt-0.5">{warbands.length} saved</p>
        </div>
        <Link
          to="/warband/new"
          className="flex items-center gap-1.5 px-3 py-2 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-[12px] font-semibold no-underline hover:bg-accent-gold/25 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
          New
        </Link>
      </div>

      {warbands.length > 0 ? (
        <div className="flex flex-col gap-2">
          {warbands.map((wb, i) => (
            <div key={wb.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}>
              <WarbandCard warband={wb} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-bg-secondary border border-border-default rounded-xl">
          <svg className="mx-auto mb-3 text-text-muted/30" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <div className="text-text-muted text-sm mb-1">No warbands yet</div>
          <div className="text-text-muted/50 text-[11px]">Create your first warband to get started</div>
          {factions.length > 0 && (
            <Link
              to="/warband/new"
              className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-[12px] font-semibold no-underline hover:bg-accent-gold/25 transition-colors"
            >
              Create Warband
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
