import Dexie, { type Table } from 'dexie';
import type {
  Ruleset, Rule, Keyword,
  Faction, WarbandVariant, ModelTemplate, EquipmentTemplate,
  Addon, Warband, WarbandModel,
  Campaign, TraumaTable, SkillTable, ExplorationTable,
  PostGameSession, GameSession,
} from '../types';

export class TrenchCrusadeDB extends Dexie {
  rulesets!: Table<Ruleset>;
  rules!: Table<Rule>;
  keywords!: Table<Keyword>;
  factions!: Table<Faction>;
  warbandVariants!: Table<WarbandVariant>;
  modelTemplates!: Table<ModelTemplate>;
  equipmentTemplates!: Table<EquipmentTemplate>;
  addons!: Table<Addon>;
  warbands!: Table<Warband>;
  warbandModels!: Table<WarbandModel>;
  campaigns!: Table<Campaign>;
  traumaTables!: Table<TraumaTable>;
  skillTables!: Table<SkillTable>;
  explorationTables!: Table<ExplorationTable>;
  postGameSessions!: Table<PostGameSession>;
  gameSessions!: Table<GameSession>;

  constructor() {
    super('TrenchCrusadeDB');

    // Legacy versions kept for upgrade path
    this.version(1).stores({
      rulesets: 'id, name, type, version',
      rules: 'id, rulesetId, slug, category, parentId, order',
      keywords: 'id, rulesetId, term, ruleId',
    });

    this.version(2).stores({
      rulesets: 'id, name, type, version',
      rules: 'id, rulesetId, slug, category, parentId, order',
      keywords: 'id, rulesetId, term, ruleId',
      factions: 'id, rulesetId, side',
      warbandVariants: 'id, factionId',
      modelTemplates: 'id, factionId, type',
      equipmentTemplates: 'id, factionId, type',
      warbands: 'id, factionId, rulesetId, updatedAt',
      warbandModels: 'id, warbandId, templateId, order',
    });

    // v3-6: migration stubs (already applied)
    this.version(3).stores({});
    this.version(4).stores({});
    this.version(5).stores({});
    this.version(6).stores({});

    // v7: Clear and re-seed with Compendium data
    this.version(7).stores({
      rulesets: 'id, name, type, version',
      rules: 'id, rulesetId, slug, category, parentId, order',
      keywords: 'id, rulesetId, term',
      factions: 'id, rulesetId, team',
      warbandVariants: 'id, factionId',
      modelTemplates: 'id, factionId, variantId',
      equipmentTemplates: 'id, category',
      addons: 'id, factionId',
      warbands: 'id, factionId, rulesetId, updatedAt',
      warbandModels: 'id, warbandId, templateId, order',
    }).upgrade(async (tx) => {
      // Clear all seed data for full re-seed with Compendium data
      const tables = ['rules', 'keywords', 'rulesets', 'factions',
        'warbandVariants', 'modelTemplates', 'equipmentTemplates'];
      for (const name of tables) {
        await tx.table(name).clear();
      }
    });

    // v8: Re-seed for 1.0.2 rules update (keywords, rules fixes)
    this.version(8).stores({}).upgrade(async (tx) => {
      const tables = ['rules', 'keywords', 'rulesets', 'factions',
        'warbandVariants', 'modelTemplates', 'equipmentTemplates', 'addons'];
      for (const name of tables) {
        await tx.table(name).clear();
      }
    });

    // v9: Campaign management + dice tables
    this.version(9).stores({
      campaigns: 'id, warbandId',
      traumaTables: 'id, modelType',
      skillTables: 'id',
      explorationTables: 'id, tier',
    }).upgrade(async (tx) => {
      // Re-seed modelTemplates to pick up `promotion` field
      await tx.table('modelTemplates').clear();
    });

    // v10: Post-game sessions
    this.version(10).stores({
      postGameSessions: 'id, campaignId, gameNumber',
    });

    // v11: In-game tracking sessions
    this.version(11).stores({
      gameSessions: 'id, warbandId, status',
    });
  }
}

export const db = new TrenchCrusadeDB();
