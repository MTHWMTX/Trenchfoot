import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFactions, useWarbandVariants } from '../hooks';
import { createWarband } from '../actions';
import { FactionBadge } from './FactionBadge';
import type { Faction, GameType } from '../../../types';

export function WarbandCreate() {
  const navigate = useNavigate();
  const factions = useFactions();
  const [step, setStep] = useState<'faction' | 'variant' | 'details'>('faction');
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [name, setName] = useState('');
  const [gameType, setGameType] = useState<GameType>('standard');

  const variants = useWarbandVariants(selectedFaction?.id ?? '');

  const faithfulFactions = factions.filter((f) => f.team === 'heaven');
  const hereticFactions = factions.filter((f) => f.team === 'hell');

  const handleFactionSelect = (faction: Faction) => {
    setSelectedFaction(faction);
    setStep('variant');
  };

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
    setStep('details');
    if (!name) setName(`My ${selectedFaction?.name} Warband`);
  };

  const handleCreate = async () => {
    if (!selectedFaction || !selectedVariantId || !name.trim()) return;
    const id = await createWarband({
      name: name.trim(),
      factionId: selectedFaction.id,
      variantId: selectedVariantId,
      gameType,
    });
    navigate(`/warband/${id}`);
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <Link to="/warband" className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
        Warbands
      </Link>

      <h1 className="text-xl font-bold mb-1">New Warband</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 text-[11px]">
        {['Faction', 'Variant', 'Details'].map((label, i) => {
          const stepIndex = { faction: 0, variant: 1, details: 2 }[step];
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

      {/* Faction picker */}
      {step === 'faction' && (
        <div className="animate-fade-in">
          <p className="text-text-muted text-xs mb-4">Choose your faction</p>

          <div className="mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-gold/60 mb-2 block">Faithful</span>
            <div className="flex flex-col gap-2">
              {faithfulFactions.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFactionSelect(f)}
                  className="w-full text-left p-4 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-gold/20 hover:bg-bg-tertiary transition-all cursor-pointer"
                >
                  <FactionBadge name={f.name} team={f.team} />
                  <div className="text-text-secondary text-[11px] mt-2 leading-relaxed line-clamp-3">{f.flavour}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-red-bright/60 mb-2 block">Heretic</span>
            <div className="flex flex-col gap-2">
              {hereticFactions.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFactionSelect(f)}
                  className="w-full text-left p-4 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-red/20 hover:bg-bg-tertiary transition-all cursor-pointer"
                >
                  <FactionBadge name={f.name} team={f.team} />
                  <div className="text-text-secondary text-[11px] mt-2 leading-relaxed line-clamp-3">{f.flavour}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Variant picker */}
      {step === 'variant' && selectedFaction && (
        <div className="animate-fade-in">
          <p className="text-text-muted text-xs mb-4">Choose a warband variant for {selectedFaction.name}</p>
          <div className="flex flex-col gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleVariantSelect(v.id)}
                className="w-full text-left p-4 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-gold/20 hover:bg-bg-tertiary transition-all cursor-pointer"
              >
                <div className="font-semibold text-[13px] text-text-primary">{v.name}</div>
                {v.flavour && <div className="text-text-secondary text-[11px] mt-1 leading-relaxed line-clamp-3">{v.flavour}</div>}
                {v.rules.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {v.rules.map((rule, i) => (
                      <span key={i} className="text-[9px] text-accent-gold bg-accent-gold/10 px-1.5 py-0.5 rounded">{rule.title}</span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep('faction')}
            className="mt-4 text-text-muted text-xs hover:text-text-secondary transition-colors bg-transparent border-none cursor-pointer"
          >
            &larr; Change faction
          </button>
        </div>
      )}

      {/* Details */}
      {step === 'details' && selectedFaction && (
        <div className="animate-fade-in">
          <div className="mb-4">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Warband Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-secondary border border-border-default rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Game Type</label>
            <div className="flex gap-2">
              {(['standard', 'campaign'] as const).map((gt) => (
                <button
                  key={gt}
                  type="button"
                  onClick={() => setGameType(gt)}
                  className={`flex-1 py-2.5 rounded-xl text-[12px] font-medium border transition-all cursor-pointer capitalize ${
                    gameType === gt
                      ? 'border-accent-gold/30 bg-accent-gold/10 text-accent-gold'
                      : 'border-border-default bg-bg-secondary text-text-muted hover:bg-bg-tertiary'
                  }`}
                >
                  {gt}
                </button>
              ))}
            </div>
            <p className="text-text-muted text-[10px] mt-1.5">
              {gameType === 'standard' ? '900 ducats, 9 glory, 12 models' : '700 ducats, 5 glory, 10 models (starting)'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim()}
            className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Warband
          </button>

          <button
            type="button"
            onClick={() => setStep('variant')}
            className="mt-3 text-text-muted text-xs hover:text-text-secondary transition-colors bg-transparent border-none cursor-pointer block mx-auto"
          >
            &larr; Change variant
          </button>
        </div>
      )}
    </div>
  );
}
