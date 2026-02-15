import { db } from '../../data/db';
import type { Warband, WarbandModel, GameType } from '../../types';

export async function createWarband(opts: {
  name: string;
  factionId: string;
  variantId: string;
  rulesetId: string;
  gameType: GameType;
}): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date();
  const warband: Warband = {
    id,
    name: opts.name,
    factionId: opts.factionId,
    variantId: opts.variantId,
    rulesetId: opts.rulesetId,
    gameType: opts.gameType,
    ducatLimit: opts.gameType === 'standard' ? 900 : 700,
    gloryLimit: opts.gameType === 'standard' ? 9 : 5,
    modelLimit: opts.gameType === 'standard' ? 12 : 10,
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
  await db.warbands.add(warband);
  return id;
}

export async function deleteWarband(id: string) {
  await db.transaction('rw', db.warbands, db.warbandModels, async () => {
    await db.warbandModels.where('warbandId').equals(id).delete();
    await db.warbands.delete(id);
  });
}

export async function duplicateWarband(id: string): Promise<string> {
  const original = await db.warbands.get(id);
  if (!original) throw new Error('Warband not found');

  const newId = crypto.randomUUID();
  const now = new Date();
  await db.warbands.add({
    ...original,
    id: newId,
    name: `${original.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
  });

  const models = await db.warbandModels.where('warbandId').equals(id).toArray();
  if (models.length > 0) {
    await db.warbandModels.bulkAdd(
      models.map((m) => ({ ...m, id: crypto.randomUUID(), warbandId: newId }))
    );
  }

  return newId;
}

export async function updateWarband(id: string, changes: Partial<Warband>) {
  await db.warbands.update(id, { ...changes, updatedAt: new Date() });
}

export async function addModelToWarband(warbandId: string, templateId: string): Promise<string> {
  const id = crypto.randomUUID();
  const warband = await db.warbands.get(warbandId);
  const count = await db.warbandModels.where('warbandId').equals(warbandId).count();

  // Look up default equipment from faction's model list
  let defaultEquipment: string[] = [];
  if (warband) {
    const faction = await db.factions.get(warband.factionId);
    const modelEntry = faction?.modelList.find(m => m.modelId === templateId);
    defaultEquipment = modelEntry?.defaultEquipment ?? [];
  }

  const model: WarbandModel = {
    id,
    warbandId,
    templateId,
    customName: '',
    equipmentIds: defaultEquipment,
    notes: '',
    order: count,
  };
  await db.warbandModels.add(model);
  await db.warbands.update(warbandId, { updatedAt: new Date() });
  return id;
}

export async function removeModelFromWarband(modelId: string) {
  const model = await db.warbandModels.get(modelId);
  if (model) {
    await db.warbandModels.delete(modelId);
    await db.warbands.update(model.warbandId, { updatedAt: new Date() });
  }
}

export async function updateWarbandModel(modelId: string, changes: Partial<WarbandModel>) {
  const model = await db.warbandModels.get(modelId);
  if (model) {
    await db.warbandModels.update(modelId, changes);
    await db.warbands.update(model.warbandId, { updatedAt: new Date() });
  }
}
