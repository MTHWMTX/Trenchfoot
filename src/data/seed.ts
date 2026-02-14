import { db } from './db';
import type { Ruleset, Rule } from '../types';
import {
  transformFactions,
  transformModels,
  transformEquipment,
  transformVariants,
  transformAddons,
  transformGlossary,
  transformTraumaTables,
  transformSkillTables,
  transformExplorationTables,
} from './transform';

// Import Compendium JSON data
import rawFactions from './compendium/factions.json';
import rawModels from './compendium/models.json';
import rawEquipment from './compendium/equipment.json';
import rawVariants from './compendium/variants.json';
import rawAddons from './compendium/addons.json';
import rawGlossary from './compendium/glossary.json';
import rawTraumaTables from './compendium/trauma-tables.json';
import rawSkillTables from './compendium/skill-tables.json';
import rawExplorationTables from './compendium/exploration-tables.json';

const OFFICIAL_RULESET_ID = 'official-1.0.2';

const ruleset: Ruleset = {
  id: OFFICIAL_RULESET_ID,
  name: 'Official Rules 1.0.2',
  version: '1.0.2',
  type: 'official',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2026-01-01'),
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

The game uses two six-sided dice (2D6) to resolve actions via Success Rolls. +DICE modifiers add extra dice to the pool (pick the two highest), while -DICE modifiers also add dice but you pick the two lowest. +DICE and -DICE cancel each other out in pairs before rolling.

A game is played over a series of TURNS. Each Turn has three phases: the **Initiative Phase**, the **Activation Phase**, and the **Morale Phase**. The player who achieves their SCENARIO objectives wins the game.`,
    order: 1,
  },
  {
    id: 'core-activations',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Activations & Actions',
    slug: 'activations',
    category: 'core',
    content: `During a Turn, players take turns activating one model at a time. The player with the **INITIATIVE** activates first — this is the player with the fewest non-Down, non-Out of Action models on the battlefield (roll off on ties). After a model is activated, the other player activates one of their models, and so on.

When activated, a model may perform ACTIONS. Each type of ACTION can only be performed once per Activation unless stated otherwise. The available actions are:
- **Move OR Charge OR Retreat** (only one of these per Activation)
- **Dash** (additional movement)
- **Shoot** (ranged attack)
- **Fight** (melee attack)
- **Other** (special abilities)

Actions requiring a roll use the **Success Roll Table** (2D6 with +DICE/-DICE modifiers). **RISKY ACTIONS** end the model's Activation immediately if the Success Roll fails.`,
    order: 2,
  },
  {
    id: 'core-movement',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Movement',
    slug: 'movement',
    category: 'core',
    content: `A model can **Move** up to its Movement Characteristic in inches. Models may also **Dash** as a separate action to move again (requires a RISKY Success Roll).

Models cannot move within 1" of enemy models except when Charging. A **Charge** targets a visible enemy within 12" — roll a D6 and add it to the model's Movement Characteristic (max 12" total). Models with the HEAVY keyword do not receive the Charge Bonus. If an enemy model is interposed in the charge path, the charging model must charge that model instead.

A model within 1" of an enemy may **Retreat** to disengage, but the enemy gets to make a free melee attack against it first.

**Terrain** affects movement: DIFFICULT TERRAIN costs double movement (1" counts as 2"), DANGEROUS TERRAIN requires a Risky Success Roll (failure causes an Injury Roll), and IMPASSABLE TERRAIN cannot be crossed. Models can climb sheer surfaces (Risky Success Roll), jump gaps (up to half Movement), and jump down (free if under 3", otherwise Injury Roll for falling).`,
    order: 3,
  },
  {
    id: 'core-shooting',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Ranged Combat',
    slug: 'shooting',
    category: 'core',
    content: `A model may take a **Shoot** ACTION to make a Ranged Attack. The sequence is:
1. Choose a Ranged Weapon
2. Pick a visible target within range
3. Check Line of Sight
4. Check Range (within weapon's Range value)
5. Determine modifiers (Elevated: +1 DICE, Cover: -1 DICE, Long Range: -1 DICE)
6. Take the Success Roll

On a success, make an Injury Roll against the target. On a Critical Success (12+), add +1 INJURY DICE to the Injury Roll.

**Shooting Into Melee**: If the target is within 1" of a friendly model, roll a D6 on a miss — on 1-3, a friendly model in that combat is hit instead.

**HEAVY** weapons cannot be used in the same Activation as a Move, Charge, Retreat, or Dash action. **ASSAULT** weapons do not prevent the model from taking a Charge or Fight action in the same Activation.`,
    order: 4,
  },
  {
    id: 'core-melee',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Melee Combat',
    slug: 'melee-combat',
    category: 'core',
    content: `A model within 1" of an enemy may take a **Fight** ACTION to make a Melee Attack. The sequence is:
1. Choose a Melee Weapon
2. Choose a target within 1"
3. Determine modifiers (Diving Charge: +1 DICE, Defended Obstacle: -1 DICE to Injury, Off-Hand Weapon: -1 DICE)
4. Take the Success Roll

On a success, make an Injury Roll. On a Critical Success (12+), add +1 INJURY DICE.

A model with multiple melee weapons can make one attack with each, but the second weapon counts as an Off-Hand Weapon (-1 DICE). Weapons with **CLEAVE (X)** allow X attacks with that weapon per Fight ACTION.

**FEAR** causes -1 DICE to Melee Attacks targeting the model. Models that cause FEAR are immune to FEAR themselves.`,
    order: 5,
  },
  {
    id: 'core-injuries',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Injuries & Blood Markers',
    slug: 'injuries',
    category: 'core',
    content: `When a model is hit, roll 2D6 on the **Injury Table** (modified by +/- INJURY DICE and +/- INJURY MODIFIERS from armour and weapon effects). Note: INJURY DICE and INJURY MODIFIERS are distinct from the +/-DICE used for Success Rolls. The maximum cumulative -INJURY MODIFIER is -3.

**Injury Table results**: 3 or less = No Effect, 4-7 = Minor Wound (BLOOD MARKER placed), 8-9 = Down (model is knocked down), 10+ = Out of Action (model removed).

**BLOOD MARKERS**: Each can be spent by either player — as -1 DICE to the wounded model's Success Rolls, or as +1 INJURY DICE when rolling injuries against the model. A maximum of 6 BLOOD MARKERS can be on a model. Spending 6 BLOOD MARKERS (or 3 if the target is Down) converts the Injury Roll to a **Bloodbath Roll** — roll 3D6 and add all three together.

**BLESSING MARKERS**: Each can be spent as +1 DICE to a Success Roll, or as -1 INJURY DICE to an Injury Roll made against the model. Maximum of 6 per model.

**Down**: A model taken Down has its Activation end, suffers -1 DICE to Success Rolls, and enemies gain +1 INJURY DICE against it in melee. It can stand up on its next Activation at the cost of half its movement.

**Morale Phase**: When half or more of a warband's models are Down or Out of Action, a Morale Check is required. If a LEADER is on the battlefield (not Down or Out of Action), add +1 DICE. A failed Morale Check makes the warband **Shaken** (all Success Rolls become Risky). A second consecutive failure means the warband flees and loses.`,
    order: 6,
  },
  {
    id: 'core-campaign',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Campaign Play',
    slug: 'campaign-play',
    category: 'core',
    content: `Trench Crusade supports campaign play, where your WARBAND grows and evolves over a 12-game campaign. Your warband has a **Threshold Value** (starting at 700 ducats) that grows after each battle, and a **Maximum Field Strength** that scales from 10 to 22 models.

After each game, you go through the **Campaign Phase**:

1. **Trauma Step**: Roll on the Trauma Table for each model taken Out of Action. ELITE models use a D66 table (results range from death to full recovery). Non-Elite models roll a D6 (1-2 = dead, 3+ = survive).
2. **Promotions & Experience**: Models earn Promotion Dice. Roll on one of four Skill Tables — Melee & Strength, Ranged, Stealth & Speed, or Wildcard — to gain new abilities.
3. **Reinforcements**: Recruit new models up to your Threshold Value.
4. **Exploration**: Roll Exploration Dice on tiered Location Tables (Common, Rare, Legendary) to discover items, ducats, or special encounters.
5. **Quartermaster**: Spend ducats to buy equipment, form Fireteams, and reorganize.

Your warband also has a **Patron** who provides unique campaign skills. **Glory Points** earned from Glorious Deeds can purchase powerful **Glory Items**.`,
    order: 7,
  },
  {
    id: 'core-equipment',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Equipment',
    slug: 'equipment',
    category: 'core',
    content: `Models carry **Battlekit** — ranged weapons, melee weapons, armour, grenades, and equipment. Battlekit is purchased from your faction's Armoury Tables.

**Weapon Limits**: A model can carry up to 2 one-handed weapons (ranged or melee) or 1 two-handed weapon, plus grenades. A Shield replaces one hand. Models with the STRONG keyword can use a 2-handed melee weapon in one hand.

**Key Weapon Keywords**:
- **ASSAULT**: Does not prevent Charge or Fight actions in the same Activation
- **HEAVY**: Cannot move and shoot in the same Activation; no Charge Bonus; limit 1 per model
- **CRITICAL**: +2 INJURY DICE (instead of +1) on a Critical Success
- **FIRE/GAS/SHRAPNEL**: Place 1 extra BLOOD MARKER after the Injury Roll, even on No Effect
- **AUTOMATIC (X)**: Make X Ranged Attacks per Shoot action
- **CLEAVE (X)**: Make X Melee Attacks per Fight action
- **PISTOL**: Can be used as ranged or melee weapon in the same Activation
- **RELOAD**: Model's Activation ends after attacking with this weapon

**Armour** provides -INJURY MODIFIERS to Injury Rolls. Only one piece of **HEADGEAR** can be worn. **Equipment costs vary by faction** — each has its own armoury with different prices and restrictions. Some items cost GLORY instead of DUCATS.`,
    order: 8,
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

  // Seed dice tables for campaign
  const traumaTables = transformTraumaTables(rawTraumaTables as any[]);
  const skillTables = transformSkillTables(rawSkillTables as any[]);
  const explorationTables = transformExplorationTables(rawExplorationTables as any[]);

  await db.transaction('rw', db.traumaTables, db.skillTables, db.explorationTables, async () => {
    await db.traumaTables.bulkPut(traumaTables);
    await db.skillTables.bulkPut(skillTables);
    await db.explorationTables.bulkPut(explorationTables);
  });
}
