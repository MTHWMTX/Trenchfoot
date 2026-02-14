import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../data/db';
import { ModelEditSheet } from '../../warband/components/ModelEditSheet';
import type { Campaign, Faction, WarbandModel } from '../../../types';

interface QuartermasterStepProps {
  campaign: Campaign;
  faction: Faction | undefined;
  models: WarbandModel[];
  onFinish: () => void;
}

const statusBadge = {
  active: 'bg-green-400/15 text-green-400',
  dead: 'bg-accent-red/15 text-accent-red-bright',
  recovering: 'bg-yellow-400/15 text-yellow-400',
};

export function QuartermasterStep({ campaign, faction, models, onFinish }: QuartermasterStepProps) {
  const [editingModel, setEditingModel] = useState<WarbandModel | null>(null);

  const aliveModels = models.filter(m => (m.campaignStatus ?? 'active') !== 'dead');

  return (
    <div>
      <h2 className="text-sm font-semibold text-text-secondary mb-1">Quartermaster</h2>
      <p className="text-text-muted text-xs mb-4">Manage equipment for your warband. Tap a model to edit their loadout.</p>

      {/* Resource display */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 p-3 bg-bg-secondary border border-border-default rounded-xl text-center">
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Ducat Stash</div>
          <div className="text-lg font-bold text-accent-gold">{campaign.ducatStash}</div>
        </div>
        <div className="flex-1 p-3 bg-bg-secondary border border-border-default rounded-xl text-center">
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Glory Points</div>
          <div className="text-lg font-bold text-purple-300">{campaign.gloryPoints}</div>
        </div>
      </div>

      {/* Model roster */}
      <div className="flex flex-col gap-1.5 mb-4">
        {aliveModels.map((model, i) => (
          <QMModelCard
            key={model.id}
            model={model}
            index={i}
            onTap={() => setEditingModel(model)}
          />
        ))}
      </div>

      {aliveModels.length === 0 && (
        <div className="text-center py-8 bg-bg-secondary border border-border-default rounded-xl mb-4">
          <div className="text-text-muted text-xs">No living models in warband</div>
        </div>
      )}

      {/* Finish */}
      <button
        type="button"
        onClick={onFinish}
        className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer"
      >
        Finish Post-Game
      </button>

      {/* Model edit sheet */}
      <ModelEditSheet
        model={editingModel}
        faction={faction}
        onClose={() => setEditingModel(null)}
      />
    </div>
  );
}

function QMModelCard({ model, index, onTap }: {
  model: WarbandModel;
  index: number;
  onTap: () => void;
}) {
  const template = useLiveQuery(() => db.modelTemplates.get(model.templateId), [model.templateId]);
  const status = (model.campaignStatus ?? 'active') as 'active' | 'dead' | 'recovering';
  const equipCount = model.equipmentIds.length;

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
          <div className="text-[10px] text-text-muted">
            {equipCount} item{equipCount !== 1 ? 's' : ''} equipped
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${statusBadge[status]}`}>
          {status}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0"><path d="M9 18l6-6-6-6" /></svg>
      </div>
    </button>
  );
}
