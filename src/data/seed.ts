import { db } from './db';
import type { Ruleset, Rule } from '../types';
import {
  transformFactions,
  transformModels,
  transformEquipment,
  transformVariants,
  transformAddons,
  transformGlossary,
} from './transform';

// Import Compendium JSON data
import rawFactions from './compendium/factions.json';
import rawModels from './compendium/models.json';
import rawEquipment from './compendium/equipment.json';
import rawVariants from './compendium/variants.json';
import rawAddons from './compendium/addons.json';
import rawGlossary from './compendium/glossary.json';

const OFFICIAL_RULESET_ID = 'official-1.0';

const ruleset: Ruleset = {
  id: OFFICIAL_RULESET_ID,
  name: 'Official Rules 1.0',
  version: '1.0.0',
  type: 'official',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

// Core rules content (kept as structured rules for the rules reference section)
const rules: Rule[] = [
  {
    id: 'core-overview',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Game Overview',
    slug: 'game-overview',
    category: 'core',
    content: `Trench Crusade is a skirmish-scale tabletop miniatures game set in a horrifying alternate timeline of the Great War. Each player fields a small, elite WARBAND of miniatures from one of many diverse FACTIONS, taking turns activating one model at a time.

Each model performs ACTIONS during their activation, such as moving, shooting, or fighting in melee combat. The game uses two six-sided dice (2D6) to resolve actions, with modifiers adding or removing dice from the pool.

A game is played over a series of ROUNDS. Each round, players alternate activating their models until all models have been activated. The player who achieves their SCENARIO objectives wins the game.`,
    order: 1,
    keywordIds: [],
  },
  {
    id: 'core-activations',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Activations & Actions',
    slug: 'activations',
    category: 'core',
    content: `During a ROUND, players take turns activating one model at a time. The player with the INITIATIVE activates first. After a model is activated, the other player activates one of their models, and so on.

When a model is activated, it may perform ACTIONS. Actions include attacking (shooting or melee), dashing, and using special abilities. Actions are resolved on the Action Success Chart by rolling 2D6 with any applicable +DICE or -DICE modifiers.

RISKY ACTIONS are special actions that end the model's activation immediately if they fail the Action Success Chart roll.`,
    order: 2,
    keywordIds: [],
  },
  {
    id: 'core-movement',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Movement',
    slug: 'movement',
    category: 'core',
    content: `Models move during their activation. A model can move up to its MOVEMENT value in inches. Models may also DASH as an action to move an additional distance.

Models cannot move through enemy models. A model that moves into base contact with an enemy is considered to have CHARGED. Charging models gain a bonus D6 of movement distance.

TERRAIN affects movement — models must climb over obstacles, and difficult terrain may reduce movement speed.`,
    order: 3,
    keywordIds: [],
  },
  {
    id: 'core-shooting',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Ranged Combat',
    slug: 'shooting',
    category: 'core',
    content: `A model may attack with a ranged weapon during its activation. The model must have LINE OF SIGHT to the target and the target must be within the weapon's RANGE.

To shoot, roll 2D6 (modified by the model's ranged dice modifier and other factors) on the Action Success Chart. On a success, the target takes a hit and must roll on the Injury Chart.

HEAVY weapons cannot be fired if the model moved this activation. ASSAULT weapons allow the model to charge after shooting.`,
    order: 4,
    keywordIds: [],
  },
  {
    id: 'core-melee',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Melee Combat',
    slug: 'melee-combat',
    category: 'core',
    content: `A model in base contact with an enemy may attack in melee. Roll 2D6 (modified by the model's melee dice modifier) on the Action Success Chart. On a success, the target takes a hit.

After a melee attack, the defending model may make a RIPOSTE — a free melee attack back against the attacker.

Models with FEAR cause enemies to suffer -1 DICE in melee against them. Models with the STRONG keyword can wield two-handed weapons in one hand.`,
    order: 5,
    keywordIds: [],
  },
  {
    id: 'core-injuries',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Injuries & Blood Markers',
    slug: 'injuries',
    category: 'core',
    content: `When a model is hit, roll 2D6 on the Injury Chart (modified by armour and weapon effects). Results range from the model being unharmed to being taken Out of Action.

Models taken Out of Action are removed from the battlefield. A BLOOD MARKER is placed where they fell. Blood Markers represent mounting casualties and affect morale.

BLESSING MARKERS provide +1 DICE to actions and -1 DICE to injury rolls. Blood Markers provide -1 DICE to the wounded model's actions and +1 DICE to injury rolls against them.

When a warband accumulates enough Blood Markers, the player must take a MORALE TEST. Failure can cause the warband to flee the battle.`,
    order: 6,
    keywordIds: [],
  },
  {
    id: 'core-campaign',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Campaign Play',
    slug: 'campaign-play',
    category: 'core',
    content: `Trench Crusade supports campaign play, where your WARBAND grows and evolves over multiple games. After each game, you go through the POST-GAME SEQUENCE:

1. **Casualties**: Roll on the Injury Table for each model that was taken Out of Action.
2. **Experience**: Models that participated gain EXPERIENCE POINTS based on their performance.
3. **Income**: Your warband earns DUCATS based on the scenario and performance.
4. **Exploration**: Send models to explore for useful items and locations.
5. **Recruit & Equip**: Spend ducats to recruit new models or purchase EQUIPMENT.
6. **Advance**: Models with enough XP may gain ADVANCES — new skills and abilities.

Campaign play adds strategic depth beyond individual games, as you must manage your warband's growth and recovery.`,
    order: 7,
    keywordIds: [],
  },
  {
    id: 'core-equipment',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Equipment',
    slug: 'equipment',
    category: 'core',
    content: `Models carry various types of EQUIPMENT, including ranged weapons, melee weapons, armour, and special items.

**Ranged Weapons** have a Range value and may have keywords like ASSAULT (can charge after shooting), HEAVY (can't move and shoot), CRITICAL (bonus injury dice on criticals), and FIRE/GAS/SHRAPNEL (inflict additional Blood Markers).

**Melee Weapons** are used in close combat. Some are CUMBERSOME (always require two hands) or have CRITICAL hits.

**Armour** provides modifiers to injury rolls, making models harder to take out. Only one piece of HEADGEAR can be worn.

**Equipment costs vary by faction** — each faction has its own armoury with different prices, restrictions, and available items. Some items cost GLORY instead of DUCATS.`,
    order: 8,
    keywordIds: [],
  },
];

export async function seedDatabase() {
  // Check if we need to seed
  const existingFactions = await db.factions.count();
  if (existingFactions > 0) return;

  // Transform Compendium data
  const factions = transformFactions(rawFactions as any[]);
  const models = transformModels(rawModels as any[]);
  const equipment = transformEquipment(rawEquipment as any[]);
  const variants = transformVariants(rawVariants as any[]);
  const addons = transformAddons(rawAddons as any[]);
  const keywords = transformGlossary(rawGlossary as any[]);

  // Seed rules and ruleset
  await db.transaction('rw', db.rulesets, db.rules, async () => {
    await db.rulesets.bulkPut([ruleset]);
    await db.rules.bulkPut(rules);
  });

  // Seed keywords
  await db.keywords.bulkPut(keywords);

  // Seed game data (split into two transactions due to Dexie table limit)
  await db.transaction('rw', db.factions, db.warbandVariants, db.modelTemplates, async () => {
    await db.factions.bulkPut(factions);
    await db.warbandVariants.bulkPut(variants);
    await db.modelTemplates.bulkPut(models);
  });

  await db.transaction('rw', db.equipmentTemplates, db.addons, async () => {
    await db.equipmentTemplates.bulkPut(equipment);
    await db.addons.bulkPut(addons);
  });
}
