import { useRulesStore } from '../../features/rules/store';
import type { Keyword } from '../../types';

interface KeywordLinkProps {
  keyword: Keyword;
  children: React.ReactNode;
}

export function KeywordLink({ keyword, children }: KeywordLinkProps) {
  const setSelectedKeyword = useRulesStore((s) => s.setSelectedKeyword);

  return (
    <button
      type="button"
      onClick={() => setSelectedKeyword(keyword.id)}
      className="inline font-semibold text-keyword bg-keyword-bg px-0.5 -mx-0.5 rounded cursor-pointer hover:bg-accent-gold/20 active:bg-accent-gold/25 transition-colors border-none leading-[inherit] underline decoration-accent-gold/30 decoration-1 underline-offset-2 hover:decoration-accent-gold/60"
      style={{ fontSize: 'inherit' }}
    >
      {children}
    </button>
  );
}
