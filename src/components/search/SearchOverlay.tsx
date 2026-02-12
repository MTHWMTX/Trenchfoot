import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import Fuse from 'fuse.js';
import { db } from '../../data/db';
import { useRulesStore } from '../../features/rules/store';

interface SearchItem {
  type: 'rule' | 'keyword' | 'faction' | 'model' | 'equipment';
  id: string;
  title: string;
  text: string;
  extra: string;
  route: string;
}

const typeBadge: Record<SearchItem['type'], { label: string; color: string; bg: string }> = {
  rule:      { label: 'Rule',      color: 'text-accent-gold',       bg: 'bg-accent-gold/10' },
  keyword:   { label: 'Keyword',   color: 'text-keyword',           bg: 'bg-keyword-bg' },
  faction:   { label: 'Faction',   color: 'text-accent-red-bright', bg: 'bg-accent-red/15' },
  model:     { label: 'Model',     color: 'text-accent-blue',       bg: 'bg-accent-blue/20' },
  equipment: { label: 'Equipment', color: 'text-text-secondary',    bg: 'bg-bg-tertiary' },
};

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const setSelectedKeyword = useRulesStore((s) => s.setSelectedKeyword);
  const setSelectedModel = useRulesStore((s) => s.setSelectedModel);
  const setSelectedEquipment = useRulesStore((s) => s.setSelectedEquipment);
  const rulesetId = useRulesStore((s) => s.activeRulesetId);

  const rules = useLiveQuery(() => db.rules.where('rulesetId').equals(rulesetId).toArray(), [rulesetId]) ?? [];
  const keywords = useLiveQuery(() => db.keywords.where('rulesetId').equals(rulesetId).toArray(), [rulesetId]) ?? [];
  const factions = useLiveQuery(() => db.factions.where('rulesetId').equals(rulesetId).toArray(), [rulesetId]) ?? [];
  const models = useLiveQuery(() => db.modelTemplates.toArray()) ?? [];
  const equipment = useLiveQuery(() => db.equipmentTemplates.toArray()) ?? [];

  // Build a faction id->name map for model subtitles
  const factionMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of factions) map.set(f.id, f.name);
    return map;
  }, [factions]);

  const fuse = useMemo(() => {
    const items: SearchItem[] = [
      ...rules.map((r) => ({
        type: 'rule' as const,
        id: r.id,
        title: r.title,
        text: r.content.replace(/\*\*/g, ''),
        extra: r.category,
        route: `/rules/${r.category}/${r.slug}`,
      })),
      ...keywords.map((k) => ({
        type: 'keyword' as const,
        id: k.id,
        title: k.term,
        text: k.definition,
        extra: '',
        route: '', // handled via KeywordSheet
      })),
      ...factions.map((f) => ({
        type: 'faction' as const,
        id: f.id,
        title: f.name,
        text: f.flavour,
        extra: f.team,
        route: `/rules/faction/${f.id}`,
      })),
      ...models.map((m) => ({
        type: 'model' as const,
        id: m.id,
        title: m.name,
        text: m.blurb,
        extra: factionMap.get(m.factionId) ?? '',
        route: `/rules/faction/${m.factionId}`,
      })),
      ...equipment.map((e) => ({
        type: 'equipment' as const,
        id: e.id,
        title: e.name,
        text: e.description,
        extra: e.category,
        route: '/rules/equipment',
      })),
    ];
    return new Fuse(items, {
      keys: [{ name: 'title', weight: 2 }, { name: 'text', weight: 1 }],
      threshold: 0.3,
      includeMatches: true,
    });
  }, [rules, keywords, factions, models, equipment, factionMap]);

  const results = query.length >= 2 ? fuse.search(query, { limit: 25 }) : [];

  const handleSelect = useCallback((item: SearchItem) => {
    if (item.type === 'keyword') {
      setSelectedKeyword(item.id);
    } else if (item.type === 'model') {
      setSelectedModel(item.id);
    } else if (item.type === 'equipment') {
      setSelectedEquipment(item.id);
    } else {
      navigate(item.route);
    }
    onClose();
  }, [navigate, setSelectedKeyword, setSelectedModel, setSelectedEquipment, onClose]);

  // Auto-focus input on mount
  useEffect(() => {
    // Small delay to let the animation start before focusing
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary flex flex-col animate-fade-in">
      {/* Header bar */}
      <div className="safe-top bg-bg-secondary/80 backdrop-blur-lg border-b border-border-default px-4 py-3 flex items-center gap-3">
        <svg className="text-text-muted shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything..."
          className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-muted focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="text-text-muted hover:text-text-secondary transition-colors bg-transparent border-none cursor-pointer p-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="text-text-muted hover:text-text-secondary transition-colors bg-transparent border-none cursor-pointer p-1 -mr-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          {results.map(({ item }, i) => {
            const badge = typeBadge[item.type];
            return (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="text-left w-full p-4 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-gold/20 hover:bg-bg-tertiary transition-all duration-200 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${badge.color} ${badge.bg} px-1.5 py-0.5 rounded`}>
                    {badge.label}
                  </span>
                  {item.extra && (
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">{item.extra}</span>
                  )}
                </div>
                <div className={`font-semibold text-[13px] ${item.type === 'keyword' ? 'text-keyword' : 'text-text-primary'}`}>
                  {item.title}
                </div>
                {item.text && (
                  <div className="text-text-muted text-[11px] mt-1 line-clamp-2 leading-relaxed">
                    {item.text.slice(0, 150)}
                  </div>
                )}
              </button>
            );
          })}

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
              <div className="text-text-muted text-sm">Search everything</div>
              <div className="text-text-muted/60 text-xs mt-1">Rules, keywords, factions, models, equipment</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
