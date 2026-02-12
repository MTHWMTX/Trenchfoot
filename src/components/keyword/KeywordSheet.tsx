import * as Dialog from '@radix-ui/react-dialog';
import { useRulesStore } from '../../features/rules/store';
import { useKeyword } from '../../features/rules/hooks';

export function KeywordSheet() {
  const selectedKeywordId = useRulesStore((s) => s.selectedKeywordId);
  const setSelectedKeyword = useRulesStore((s) => s.setSelectedKeyword);
  const keyword = useKeyword(selectedKeywordId ?? '');

  return (
    <Dialog.Root
      open={!!selectedKeywordId}
      onOpenChange={(open) => { if (!open) setSelectedKeyword(null); }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-40 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-accent-gold/15 rounded-t-2xl p-5 pb-8 safe-bottom max-h-[60vh] overflow-y-auto animate-slide-up">
          {keyword && (
            <>
              {/* Drag handle */}
              <div className="w-8 h-1 bg-border-default rounded-full mx-auto mb-5" />

              {/* Keyword badge */}
              <div className="mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-gold/60">Keyword</span>
              </div>

              <Dialog.Title className="text-lg font-bold text-keyword mb-2 leading-tight">
                {keyword.term}
              </Dialog.Title>

              <Dialog.Description className="text-text-secondary text-[13px] leading-relaxed whitespace-pre-line">
                {keyword.definition}
              </Dialog.Description>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
