import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { useCampaign } from '../hooks';
import { FactionBadge } from '../../warband/components/FactionBadge';
import { CampaignSummary } from './CampaignSummary';
import { GameCard } from './GameCard';
import { RecordGameSheet } from './RecordGameSheet';
import { CampaignModelSheet } from './CampaignModelSheet';
import { CampaignEditSheet } from './CampaignEditSheet';
import { MAX_GAMES } from '../progression';

const statusBadge = {
  active: 'bg-green-400/15 text-green-400',
  dead: 'bg-accent-red/15 text-accent-red-bright',
  recovering: 'bg-yellow-400/15 text-yellow-400',
};

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const campaign = useCampaign(id ?? '');
  const warband = useLiveQuery(
    () => campaign ? db.warbands.get(campaign.warbandId) : undefined,
    [campaign?.warbandId]
  );
  const faction = useLiveQuery(
    () => warband ? db.factions.get(warband.factionId) : undefined,
    [warband?.factionId]
  );
  const models = useLiveQuery(
    () => warband ? db.warbandModels.where('warbandId').equals(warband.id).sortBy('order') : [],
    [warband?.id]
  ) ?? [];

  const navigate = useNavigate();
  const [recordingGame, setRecordingGame] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  const selectedModel = models.find(m => m.id === selectedModelId) ?? null;
  const selectedTemplate = useLiveQuery(
    () => selectedModel ? db.modelTemplates.get(selectedModel.templateId) : undefined,
    [selectedModel?.templateId]
  );

  if (campaign === undefined) {
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

  if (!campaign) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <Link to="/campaign" className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
          Campaigns
        </Link>
        <div className="text-center py-16 text-text-muted text-sm mt-4">Campaign not found.</div>
      </div>
    );
  }

  const campaignComplete = campaign.currentGame > MAX_GAMES;
  const wins = campaign.games.filter(g => g.result === 'win').length;
  const losses = campaign.games.filter(g => g.result === 'loss').length;
  const draws = campaign.games.filter(g => g.result === 'draw').length;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Back */}
      <Link to="/campaign" className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
        Campaigns
      </Link>

      {/* Header */}
      <div className="mb-4">
        {faction && <FactionBadge name={faction.name} team={faction.team} />}
        <div className="flex items-center gap-2 mt-2">
          <h1 className="text-xl font-bold">{warband?.name ?? 'Campaign'}</h1>
          <button
            type="button"
            onClick={() => setEditingCampaign(true)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-bg-tertiary text-text-muted hover:text-accent-gold hover:bg-accent-gold/10 transition-colors border-none cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
          </button>
        </div>
        <div className="text-text-muted text-xs mt-1">Patron: {campaign.patron}</div>
      </div>

      {/* Campaign complete banner */}
      {campaignComplete && (
        <div className="mb-4 p-4 bg-accent-gold/5 border-2 border-accent-gold/40 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-gold"><path d="M6 9H4.5a2.5 2.5 0 010-5C7 4 7 7 7 7m10 2h1.5a2.5 2.5 0 000-5C17 4 17 7 17 7m-5-4v4m0 0L8 21h8l-4-14z" /></svg>
            <span className="text-accent-gold font-bold text-sm">Campaign Complete</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-green-400 font-semibold">{wins}W</span>
            <span className="text-accent-red-bright font-semibold">{losses}L</span>
            <span className="text-text-muted font-semibold">{draws}D</span>
          </div>
        </div>
      )}

      {/* Summary bar */}
      <div className="sticky top-[53px] z-20 -mx-4 px-4 py-3 bg-bg-primary/90 backdrop-blur-lg border-b border-border-subtle mb-4">
        <CampaignSummary
          currentGame={campaign.currentGame}
          thresholdValue={campaign.thresholdValue}
          fieldStrength={campaign.fieldStrength}
          gloryPoints={campaign.gloryPoints}
          ducatStash={campaign.ducatStash}
        />
      </div>

      {/* Post-game pending banner */}
      {(() => {
        const lastGame = campaign.games.length > 0 ? campaign.games[campaign.games.length - 1] : null;
        if (lastGame && !lastGame.postGameCompleted) {
          return (
            <button
              type="button"
              onClick={() => navigate(`/campaign/${campaign.id}/postgame`)}
              className="w-full mb-4 p-3 bg-accent-gold/10 border border-accent-gold/25 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-accent-gold/15 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-accent-gold/20 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-gold"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
              </div>
              <div className="flex-1 text-left">
                <div className="text-[13px] font-semibold text-accent-gold">Post-game phase pending</div>
                <div className="text-[11px] text-text-muted">Game {lastGame.gameNumber} — Complete the post-game phase</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-gold/60 shrink-0"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          );
        }
        return null;
      })()}

      {/* Game history */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-secondary">Game History</h2>
          {!campaignComplete && (() => {
            const lastGame = campaign.games.length > 0 ? campaign.games[campaign.games.length - 1] : null;
            const canRecordGame = !lastGame || lastGame.postGameCompleted;
            return canRecordGame ? (
              <button
                type="button"
                onClick={() => setRecordingGame(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-gold/15 border border-accent-gold/30 rounded-lg text-accent-gold text-[11px] font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
                Record Game
              </button>
            ) : null;
          })()}
        </div>

        {campaign.games.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {[...campaign.games].reverse().map((game, i) => (
              <div key={game.gameNumber} className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}>
                <GameCard game={game} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-bg-secondary border border-border-default rounded-xl">
            <svg className="mx-auto mb-3 text-text-muted/30" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div className="text-text-secondary text-sm font-medium mb-1">No games recorded yet</div>
            <div className="text-text-muted/60 text-[11px] mb-4">Record your first game to begin tracking your campaign</div>
            <button
              type="button"
              onClick={() => setRecordingGame(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-[12px] font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
              Record First Game
            </button>
          </div>
        )}
      </div>

      {/* Warband roster */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Warband Roster</h2>
        {models.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {models.map((model, i) => (
              <CampaignModelCard
                key={model.id}
                model={model}
                index={i}
                onTap={() => setSelectedModelId(model.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-bg-secondary border border-border-default rounded-xl">
            <div className="text-text-muted text-xs">No models in warband</div>
          </div>
        )}
      </div>

      {/* Sheets */}
      <RecordGameSheet
        open={recordingGame}
        onClose={() => setRecordingGame(false)}
        campaignId={campaign.id}
        gameNumber={campaign.currentGame}
      />

      <CampaignModelSheet
        model={selectedModel}
        template={selectedTemplate}
        onClose={() => setSelectedModelId(null)}
      />

      <CampaignEditSheet
        campaign={campaign}
        open={editingCampaign}
        onClose={() => setEditingCampaign(false)}
      />
    </div>
  );
}

function CampaignModelCard({ model, index, onTap }: {
  model: { id: string; templateId: string; customName: string; campaignStatus?: string; scars?: any[]; advancements?: any[] };
  index: number;
  onTap: () => void;
}) {
  const template = useLiveQuery(() => db.modelTemplates.get(model.templateId), [model.templateId]);
  const status = (model.campaignStatus ?? 'active') as 'active' | 'dead' | 'recovering';
  const scarCount = model.scars?.length ?? 0;
  const advCount = model.advancements?.length ?? 0;

  return (
    <button
      type="button"
      onClick={onTap}
      className="w-full text-left p-3 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-gold/20 hover:bg-bg-tertiary transition-all cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-text-primary font-medium truncate">
            {model.customName || template?.name || 'Unknown'}
          </div>
          <div className="flex items-center gap-2 mt-1 text-[10px]">
            {scarCount > 0 && (
              <span className="text-accent-red-bright">{scarCount} scar{scarCount !== 1 ? 's' : ''}</span>
            )}
            {advCount > 0 && (
              <span className="text-accent-gold">{advCount} adv.</span>
            )}
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${statusBadge[status]}`}>
          {status}
        </span>
      </div>
    </button>
  );
}
