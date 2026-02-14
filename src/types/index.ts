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
  category: string;
  definition: string;
}

export type RuleCategory =
  | 'core'
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
}

// --- Faction Equipment/Model Pricing ---

export interface FactionEquipEntry {
  equipId: string;
  cost: number;
  costType: 'ducats' | 'glory';
  limit: number;
  restrictions: { type: string; val: string }[];
  features?: string[];
}

export interface FactionModelEntry {
  modelId: string;
  cost: number;
  costType: 'ducats' | 'glory';
  limitMin: number;
  limitMax: number;
  defaultEquipment: string[];
  upgrades: { id: string; cost: number; costType: string }[];
}

export interface FactionRule {
  title: string;
  description: string;
}

// --- Factions & Warband Building ---

export type GameType = 'standard' | 'campaign';
export type EquipmentCategory = 'ranged' | 'melee' | 'armour' | 'equipment';

export interface Faction {
  id: string;
  rulesetId: string;
  name: string;
  team: 'heaven' | 'hell';
  flavour: string;
  rules: FactionRule[];
  equipmentList: FactionEquipEntry[];
  modelList: FactionModelEntry[];
}

export interface WarbandVariant {
  id: string;
  factionId: string;
  name: string;
  flavour: string;
  rules: FactionRule[];
  removedRules: string[];
  removedEquipment: string[];
  removedModels: string[];
  addedEquipment: FactionEquipEntry[];
  addedModels: FactionModelEntry[];
}

export interface ModelStats {
  movement: number;
  ranged: number | null;
  melee: number | null;
  armour: number;
  base: number[];
}

export interface ModelTemplate {
  id: string;
  name: string;
  factionId: string;
  variantId: string;
  team: 'heaven' | 'hell';
  tags: string[];
  stats: ModelStats;
  addonIds: string[];
  blurb: string;
  promotion: number; // 0 = none, 1 = 1 die, 2 = 2 dice
}

export interface EquipmentTemplate {
  id: string;
  name: string;
  category: EquipmentCategory;
  equipType: string | null;
  range: string | null;
  tags: string[];
  modifiers: string[];
  description: string;
  blurb: string;
}

export interface Addon {
  id: string;
  name: string;
  factionId: string;
  tags: string[];
  description: string;
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
  campaignStatus?: 'active' | 'dead' | 'recovering';
  scars?: { id: string; name: string; effect: string; gameNumber: number }[];
  advancements?: { id: string; name: string; description: string; table: string; gameNumber: number }[];
  promotionDiceEarned?: number;
  promotionDiceSpent?: number;
}

// --- Campaign ---

export interface CampaignGame {
  gameNumber: number;
  result: 'win' | 'loss' | 'draw';
  opponentName: string;
  scenarioName: string;
  notes: string;
  postGameCompleted: boolean;
  completedAt?: Date;
}

export interface Campaign {
  id: string;
  warbandId: string;
  patron: string;
  currentGame: number;       // next game to play (1-12)
  thresholdValue: number;    // starts 700, grows
  fieldStrength: number;     // starts 10, grows to 22
  gloryPoints: number;
  ducatStash: number;
  games: CampaignGame[];     // completed games
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- Dice Tables (for campaign post-game) ---

export interface TraumaTableEntry {
  id: string;
  rollMin: number;
  rollMax: number;
  name: string;
  effect: string;
  outcome: 'dead' | 'recovered' | 'scar';
  isScar: boolean;
}

export interface TraumaTable {
  id: string;
  name: string;
  diceType: 'd66' | 'd6';
  modelType: 'elite' | 'non-elite';
  entries: TraumaTableEntry[];
}

export interface SkillTableEntry {
  id: string;
  rollMin: number;
  rollMax: number;
  name: string;
  description: string;
}

export interface SkillTable {
  id: string;
  name: string;
  entries: SkillTableEntry[];
}

export interface ExplorationTableEntry {
  id: string;
  rollMin: number;
  rollMax: number;
  name: string;
  description: string;
  reward: {
    type: 'ducats' | 'equipment' | 'glory' | 'special';
    value?: number;
    equipmentId?: string;
    specialText?: string;
  };
}

export interface ExplorationTable {
  id: string;
  name: string;
  tier: 'common' | 'rare' | 'legendary';
  entries: ExplorationTableEntry[];
}
