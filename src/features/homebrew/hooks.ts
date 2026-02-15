import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';

export function useHomebrewRulesets() {
  return useLiveQuery(() => db.rulesets.where('type').equals('homebrew').toArray()) ?? [];
}

export function useRuleset(id: string) {
  return useLiveQuery(() => db.rulesets.get(id), [id]);
}

export function useHomebrewFactions(rulesetId: string) {
  return useLiveQuery(
    () => db.factions.where('rulesetId').equals(rulesetId).toArray(),
    [rulesetId]
  ) ?? [];
}

export function useHomebrewEquipment(rulesetId: string) {
  return useLiveQuery(
    () => db.equipmentTemplates.where('rulesetId').equals(rulesetId).toArray(),
    [rulesetId]
  ) ?? [];
}

export function useHomebrewAddons(rulesetId: string) {
  return useLiveQuery(
    () => db.addons.where('rulesetId').equals(rulesetId).toArray(),
    [rulesetId]
  ) ?? [];
}

export function useHomebrewModels(factionId: string) {
  return useLiveQuery(
    () => db.modelTemplates.where('factionId').equals(factionId).toArray(),
    [factionId]
  ) ?? [];
}
