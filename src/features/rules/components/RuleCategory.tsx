import { useParams, Link } from 'react-router-dom';
import { useRulesByCategory } from '../hooks';
import type { RuleCategory as RuleCategoryType } from '../../../types';

const categoryLabels: Record<RuleCategoryType, string> = {
  core: 'Core Rules',
  movement: 'Movement',
  combat: 'Combat',
  morale: 'Morale',
  equipment: 'Equipment',
  campaign: 'Campaign',
  faction: 'Factions',
  scenario: 'Scenarios',
};

export function RuleCategory() {
  const { category } = useParams<{ category: string }>();
  const rules = useRulesByCategory(category as RuleCategoryType);
  const label = categoryLabels[category as RuleCategoryType] ?? category;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <Link
        to="/rules"
        className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-accent-gold no-underline transition-colors mb-4"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Rules
      </Link>

      <div className="mb-5">
        <h1 className="text-xl font-bold">{label}</h1>
        <p className="text-text-muted text-xs mt-0.5">
          {rules.length} {rules.length === 1 ? 'rule' : 'rules'}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {rules.map((rule, i) => (
          <Link
            key={rule.id}
            to={`/rules/${category}/${rule.slug}`}
            className="group block p-4 bg-bg-secondary border border-border-default rounded-xl hover:border-accent-gold/20 hover:bg-bg-tertiary transition-all duration-200 no-underline animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-text-primary text-[13px]">{rule.title}</div>
              <svg className="w-4 h-4 text-text-muted group-hover:text-accent-gold transition-colors shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="text-text-muted text-[11px] mt-1.5 leading-relaxed line-clamp-2">
              {rule.content.replace(/\*\*/g, '').slice(0, 130)}...
            </div>
          </Link>
        ))}

        {rules.length === 0 && (
          <div className="text-center py-16 text-text-muted text-sm">
            No rules in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
