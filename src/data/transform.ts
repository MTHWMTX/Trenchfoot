/**
 * Transform Compendium JSON data into our app's type system.
 * The Compendium uses a structured Description system with nested content.
 * We flatten descriptions to plain text for simpler rendering.
 */

import type {
  Faction, WarbandVariant, ModelTemplate, EquipmentTemplate,
  Addon, Keyword, FactionRule,
} from '../types';

// --- Raw Compendium Types ---

interface RawTag {
  tag_name: string;
  val: string;
}

interface RawDescription {
  tags: RawTag[];
  content: string;
  subcontent?: RawDescription[];
  glossary?: { val: string; id: string }[];
}

interface RawFaction {
  id: string;
  name: string;
  team: string;
  flavour: RawDescription[];
  rules: { title: string; description: RawDescription[] }[];
  equipment: {
    id: string;
    cost: number;
    cost_id: string;
    limit: number;
    restriction: { type: string; val: string }[];
    features?: string[];
  }[];
  models: {
    id: string;
    cost: number;
    cost_id: string;
    limit_min: number;
    limit_max: number;
    equipment: string[];
    upgrades: { id: string; cost: number; cost_id: string }[];
  }[];
}

interface RawModel {
  id: string;
  name: string;
  movement: number[];
  ranged: number[];
  melee: number[];
  armour: number[];
  base: number[];
  faction_id: string;
  variant_id: string;
  team: string;
  tags: RawTag[];
  attachments: RawTag[];
  blurb: RawDescription[];
  abilities: RawDescription[];
  equipment: RawDescription[];
}

interface RawEquipment {
  id: string;
  name: string;
  category: string;
  equip_type: string | null;
  range: string | null;
  tags: RawTag[];
  modifiers: string[];
  blurb: string;
  description: RawDescription[];
}

interface RawAddon {
  id: string;
  name: string;
  faction_id: string;
  tags: RawTag[];
  description: RawDescription[];
}

interface RawVariant {
  id: string;
  name: string;
  faction_id: string;
  flavour: RawDescription[];
  rules: { title: string; description: RawDescription[] }[];
  removed_rules: string[];
  removed_equip: string[];
  removed_model: string[];
  equipment: {
    id: string;
    cost: number;
    cost_id: string;
    limit: number;
    restriction: { type: string; val: string }[];
    features?: string[];
  }[];
  models: {
    id: string;
    cost: number;
    cost_id: string;
    limit_min: number;
    limit_max: number;
    equipment: string[];
    upgrades: { id: string; cost: number; cost_id: string }[];
  }[];
}

interface RawGlossary {
  id: string;
  name: string;
  tags: RawTag[];
  description: RawDescription[];
}

// --- Description Flattening ---

function flattenDescription(descs: RawDescription[]): string {
  if (!descs || !Array.isArray(descs)) return '';

  const parts: string[] = [];

  for (const desc of descs) {
    const descType = desc.tags?.find(t => t.tag_name === 'desc_type')?.val;

    if (descType === 'gap') continue;

    if (descType === 'addon') {
      // addon reference — skip, these are handled via addonIds
      continue;
    }

    if (desc.content) {
      parts.push(desc.content);
    }

    if (desc.subcontent && desc.subcontent.length > 0) {
      const sub = flattenDescription(desc.subcontent);
      if (sub) parts.push(sub);
    }
  }

  return parts.join('\n');
}

function flattenRules(rules: { title: string; description: RawDescription[] }[]): FactionRule[] {
  if (!rules || !Array.isArray(rules)) return [];
  return rules.map(r => ({
    title: r.title,
    description: flattenDescription(r.description),
  }));
}

// --- Transform Functions ---

const RULESET_ID = 'official-1.0.2';

export function transformFactions(raw: RawFaction[]): Faction[] {
  return raw.map(f => ({
    id: f.id,
    rulesetId: RULESET_ID,
    name: f.name,
    team: f.team as 'heaven' | 'hell',
    flavour: flattenDescription(f.flavour),
    rules: flattenRules(f.rules),
    equipmentList: (f.equipment || []).map(e => ({
      equipId: e.id,
      cost: e.cost,
      costType: e.cost_id as 'ducats' | 'glory',
      limit: e.limit,
      restrictions: e.restriction || [],
      features: e.features,
    })),
    modelList: (f.models || []).map(m => ({
      modelId: m.id,
      cost: m.cost,
      costType: m.cost_id as 'ducats' | 'glory',
      limitMin: m.limit_min,
      limitMax: m.limit_max,
      defaultEquipment: m.equipment || [],
      upgrades: (m.upgrades || []).map(u => ({
        id: u.id,
        cost: u.cost,
        costType: u.cost_id,
      })),
    })),
  }));
}

export function transformModels(raw: RawModel[]): ModelTemplate[] {
  return raw.map(m => {
    // Extract addon IDs from abilities (desc_type: "addon")
    const addonIds: string[] = [];
    for (const ability of (m.abilities || [])) {
      const descType = ability.tags?.find(t => t.tag_name === 'desc_type')?.val;
      if (descType === 'addon' && ability.content) {
        addonIds.push(ability.content);
      }
    }
    // Also from attachments
    for (const att of (m.attachments || [])) {
      if (att.tag_name === 'addons' && att.val && !addonIds.includes(att.val)) {
        addonIds.push(att.val);
      }
    }

    return {
      id: m.id,
      name: m.name,
      factionId: m.faction_id,
      variantId: m.variant_id || 'fv_basic',
      team: m.team as 'heaven' | 'hell',
      tags: (m.tags || []).map(t => t.tag_name),
      stats: {
        movement: m.movement?.[0] ?? 6,
        ranged: m.ranged?.length > 0 ? m.ranged[0] : null,
        melee: m.melee?.length > 0 ? m.melee[0] : null,
        armour: m.armour?.[0] ?? 0,
        base: m.base || [25],
      },
      addonIds,
      blurb: flattenDescription(m.blurb),
    };
  });
}

export function transformEquipment(raw: RawEquipment[]): EquipmentTemplate[] {
  return raw.map(e => ({
    id: e.id,
    name: e.name,
    category: e.category as EquipmentTemplate['category'],
    equipType: e.equip_type || null,
    range: e.range || null,
    tags: (e.tags || []).map(t => t.tag_name),
    modifiers: e.modifiers || [],
    description: flattenDescription(e.description),
    blurb: e.blurb || '',
  }));
}

export function transformAddons(raw: RawAddon[]): Addon[] {
  return raw.map(a => ({
    id: a.id,
    name: a.name,
    factionId: a.faction_id || 'fc_none',
    tags: (a.tags || []).map(t => t.tag_name),
    description: flattenDescription(a.description),
  }));
}

export function transformVariants(raw: RawVariant[]): WarbandVariant[] {
  return raw.map(v => ({
    id: v.id,
    factionId: v.faction_id,
    name: v.name,
    flavour: flattenDescription(v.flavour),
    rules: flattenRules(v.rules),
    removedRules: v.removed_rules || [],
    removedEquipment: v.removed_equip || [],
    removedModels: v.removed_model || [],
    addedEquipment: (v.equipment || []).map(e => ({
      equipId: e.id,
      cost: e.cost,
      costType: e.cost_id as 'ducats' | 'glory',
      limit: e.limit,
      restrictions: e.restriction || [],
      features: e.features,
    })),
    addedModels: (v.models || []).map(m => ({
      modelId: m.id,
      cost: m.cost,
      costType: m.cost_id as 'ducats' | 'glory',
      limitMin: m.limit_min,
      limitMax: m.limit_max,
      defaultEquipment: m.equipment || [],
      upgrades: (m.upgrades || []).map(u => ({
        id: u.id,
        cost: u.cost,
        costType: u.cost_id,
      })),
    })),
  }));
}

export function transformGlossary(raw: RawGlossary[]): Keyword[] {
  return raw.map(g => ({
    id: g.id,
    rulesetId: RULESET_ID,
    term: g.name,
    aliases: [g.name.toLowerCase()],
    category: g.tags?.find(t => t.tag_name === 'category')?.val || 'general',
    definition: flattenDescription(g.description),
  }));
}
