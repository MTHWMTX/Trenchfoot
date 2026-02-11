// --- Rules & Keywords ---

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

// --- Factions & Warband Building ---

export type FactionSide = 'faithful' | 'heretic';
export type ModelType = 'infantry' | 'elite' | 'hero' | 'monster';
export type EquipmentType = 'ranged_weapon' | 'melee_weapon' | 'armour' | 'relic' | 'item';
export type GameType = 'standard' | 'campaign';

export interface Faction {
  id: string;
  rulesetId: string;
  name: string;
  side: FactionSide;
  description: string;
  keywordIds: string[];
}

export interface WarbandVariant {
  id: string;
  factionId: string;
  name: string;
  description: string;
  specialRules: string[];
}

export interface ModelStats {
  movement: number;
  ranged: number;
  melee: number;
  armour: number;
  wounds: number;
  base: string;
}

export interface EquipmentSlot {
  type: EquipmentType;
  required: boolean;
  maxCount: number;
}

export interface ModelTemplate {
  id: string;
  factionId: string;
  variantIds: string[];
  name: string;
  type: ModelType;
  stats: ModelStats;
  baseCost: number;
  gloryCost: number;
  maxCount: number;
  equipmentSlots: EquipmentSlot[];
  defaultEquipmentIds: string[];
  specialRules: string[];
  keywords: string[];
}

export interface EquipmentTemplate {
  id: string;
  factionId: string;
  name: string;
  type: EquipmentType;
  cost: number;
  gloryCost: number;
  stats: Record<string, number | string>;
  specialRules: string[];
  restrictions: string[];
}

// --- User Warband Data ---

export interface Warband {
  id: string;
  name: string;
  factionId: string;
  variantId: string;
  rulesetId: string;
  gameType: GameType;
  ducatLimit: number;
  gloryLimit: number;
  modelLimit: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WarbandModel {
  id: string;
  warbandId: string;
  templateId: string;
  customName: string;
  equipmentIds: string[];
  notes: string;
  order: number;
}
