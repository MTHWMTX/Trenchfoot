import Dexie, { type Table } from 'dexie';
import type { Ruleset, Rule, Keyword } from '../types';

export class TrenchCrusadeDB extends Dexie {
  rulesets!: Table<Ruleset>;
  rules!: Table<Rule>;
  keywords!: Table<Keyword>;

  constructor() {
    super('TrenchCrusadeDB');
    this.version(1).stores({
      rulesets: 'id, name, type, version',
      rules: 'id, rulesetId, slug, category, parentId, order',
      keywords: 'id, rulesetId, term, ruleId',
    });
  }
}

export const db = new TrenchCrusadeDB();
