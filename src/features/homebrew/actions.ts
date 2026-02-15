import { db } from '../../data/db';
import type {
  Ruleset, Faction, ModelTemplate, EquipmentTemplate, Addon,
  FactionModelEntry, FactionEquipEntry,
} from '../../types';

// --- Ruleset CRUD ---

export async function createRuleset(name: string): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date();
  const ruleset: Ruleset = {
    id,
    name,
    version: '0.1.0',
    type: 'homebrew',
    createdAt: now,
    updatedAt: now,
  };
  await db.rulesets.add(ruleset);
  return id;
}

export async function updateRuleset(id: string, changes: Partial<Pick<Ruleset, 'name' | 'version'>>) {
  await db.rulesets.update(id, { ...changes, updatedAt: new Date() });
}

export async function deleteRuleset(id: string) {
  // Cascade: delete all content linked to this ruleset
  const factions = await db.factions.where('rulesetId').equals(id).toArray();
  const factionIds = factions.map(f => f.id);

  // Split into two transactions to stay within Dexie's overload limit
  await db.transaction('rw', db.modelTemplates, db.addons, db.equipmentTemplates, db.factions, async () => {
    for (const fid of factionIds) {
      await db.modelTemplates.where('factionId').equals(fid).delete();
      await db.addons.where('factionId').equals(fid).delete();
    }
    await db.addons.where('rulesetId').equals(id).delete();
    await db.equipmentTemplates.where('rulesetId').equals(id).delete();
    await db.factions.where('rulesetId').equals(id).delete();
  });
  await db.transaction('rw', db.keywords, db.rules, db.rulesets, async () => {
    await db.keywords.where('rulesetId').equals(id).delete();
    await db.rules.where('rulesetId').equals(id).delete();
    await db.rulesets.delete(id);
  });
}

// --- Faction CRUD ---

export async function createFaction(rulesetId: string, name: string, team: 'heaven' | 'hell'): Promise<string> {
  const id = crypto.randomUUID();
  const faction: Faction = {
    id,
    rulesetId,
    name,
    team,
    flavour: '',
    rules: [],
    equipmentList: [],
    modelList: [],
  };
  await db.factions.add(faction);
  return id;
}

export async function updateFaction(id: string, changes: Partial<Pick<Faction, 'name' | 'team' | 'flavour' | 'rules'>>) {
  await db.factions.update(id, changes);
}

export async function deleteFaction(id: string) {
  await db.transaction('rw', db.factions, db.modelTemplates, db.addons, async () => {
    await db.modelTemplates.where('factionId').equals(id).delete();
    await db.addons.where('factionId').equals(id).delete();
    await db.factions.delete(id);
  });
}

// --- Model CRUD ---

export async function createModelTemplate(factionId: string, _rulesetId: string, data: {
  name: string;
  stats: ModelTemplate['stats'];
  tags: string[];
  blurb: string;
  promotion: number;
}): Promise<string> {
  const id = crypto.randomUUID();

  // Look up faction to determine team
  const faction = await db.factions.get(factionId);
  const team = faction?.team ?? 'heaven';

  const model: ModelTemplate = {
    id,
    name: data.name,
    factionId,
    variantId: 'fv_basic',
    team,
    tags: data.tags,
    stats: data.stats,
    addonIds: [],
    blurb: data.blurb,
    promotion: data.promotion,
  };
  await db.modelTemplates.add(model);

  // Auto-add to parent faction's modelList with default pricing
  if (faction) {
    const entry: FactionModelEntry = {
      modelId: id,
      cost: 0,
      costType: 'ducats',
      limitMin: 0,
      limitMax: 99,
      defaultEquipment: [],
      upgrades: [],
    };
    await db.factions.update(factionId, {
      modelList: [...faction.modelList, entry],
    });
  }

  return id;
}

export async function updateModelTemplate(id: string, changes: Partial<Pick<ModelTemplate, 'name' | 'stats' | 'tags' | 'blurb' | 'promotion' | 'addonIds'>>) {
  await db.modelTemplates.update(id, changes);
}

export async function deleteModelTemplate(id: string) {
  const model = await db.modelTemplates.get(id);
  if (!model) return;

  await db.transaction('rw', db.modelTemplates, db.factions, async () => {
    await db.modelTemplates.delete(id);
    // Remove from parent faction's modelList
    const faction = await db.factions.get(model.factionId);
    if (faction) {
      await db.factions.update(model.factionId, {
        modelList: faction.modelList.filter(m => m.modelId !== id),
      });
    }
  });
}

// --- Equipment CRUD ---

export async function createEquipmentTemplate(rulesetId: string, data: {
  name: string;
  category: EquipmentTemplate['category'];
  equipType: string;
  range: string;
  tags: string[];
  modifiers: string[];
  description: string;
  blurb: string;
}): Promise<string> {
  const id = crypto.randomUUID();
  const equipment: EquipmentTemplate = {
    id,
    rulesetId,
    name: data.name,
    category: data.category,
    equipType: data.equipType || null,
    range: data.range || null,
    tags: data.tags,
    modifiers: data.modifiers,
    description: data.description,
    blurb: data.blurb,
  };
  await db.equipmentTemplates.add(equipment);
  return id;
}

export async function updateEquipmentTemplate(id: string, changes: Partial<Pick<EquipmentTemplate, 'name' | 'category' | 'equipType' | 'range' | 'tags' | 'modifiers' | 'description' | 'blurb'>>) {
  await db.equipmentTemplates.update(id, changes);
}

export async function deleteEquipmentTemplate(id: string) {
  await db.transaction('rw', db.equipmentTemplates, db.factions, async () => {
    await db.equipmentTemplates.delete(id);
    // Remove from any faction's equipmentList that references it
    const allFactions = await db.factions.toArray();
    for (const faction of allFactions) {
      if (faction.equipmentList.some(e => e.equipId === id)) {
        await db.factions.update(faction.id, {
          equipmentList: faction.equipmentList.filter(e => e.equipId !== id),
        });
      }
    }
  });
}

// --- Addon CRUD ---

export async function createAddon(factionId: string, rulesetId: string, data: {
  name: string;
  tags: string[];
  description: string;
}): Promise<string> {
  const id = crypto.randomUUID();
  const addon: Addon = {
    id,
    rulesetId,
    name: data.name,
    factionId,
    tags: data.tags,
    description: data.description,
  };
  await db.addons.add(addon);
  return id;
}

export async function updateAddon(id: string, changes: Partial<Pick<Addon, 'name' | 'factionId' | 'tags' | 'description'>>) {
  await db.addons.update(id, changes);
}

export async function deleteAddon(id: string) {
  await db.transaction('rw', db.addons, db.modelTemplates, async () => {
    await db.addons.delete(id);
    // Remove from any modelTemplate's addonIds
    const allModels = await db.modelTemplates.toArray();
    for (const model of allModels) {
      if (model.addonIds.includes(id)) {
        await db.modelTemplates.update(model.id, {
          addonIds: model.addonIds.filter(a => a !== id),
        });
      }
    }
  });
}

// --- Faction Armoury ---

export async function updateFactionModelList(factionId: string, modelList: FactionModelEntry[]) {
  await db.factions.update(factionId, { modelList });
}

export async function updateFactionEquipmentList(factionId: string, equipmentList: FactionEquipEntry[]) {
  await db.factions.update(factionId, { equipmentList });
}
