import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';

export function useFactions() {
  return useLiveQuery(() => db.factions.toArray()) ?? [];
}

export function useFaction(id: string) {
  return useLiveQuery(() => db.factions.get(id), [id]);
}

export function useWarbandVariants(factionId: string) {
  return useLiveQuery(
    () => db.warbandVariants.where('factionId').equals(factionId).toArray(),
    [factionId]
  ) ?? [];
}

export function useModelTemplates(factionId: string) {
  return useLiveQuery(
    () => db.modelTemplates.where('factionId').equals(factionId).toArray(),
    [factionId]
  ) ?? [];
}

export function useModelTemplate(id: string) {
  return useLiveQuery(() => db.modelTemplates.get(id), [id]);
}

export function useEquipmentTemplates() {
  return useLiveQuery(() => db.equipmentTemplates.toArray()) ?? [];
}

export function useEquipmentTemplate(id: string) {
  return useLiveQuery(() => db.equipmentTemplates.get(id), [id]);
}

export function useAddons(ids: string[]) {
  return useLiveQuery(
    async () => ids.length > 0 ? db.addons.where('id').anyOf(ids).toArray() : [],
    [ids.join(',')]
  ) ?? [];
}

export function useWarbands() {
  return useLiveQuery(() => db.warbands.orderBy('updatedAt').reverse().toArray()) ?? [];
}

export function useWarband(id: string) {
  return useLiveQuery(() => db.warbands.get(id), [id]);
}

export function useWarbandModels(warbandId: string) {
  return useLiveQuery(
    () => db.warbandModels.where('warbandId').equals(warbandId).sortBy('order'),
    [warbandId]
  ) ?? [];
}

export function useWarbandCost(warbandId: string) {
  return useLiveQuery(async () => {
    const warband = await db.warbands.get(warbandId);
    if (!warband) return { ducats: 0, glory: 0, modelCount: 0 };

    const faction = await db.factions.get(warband.factionId);
    if (!faction) return { ducats: 0, glory: 0, modelCount: 0 };

    const models = await db.warbandModels.where('warbandId').equals(warbandId).toArray();
    let ducats = 0;
    let glory = 0;

    for (const model of models) {
      const modelEntry = faction.modelList.find(m => m.modelId === model.templateId);
      if (modelEntry) {
        if (modelEntry.costType === 'ducats') ducats += modelEntry.cost;
        else glory += modelEntry.cost;
      }

      for (const eqId of model.equipmentIds) {
        const eqEntry = faction.equipmentList.find(e => e.equipId === eqId);
        if (eqEntry) {
          if (eqEntry.costType === 'ducats') ducats += eqEntry.cost;
          else glory += eqEntry.cost;
        }
      }
    }

    return { ducats, glory, modelCount: models.length };
  }, [warbandId]) ?? { ducats: 0, glory: 0, modelCount: 0 };
}
