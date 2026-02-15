import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { recordGame } from '../actions';
import type { CampaignGame } from '../../../types';

interface RecordGameSheetProps {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  gameNumber: number;
  defaultScenario?: string;
  onRecorded?: () => void;
}

export function RecordGameSheet({ open, onClose, campaignId, gameNumber, defaultScenario, onRecorded }: RecordGameSheetProps) {
  const [result, setResult] = useState<CampaignGame['result']>('win');
  const [opponentName, setOpponentName] = useState('');
  const [scenarioName, setScenarioName] = useState(defaultScenario ?? '');
  const [notes, setNotes] = useState('');

  const handleRecord = async () => {
    await recordGame(campaignId, {
      result,
      opponentName: opponentName.trim(),
      scenarioName: scenarioName.trim(),
      notes: notes.trim(),
    });
    onRecorded?.();
    setResult('win');
    setOpponentName('');
    setScenarioName('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-accent-gold/15 rounded-t-2xl p-5 pb-8 safe-bottom max-h-[85vh] overflow-y-auto animate-slide-up">
          <div className="w-8 h-1 bg-border-default rounded-full mx-auto mb-5" />
          <Dialog.Title className="text-lg font-bold mb-1">Record Game {gameNumber}</Dialog.Title>
          <Dialog.Description className="text-text-muted text-xs mb-4">Log the result of your battle</Dialog.Description>

          {/* Result toggle */}
          <div className="mb-4">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Result</label>
            <div className="flex gap-2">
              {(['win', 'loss', 'draw'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResult(r)}
                  className={`flex-1 py-2.5 rounded-xl text-[12px] font-medium border transition-all cursor-pointer capitalize ${
                    result === r
                      ? r === 'win'
                        ? 'border-accent-gold/30 bg-accent-gold/10 text-accent-gold'
                        : r === 'loss'
                          ? 'border-accent-red/30 bg-accent-red/10 text-accent-red-bright'
                          : 'border-border-default bg-bg-tertiary text-text-secondary'
                      : 'border-border-default bg-bg-secondary text-text-muted hover:bg-bg-tertiary'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Opponent */}
          <div className="mb-4">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Opponent</label>
            <input
              type="text"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              placeholder="Opponent name"
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim"
            />
          </div>

          {/* Scenario */}
          <div className="mb-4">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Scenario</label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Scenario name"
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim"
            />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Game notes..."
              rows={3}
              className="w-full px-3 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim resize-none"
            />
          </div>

          {/* Record button */}
          <button
            type="button"
            onClick={handleRecord}
            className="w-full py-3 bg-accent-gold/15 border border-accent-gold/30 rounded-xl text-accent-gold text-sm font-semibold hover:bg-accent-gold/25 transition-colors cursor-pointer"
          >
            Record Game
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
