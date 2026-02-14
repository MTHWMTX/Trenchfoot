import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { createCampaign } from '../actions';
import { FactionBadge } from '../../warband/components/FactionBadge';
import type { Warband } from '../../../types';

export function CampaignCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'warband' | 'patron' | 'confirm'>('warband');
  const [selectedWarband, setSelectedWarband] = useState<Warband | null>(null);
  const [patron, setPatron] = useState('');

  // Campaign-type warbands that don't already have a campaign
  const eligibleWarbands = useLiveQuery(async () => {
    const warbands = await db.warbands.filter(w => w.gameType === 'campaign').toArray();
    const campaigns = await db.campaigns.toArray();
    const campaignWarbandIds = new Set(campaigns.map(c => c.warbandId));
    return warbands.filter(w => !campaignWarbandIds.has(w.id));
  }) ?? [];

  const selectedFaction = useLiveQuery(
    () => selectedWarband ? db.factions.get(selectedWarband.factionId) : undefined,
    [selectedWarband?.factionId]
  );

  const handleWarbandSelect = (warband: Warband) => {
    setSelectedWarband(warband);
    setStep('patron');
  };

  const handlePatronNext = () => {
    if (!patron.trim()) return;
    setStep('confirm');
  };

  const handleCreate = async () => {
    if (!selectedWarband || !patron.trim()) return;
    const id = await createCampaign(selectedWarband.id, patron.trim());
    navigate(`/campaign/${id}`);
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <Link to="/campaign" className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
        Campaigns
      </Link>

      <h1 className="text-xl font-bold mb-1">New Campaign</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 text-[11px]">
        {['Warband', 'Patron', 'Confirm'].map((label, i) => {
          const stepIndex = { warband: 0, patron: 1, confirm: 2 }[step];
          const active = i === stepIndex;
          const done = i < stepIndex;
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && <div className={`w-6 h-px ${done ? 'bg-accent-gold' : 'bg-border-default'}`} />}
              <span className={`font-medium ${active ? 'text-accent-gold' : done ? 'text-text-secondary' : 'text-text-muted'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Warband picker */}
      {step === 'warband' && (
        <div className="animate-fade-in">
          <p className="text-text-muted text-xs mb-4">Choose a campaign warband</p>

          {eligibleWarbands.length > 0 ? (
            <div className="flex flex-col gap-2">
              {eligibleWarbands.map((w) => (
                <WarbandOption key={w.id} warband={w} onSelect={handleWarbandSelect} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-bg-secondary border border-border-default rounded-xl">
              <div className="text-text-muted text-sm mb-1">No eligible warbands</div>
              <div className="text-text-muted/50 text-[11px]">Create a campaign-type warband first</div>
              <Link
                to="/warband/new"
                className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-[12px] font-semibold no-underline hover:bg-accent-gold/25 transition-colors"
              >
                Create Warband
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Patron */}
      {step === 'patron' && (
        <div className="animate-fade-in">
          <p className="text-text-muted text-xs mb-4">Name your warband's patron</p>

          <div className="mb-6">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Patron Name</label>
            <input
              type="text"
              value={patron}
              onChange={(e) => setPatron(e.target.value)}
              placeholder="Enter patron name"
              className="w-full px-3 py-2.5 bg-bg-secondary border border-border-default rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim"
              autoFocus
            />
          </div>

          <button
            type="button"
            onClick={handlePatronNext}
            disabled={!patron.trim()}
            className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </button>

          <button
            type="button"
            onClick={() => setStep('warband')}
            className="mt-3 text-text-muted text-xs hover:text-text-secondary transition-colors bg-transparent border-none cursor-pointer block mx-auto"
          >
            &larr; Change warband
          </button>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && selectedWarband && (
        <div className="animate-fade-in">
          <div className="p-4 bg-bg-secondary border border-border-default rounded-xl mb-6">
            {selectedFaction && <FactionBadge name={selectedFaction.name} team={selectedFaction.team} />}
            <div className="font-semibold text-text-primary text-[14px] mt-2">{selectedWarband.name}</div>
            <div className="flex flex-col gap-1 mt-3 text-[12px]">
              <div className="flex justify-between text-text-secondary">
                <span>Patron</span>
                <span className="text-text-primary font-medium">{patron}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Starting Threshold</span>
                <span className="text-text-primary font-medium">700 ducats</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Field Strength</span>
                <span className="text-text-primary font-medium">10 models</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Campaign Length</span>
                <span className="text-text-primary font-medium">12 games</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer"
          >
            Start Campaign
          </button>

          <button
            type="button"
            onClick={() => setStep('patron')}
            className="mt-3 text-text-muted text-xs hover:text-text-secondary transition-colors bg-transparent border-none cursor-pointer block mx-auto"
          >
            &larr; Change patron
          </button>
        </div>
      )}
    </div>
  );
}

function WarbandOption({ warband, onSelect }: { warband: Warband; onSelect: (w: Warband) => void }) {
  const faction = useLiveQuery(() => db.factions.get(warband.factionId), [warband.factionId]);
  const modelCount = useLiveQuery(
    () => db.warbandModels.where('warbandId').equals(warband.id).count(),
    [warband.id]
  ) ?? 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(warband)}
      className="w-full text-left p-4 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-gold/20 hover:bg-bg-tertiary transition-all cursor-pointer"
    >
      {faction && <FactionBadge name={faction.name} team={faction.team} />}
      <div className="font-semibold text-[13px] text-text-primary mt-2">{warband.name}</div>
      <div className="text-[11px] text-text-muted mt-1">{modelCount} models</div>
    </button>
  );
}
