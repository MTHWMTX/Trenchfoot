import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import { useRulesStore } from './store';
import type { RuleCategory } from '../../types';

export function useRulesets() {
  return useLiveQuery(() => db.rulesets.toArray()) ?? [];
}

export function useRules(category?: RuleCategory) {
  const rulesetId = useRulesStore((s) => s.activeRulesetId);
  return useLiveQuery(
    () => {
      let query = db.rules.where('rulesetId').equals(rulesetId);
      if (category) {
        query = db.rules.where('[rulesetId+category]').equals([rulesetId, category]);
      }
      return query.sortBy('order');
    },
    [rulesetId, category]
  ) ?? [];
}

export function useRulesByCategory(category: RuleCategory) {
  const rulesetId = useRulesStore((s) => s.activeRulesetId);
  return useLiveQuery(
    () => db.rules.where({ rulesetId, category }).sortBy('order'),
    [rulesetId, category]
  ) ?? [];
}

export function useRule(slug: string) {
  const rulesetId = useRulesStore((s) => s.activeRulesetId);
  return useLiveQuery(
    () => db.rules.where({ rulesetId, slug }).first(),
    [rulesetId, slug]
  );
}

export function useKeywords() {
  const rulesetId = useRulesStore((s) => s.activeRulesetId);
  return useLiveQuery(
    () => db.keywords.where('rulesetId').equals(rulesetId).toArray(),
    [rulesetId]
  ) ?? [];
}

export function useKeyword(id: string) {
  return useLiveQuery(
    () => db.keywords.get(id),
    [id]
  );
}
