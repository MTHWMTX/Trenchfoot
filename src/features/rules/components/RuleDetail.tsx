import { useParams, Link } from 'react-router-dom';
import { useRule } from '../hooks';
import { KeywordText } from '../../../components/keyword/KeywordText';
import type { RuleCategory } from '../../../types';

const categoryLabels: Record<RuleCategory, string> = {
  core: 'Core Rules',
  movement: 'Movement',
  combat: 'Combat',
  morale: 'Morale',
  equipment: 'Equipment',
  campaign: 'Campaign',
  faction: 'Factions',
  scenario: 'Scenarios',
};

export function RuleDetail() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const rule = useRule(slug ?? '');
  const catLabel = categoryLabels[category as RuleCategory] ?? category;

  if (rule === undefined) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-32 bg-bg-tertiary rounded" />
          <div className="h-6 w-48 bg-bg-tertiary rounded" />
          <div className="h-4 w-full bg-bg-tertiary rounded mt-6" />
          <div className="h-4 w-5/6 bg-bg-tertiary rounded" />
          <div className="h-4 w-4/6 bg-bg-tertiary rounded" />
        </div>
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto">
        <Link to={`/rules/${category}`} className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          {catLabel}
        </Link>
        <div className="text-center py-16 text-text-muted text-sm">Rule not found.</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] text-text-muted mb-5">
        <Link to="/rules" className="hover:text-accent-gold no-underline text-inherit transition-colors">Rules</Link>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
        <Link to={`/rules/${category}`} className="hover:text-accent-gold no-underline text-inherit transition-colors">{catLabel}</Link>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
        <span className="text-text-secondary truncate">{rule.title}</span>
      </nav>

      {/* Category badge */}
      <div className="mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-gold/70">{catLabel}</span>
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold mb-5 leading-tight">{rule.title}</h1>

      {/* Content */}
      <div className="bg-bg-secondary border border-border-default rounded-xl p-5">
        <div className="text-text-primary/90 leading-[1.7] text-[14px] space-y-4">
          {rule.content.split('\n\n').map((paragraph, i) => {
            const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
            return (
              <p key={i} className="m-0">
                {parts.map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    const inner = part.slice(2, -2);
                    return <strong key={j} className="text-text-primary font-semibold"><KeywordText text={inner} /></strong>;
                  }
                  return <KeywordText key={j} text={part} />;
                })}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
