import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { useRulesStore } from '../../features/rules/store';
import { useKeyword } from '../../features/rules/hooks';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';

export function KeywordSheet() {
  const selectedKeywordId = useRulesStore((s) => s.selectedKeywordId);
  const setSelectedKeyword = useRulesStore((s) => s.setSelectedKeyword);
  const keyword = useKeyword(selectedKeywordId ?? '');
  const navigate = useNavigate();

  const linkedRule = useLiveQuery(
    () => (keyword ? db.rules.get(keyword.ruleId) : undefined),
    [keyword?.ruleId]
  );

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

              <Dialog.Description className="text-text-secondary text-[13px] leading-relaxed mb-5">
                {keyword.definition}
              </Dialog.Description>

              {linkedRule && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedKeyword(null);
                    navigate(`/rules/${linkedRule.category}/${linkedRule.slug}`);
                  }}
                  className="group w-full py-3 px-4 bg-bg-tertiary border border-border-default rounded-xl text-text-primary text-[13px] font-medium hover:border-accent-gold/20 hover:bg-bg-elevated transition-all duration-200 cursor-pointer flex items-center justify-between"
                >
                  <span>View: {linkedRule.title}</span>
                  <svg className="w-4 h-4 text-text-muted group-hover:text-accent-gold transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
