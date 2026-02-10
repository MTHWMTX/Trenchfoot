import { create } from 'zustand';

interface RulesState {
  activeRulesetId: string;
  selectedKeywordId: string | null;
  setActiveRuleset: (id: string) => void;
  setSelectedKeyword: (id: string | null) => void;
}

export const useRulesStore = create<RulesState>((set) => ({
  activeRulesetId: 'official-1.0',
  selectedKeywordId: null,
  setActiveRuleset: (id) => set({ activeRulesetId: id }),
  setSelectedKeyword: (id) => set({ selectedKeywordId: id }),
}));
