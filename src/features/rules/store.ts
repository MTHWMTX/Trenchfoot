import { create } from 'zustand';

interface RulesState {
  activeRulesetId: string;
  selectedKeywordId: string | null;
  selectedModelId: string | null;
  selectedEquipmentId: string | null;
  setActiveRuleset: (id: string) => void;
  setSelectedKeyword: (id: string | null) => void;
  setSelectedModel: (id: string | null) => void;
  setSelectedEquipment: (id: string | null) => void;
}

export const useRulesStore = create<RulesState>((set) => ({
  activeRulesetId: 'official-1.0.2',
  selectedKeywordId: null,
  selectedModelId: null,
  selectedEquipmentId: null,
  setActiveRuleset: (id) => set({ activeRulesetId: id }),
  setSelectedKeyword: (id) => set({ selectedKeywordId: id }),
  setSelectedModel: (id) => set({ selectedModelId: id }),
  setSelectedEquipment: (id) => set({ selectedEquipmentId: id }),
}));
