import Dexie, { type Table } from 'dexie';
import type {
  Ruleset, Rule, Keyword,
  Faction, WarbandVariant, ModelTemplate, EquipmentTemplate,
  Warband, WarbandModel,
} from '../types';

export class TrenchCrusadeDB extends Dexie {
  rulesets!: Table<Ruleset>;
  rules!: Table<Rule>;
  keywords!: Table<Keyword>;
  factions!: Table<Faction>;
  warbandVariants!: Table<WarbandVariant>;
  modelTemplates!: Table<ModelTemplate>;
  equipmentTemplates!: Table<EquipmentTemplate>;
  warbands!: Table<Warband>;
  warbandModels!: Table<WarbandModel>;

  constructor() {
    super('TrenchCrusadeDB');

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
  }
}

export const db = new TrenchCrusadeDB();
