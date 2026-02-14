import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '../hooks';
import { deleteCampaign } from '../actions';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { FactionBadge } from '../../warband/components/FactionBadge';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { MAX_GAMES } from '../progression';

function CampaignCard({ campaign }: { campaign: { id: string; warbandId: string; patron: string; currentGame: number } }) {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const warband = useLiveQuery(() => db.warbands.get(campaign.warbandId), [campaign.warbandId]);
  const faction = useLiveQuery(
    () => warband ? db.factions.get(warband.factionId) : undefined,
    [warband?.factionId]
  );

  const gameDisplay = `Game ${Math.min(campaign.currentGame, MAX_GAMES)}/${MAX_GAMES}`;
  const warbandName = warband?.name ?? 'Unknown Warband';

  return (
    <div className="relative group">
      <Link
        to={`/campaign/${campaign.id}`}
        className="block p-4 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-gold/20 hover:bg-bg-tertiary transition-all duration-200 no-underline"
      >
        {faction && <FactionBadge name={faction.name} team={faction.team} />}
        <div className="font-semibold text-text-primary text-[14px] mt-2">{warbandName}</div>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-text-muted">
          <span>{gameDisplay}</span>
          <span>Patron: {campaign.patron}</span>
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
        title="Delete Campaign"
        description={`Are you sure you want to delete the campaign for "${warbandName}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => deleteCampaign(campaign.id)}
      />
    </div>
  );
}

export function CampaignList() {
  const campaigns = useCampaigns();

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">Campaigns</h1>
          <p className="text-text-muted text-xs mt-0.5">{campaigns.length} active</p>
        </div>
        <Link
          to="/campaign/new"
          className="flex items-center gap-1.5 px-3 py-2 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-[12px] font-semibold no-underline hover:bg-accent-gold/25 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
          New
        </Link>
      </div>

      {campaigns.length > 0 ? (
        <div className="flex flex-col gap-2">
          {campaigns.map((c, i) => (
            <div key={c.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}>
              <CampaignCard campaign={c} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-bg-secondary border border-border-default rounded-xl">
          <svg className="mx-auto mb-3 text-text-muted/30" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
          </svg>
          <div className="text-text-muted text-sm mb-1">No campaigns yet</div>
          <div className="text-text-muted/50 text-[11px]">Start a campaign to track your warband's journey</div>
          <Link
            to="/campaign/new"
            className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-[12px] font-semibold no-underline hover:bg-accent-gold/25 transition-colors"
          >
            Start Campaign
          </Link>
        </div>
      )}
    </div>
  );
}
