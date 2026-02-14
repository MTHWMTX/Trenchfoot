import * as Dialog from '@radix-ui/react-dialog';
import { updateModelCampaignStatus } from '../actions';
import type { WarbandModel, ModelTemplate } from '../../../types';

interface CampaignModelSheetProps {
  model: WarbandModel | null;
  template: ModelTemplate | undefined;
  onClose: () => void;
}

const statusConfig = {
  active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-400/15 border-green-400/30' },
  dead: { label: 'Dead', color: 'text-accent-red-bright', bg: 'bg-accent-red/15 border-accent-red/30' },
  recovering: { label: 'Recovering', color: 'text-yellow-400', bg: 'bg-yellow-400/15 border-yellow-400/30' },
};

export function CampaignModelSheet({ model, template, onClose }: CampaignModelSheetProps) {
  if (!model) return null;

  const status = model.campaignStatus ?? 'active';
  const scars = model.scars ?? [];
  const advancements = model.advancements ?? [];
  const earned = model.promotionDiceEarned ?? 0;
  const spent = model.promotionDiceSpent ?? 0;
  const available = earned - spent;

  const handleStatusChange = async (newStatus: 'active' | 'dead' | 'recovering') => {
    await updateModelCampaignStatus(model.id, newStatus);
  };

  return (
    <Dialog.Root open={!!model} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-accent-gold/15 rounded-t-2xl p-5 pb-8 safe-bottom max-h-[85vh] overflow-y-auto animate-slide-up">
          <div className="w-8 h-1 bg-border-default rounded-full mx-auto mb-5" />
          <Dialog.Title className="text-lg font-bold mb-1">
            {model.customName || template?.name || 'Model'}
          </Dialog.Title>
          <Dialog.Description className="text-text-muted text-xs mb-4">Campaign status and history</Dialog.Description>

          {/* Status toggle */}
          <div className="mb-5">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Status</label>
            <div className="flex gap-2">
              {(['active', 'dead', 'recovering'] as const).map((s) => {
                const cfg = statusConfig[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    className={`flex-1 py-2 rounded-xl text-[12px] font-medium border transition-all cursor-pointer ${
                      status === s ? cfg.bg + ' ' + cfg.color : 'border-border-default bg-bg-secondary text-text-muted hover:bg-bg-tertiary'
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Promotion dice */}
          <div className="mb-5 p-3 bg-bg-tertiary rounded-xl">
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Promotion Dice</div>
            <div className="flex gap-4 text-sm">
              <span className="text-text-secondary">Earned: <span className="font-bold text-text-primary">{earned}</span></span>
              <span className="text-text-secondary">Spent: <span className="font-bold text-text-primary">{spent}</span></span>
              <span className="text-text-secondary">Available: <span className="font-bold text-accent-gold">{available}</span></span>
            </div>
          </div>

          {/* Scars */}
          <div className="mb-5">
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">
              Scars ({scars.length})
            </div>
            {scars.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {scars.map((scar) => (
                  <div key={scar.id} className="p-2.5 bg-bg-tertiary rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-accent-red-bright font-medium">{scar.name}</span>
                      <span className="text-[10px] text-text-muted">Game {scar.gameNumber}</span>
                    </div>
                    <div className="text-[11px] text-text-secondary mt-0.5">{scar.effect}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-text-muted text-xs">No scars</div>
            )}
          </div>

          {/* Advancements */}
          <div className="mb-5">
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-2">
              Advancements ({advancements.length})
            </div>
            {advancements.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {advancements.map((adv) => (
                  <div key={adv.id} className="p-2.5 bg-bg-tertiary rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-accent-gold font-medium">{adv.name}</span>
                      <span className="text-[10px] text-text-muted">Game {adv.gameNumber}</span>
                    </div>
                    <div className="text-[11px] text-text-secondary mt-0.5">{adv.description}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">{adv.table}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-text-muted text-xs">No advancements</div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
