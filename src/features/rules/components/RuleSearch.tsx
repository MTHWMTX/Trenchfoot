import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Fuse from 'fuse.js';
import { useRules, useKeywords } from '../hooks';
import { useRulesStore } from '../store';

export function RuleSearch() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const rules = useRules();
  const keywords = useKeywords();
  const setSelectedKeyword = useRulesStore((s) => s.setSelectedKeyword);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fuse = useMemo(() => {
    const items = [
      ...rules.map((r) => ({ type: 'rule' as const, id: r.id, title: r.title, text: r.content.replace(/\*\*/g, ''), slug: r.slug, category: r.category })),
      ...keywords.map((k) => ({ type: 'keyword' as const, id: k.id, title: k.term, text: k.definition, slug: '', category: '' })),
    ];
    return new Fuse(items, {
      keys: [{ name: 'title', weight: 2 }, { name: 'text', weight: 1 }],
      threshold: 0.3,
      includeMatches: true,
    });
  }, [rules, keywords]);

  const results = query.length >= 2 ? fuse.search(query, { limit: 20 }) : [];

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Search</h1>

      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search rules and keywords..."
          className="w-full pl-10 pr-4 py-3 bg-bg-secondary border border-border-default rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors bg-transparent border-none cursor-pointer p-0.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {results.map(({ item }, i) => (
          item.type === 'rule' ? (
            <Link
              key={item.id}
              to={`/rules/${item.category}/${item.slug}`}
              className="group block p-4 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-gold/20 hover:bg-bg-tertiary transition-all duration-200 no-underline animate-fade-in-up"
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-gold bg-accent-gold/10 px-1.5 py-0.5 rounded">Rule</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider">{item.category}</span>
              </div>
              <div className="font-semibold text-text-primary text-[13px]">{item.title}</div>
              <div className="text-text-muted text-[11px] mt-1 line-clamp-2 leading-relaxed">{item.text.slice(0, 130)}...</div>
            </Link>
          ) : (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedKeyword(item.id)}
              className="text-left w-full p-4 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-gold/20 hover:bg-bg-tertiary transition-all duration-200 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-keyword bg-keyword-bg px-1.5 py-0.5 rounded">Keyword</span>
              <div className="font-semibold text-keyword text-[13px] mt-1.5">{item.title}</div>
              <div className="text-text-muted text-[11px] mt-1 leading-relaxed">{item.text}</div>
            </button>
          )
        ))}

        {query.length >= 2 && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-text-muted text-sm">No results for "{query}"</div>
            <div className="text-text-muted/60 text-xs mt-1">Try a different search term</div>
          </div>
        )}

        {query.length < 2 && (
          <div className="text-center py-16">
            <svg className="mx-auto mb-3 text-text-muted/40" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <div className="text-text-muted text-sm">Search rules and keywords</div>
            <div className="text-text-muted/60 text-xs mt-1">Type at least 2 characters</div>
          </div>
        )}
      </div>
    </div>
  );
}
