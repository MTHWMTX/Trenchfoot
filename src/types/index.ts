export interface Ruleset {
  id: string;
  name: string;
  version: string;
  type: 'official' | 'homebrew';
  createdAt: Date;
  updatedAt: Date;
}

export interface Keyword {
  id: string;
  rulesetId: string;
  term: string;
  aliases: string[];
  definition: string;
  ruleId: string;
}

export type RuleCategory =
  | 'core'
  | 'combat'
  | 'movement'
  | 'morale'
  | 'campaign'
  | 'equipment'
  | 'faction'
  | 'scenario';

export interface Rule {
  id: string;
  rulesetId: string;
  title: string;
  slug: string;
  category: RuleCategory;
  content: string;
  parentId?: string;
  order: number;
  keywordIds: string[];
}

export interface Faction {
  id: string;
  rulesetId: string;
  name: string;
  description: string;
  keywordIds: string[];
}
