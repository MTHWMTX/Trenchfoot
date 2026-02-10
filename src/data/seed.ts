import { db } from './db';
import type { Ruleset, Rule, Keyword } from '../types';

const OFFICIAL_RULESET_ID = 'official-1.0';

const ruleset: Ruleset = {
  id: OFFICIAL_RULESET_ID,
  name: 'Official Rules 1.0',
  version: '1.0.0',
  type: 'official',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const rules: Rule[] = [
  {
    id: 'core-overview',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Game Overview',
    slug: 'game-overview',
    category: 'core',
    content: `Trench Crusade is a skirmish-scale tabletop miniatures game set in a horrifying alternate timeline of the Great War. Each player fields a small, elite WARBAND of miniatures from one of many diverse FACTIONS, taking turns activating one model at a time.

Each model performs ACTIONS during their activation, such as moving, shooting, or fighting in melee combat. The game uses six-sided dice (D6) to resolve actions.

A game is played over a series of ROUNDS. Each round, players alternate activating their models until all models have been activated. The player who achieves their SCENARIO objectives wins the game.`,
    order: 1,
    keywordIds: ['kw-warband', 'kw-faction', 'kw-action', 'kw-d6', 'kw-round', 'kw-scenario'],
  },
  {
    id: 'core-activations',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Activations',
    slug: 'activations',
    category: 'core',
    content: `During a ROUND, players take turns activating one model at a time. The player with the INITIATIVE activates first. After a model is activated, the other player activates one of their models, and so on.

When a model is activated, it may perform up to two ACTIONS. A model cannot perform the same action twice in one activation, unless specifically stated otherwise.

Once all models on both sides have been activated, the round ends and a new ROUND begins.`,
    order: 2,
    keywordIds: ['kw-round', 'kw-initiative', 'kw-action'],
  },
  {
    id: 'movement-basic',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Movement',
    slug: 'movement',
    category: 'movement',
    content: `A model may spend an ACTION to move. When moving, a model may move up to its MOVEMENT value in inches in any direction.

Models may not move through other models or impassable TERRAIN. Models may move through friendly models if they have enough movement to clear them entirely.

A model that moves within 1" of an enemy model must stop — this is called being IN ENGAGEMENT RANGE. A model that starts its activation IN ENGAGEMENT RANGE of an enemy may not use the Move action unless it first performs a DISENGAGE action.`,
    order: 1,
    keywordIds: ['kw-action', 'kw-movement-stat', 'kw-terrain', 'kw-engagement-range', 'kw-disengage'],
  },
  {
    id: 'combat-shooting',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Shooting',
    slug: 'shooting',
    category: 'combat',
    content: `A model may spend an ACTION to shoot with one of its ranged weapons. The model must have LINE OF SIGHT to the target and the target must be within the weapon's RANGE.

To make a shooting attack, roll a number of D6 equal to the weapon's DICE value. Each die that meets or exceeds the weapon's SHOOT value scores a HIT. For each hit, the target must make an ARMOUR SAVE or suffer a WOUND.

Modifiers may apply to the roll based on COVER, range, and special abilities. A natural roll of 1 always fails, and a natural roll of 6 always succeeds.`,
    order: 1,
    keywordIds: ['kw-action', 'kw-los', 'kw-range', 'kw-d6', 'kw-hit', 'kw-armour-save', 'kw-wound', 'kw-cover'],
  },
  {
    id: 'combat-melee',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Melee Combat',
    slug: 'melee-combat',
    category: 'combat',
    content: `A model IN ENGAGEMENT RANGE of an enemy model may spend an ACTION to fight in melee. The attacking model selects one of its melee weapons.

To make a melee attack, roll a number of D6 equal to the weapon's DICE value. Each die that meets or exceeds the weapon's MELEE value scores a HIT. For each hit, the target must make an ARMOUR SAVE or suffer a WOUND.

If a model is attacked in melee and survives, it may immediately make a RIPOSTE — a free melee attack back against the attacker with one of its melee weapons.`,
    order: 2,
    keywordIds: ['kw-engagement-range', 'kw-action', 'kw-d6', 'kw-hit', 'kw-armour-save', 'kw-wound', 'kw-riposte'],
  },
  {
    id: 'morale-blood-markers',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Blood Markers & Morale',
    slug: 'blood-markers-and-morale',
    category: 'morale',
    content: `When a model is removed as a casualty, place a BLOOD MARKER where it fell. Blood markers represent the mounting horror and carnage of battle.

At the start of each ROUND, a player must make a MORALE CHECK if they have blood markers equal to or exceeding half their starting warband size. Roll a D6 — on a result of 1-3, the warband ROUTS and the game ends.

Blood markers are a critical resource to track. Some abilities and RELICS can interact with blood markers, either adding or removing them.`,
    order: 1,
    keywordIds: ['kw-blood-marker', 'kw-round', 'kw-morale-check', 'kw-rout', 'kw-d6', 'kw-relic'],
  },
  {
    id: 'campaign-overview',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Campaign Play',
    slug: 'campaign-play',
    category: 'campaign',
    content: `Trench Crusade supports campaign play, where your WARBAND grows and evolves over multiple games. After each game, you go through the POST-GAME SEQUENCE:

1. **Casualties**: Roll on the INJURY TABLE for each model that was removed as a casualty during the game.
2. **Experience**: Models that participated gain EXPERIENCE POINTS (XP) based on their performance.
3. **Income**: Your warband earns DUCATS based on the scenario and performance.
4. **Recruit & Equip**: Spend ducats to recruit new models or purchase EQUIPMENT.
5. **Advance**: Models with enough XP may gain ADVANCES — permanent stat increases or new abilities.

Campaign play adds a layer of strategy beyond individual games, as you must manage your warband's growth and recovery.`,
    order: 1,
    keywordIds: ['kw-warband', 'kw-post-game', 'kw-injury-table', 'kw-xp', 'kw-ducats', 'kw-equipment', 'kw-advance'],
  },
  {
    id: 'equipment-overview',
    rulesetId: OFFICIAL_RULESET_ID,
    title: 'Equipment',
    slug: 'equipment',
    category: 'equipment',
    content: `Models in your WARBAND carry various types of EQUIPMENT, including weapons, armour, and special items called RELICS.

**Weapons** are divided into ranged weapons and melee weapons. Each weapon has a profile listing its RANGE (for ranged weapons), DICE value, SHOOT or MELEE value, and any special rules.

**Armour** provides an ARMOUR SAVE value. When a model suffers a HIT, it rolls a D6 — if the result meets or exceeds its armour save value, the hit is negated.

**Relics** are powerful, unique items that provide special abilities. Each faction has access to different relics, and a model may only carry a limited number.`,
    order: 1,
    keywordIds: ['kw-warband', 'kw-equipment', 'kw-relic', 'kw-range', 'kw-armour-save', 'kw-hit', 'kw-d6'],
  },
];

const keywords: Keyword[] = [
  {
    id: 'kw-warband',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'WARBAND',
    aliases: ['warband', 'warbands'],
    definition: 'A player\'s collection of models that they field in a game of Trench Crusade.',
    ruleId: 'core-overview',
  },
  {
    id: 'kw-faction',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'FACTION',
    aliases: ['faction', 'factions'],
    definition: 'One of the many diverse groups that models belong to, each with unique abilities and playstyles.',
    ruleId: 'core-overview',
  },
  {
    id: 'kw-action',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'ACTION',
    aliases: ['action', 'actions'],
    definition: 'An activity a model can perform during its activation, such as moving, shooting, or fighting.',
    ruleId: 'core-activations',
  },
  {
    id: 'kw-round',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'ROUND',
    aliases: ['round', 'rounds'],
    definition: 'A complete cycle where all models on both sides have been activated.',
    ruleId: 'core-activations',
  },
  {
    id: 'kw-initiative',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'INITIATIVE',
    aliases: ['initiative'],
    definition: 'Determines which player activates first in a round.',
    ruleId: 'core-activations',
  },
  {
    id: 'kw-d6',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'D6',
    aliases: ['d6', 'dice', 'six-sided dice'],
    definition: 'A standard six-sided die, the primary randomizer used in Trench Crusade.',
    ruleId: 'core-overview',
  },
  {
    id: 'kw-scenario',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'SCENARIO',
    aliases: ['scenario', 'scenarios', 'mission'],
    definition: 'The specific victory conditions and setup for a game of Trench Crusade.',
    ruleId: 'core-overview',
  },
  {
    id: 'kw-movement-stat',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'MOVEMENT',
    aliases: ['movement'],
    definition: 'A model\'s stat that determines how far it can move in inches during a Move action.',
    ruleId: 'movement-basic',
  },
  {
    id: 'kw-terrain',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'TERRAIN',
    aliases: ['terrain'],
    definition: 'Physical features on the battlefield that affect movement, line of sight, and combat.',
    ruleId: 'movement-basic',
  },
  {
    id: 'kw-engagement-range',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'ENGAGEMENT RANGE',
    aliases: ['engagement range', 'in engagement range'],
    definition: 'Within 1" of an enemy model. Models in engagement range cannot freely move away.',
    ruleId: 'movement-basic',
  },
  {
    id: 'kw-disengage',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'DISENGAGE',
    aliases: ['disengage'],
    definition: 'An action that allows a model to move away from engagement range of an enemy.',
    ruleId: 'movement-basic',
  },
  {
    id: 'kw-los',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'LINE OF SIGHT',
    aliases: ['line of sight', 'LOS'],
    definition: 'Whether a model can see a target. Determined by drawing an unobstructed line from model to target.',
    ruleId: 'combat-shooting',
  },
  {
    id: 'kw-range',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'RANGE',
    aliases: ['range'],
    definition: 'The maximum distance in inches at which a ranged weapon can target an enemy.',
    ruleId: 'combat-shooting',
  },
  {
    id: 'kw-hit',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'HIT',
    aliases: ['hit', 'hits'],
    definition: 'A successful attack roll that meets or exceeds the required value.',
    ruleId: 'combat-shooting',
  },
  {
    id: 'kw-armour-save',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'ARMOUR SAVE',
    aliases: ['armour save', 'armor save', 'save'],
    definition: 'A defensive roll to negate a hit. Roll a D6 and meet or exceed the armour save value.',
    ruleId: 'combat-shooting',
  },
  {
    id: 'kw-wound',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'WOUND',
    aliases: ['wound', 'wounds'],
    definition: 'Damage suffered by a model when it fails an armour save against a hit.',
    ruleId: 'combat-shooting',
  },
  {
    id: 'kw-cover',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'COVER',
    aliases: ['cover'],
    definition: 'Protection provided by terrain. Models in cover are harder to hit with ranged attacks.',
    ruleId: 'combat-shooting',
  },
  {
    id: 'kw-riposte',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'RIPOSTE',
    aliases: ['riposte'],
    definition: 'A free melee counter-attack made by a model that survives being attacked in melee.',
    ruleId: 'combat-melee',
  },
  {
    id: 'kw-blood-marker',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'BLOOD MARKER',
    aliases: ['blood marker', 'blood markers'],
    definition: 'A marker placed when a model is killed. Tracks mounting casualties for morale checks.',
    ruleId: 'morale-blood-markers',
  },
  {
    id: 'kw-morale-check',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'MORALE CHECK',
    aliases: ['morale check', 'morale'],
    definition: 'A roll made when blood markers reach half your warband size. Failure causes a rout.',
    ruleId: 'morale-blood-markers',
  },
  {
    id: 'kw-rout',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'ROUT',
    aliases: ['rout', 'routs'],
    definition: 'When a warband flees the battle due to failed morale. The game ends immediately.',
    ruleId: 'morale-blood-markers',
  },
  {
    id: 'kw-relic',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'RELIC',
    aliases: ['relic', 'relics'],
    definition: 'A powerful, unique item that provides special abilities to the model carrying it.',
    ruleId: 'equipment-overview',
  },
  {
    id: 'kw-post-game',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'POST-GAME SEQUENCE',
    aliases: ['post-game sequence', 'post-game', 'post game'],
    definition: 'The series of steps performed after a game in campaign play: casualties, XP, income, recruit, advance.',
    ruleId: 'campaign-overview',
  },
  {
    id: 'kw-injury-table',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'INJURY TABLE',
    aliases: ['injury table', 'injuries'],
    definition: 'A table rolled on for each casualty after a game to determine their fate in campaign play.',
    ruleId: 'campaign-overview',
  },
  {
    id: 'kw-xp',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'EXPERIENCE POINTS',
    aliases: ['experience points', 'XP', 'experience'],
    definition: 'Points earned by models during games. Accumulated XP can be spent on advances.',
    ruleId: 'campaign-overview',
  },
  {
    id: 'kw-ducats',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'DUCATS',
    aliases: ['ducats', 'ducat'],
    definition: 'The currency used to recruit models and purchase equipment in campaign play.',
    ruleId: 'campaign-overview',
  },
  {
    id: 'kw-equipment',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'EQUIPMENT',
    aliases: ['equipment'],
    definition: 'Weapons, armour, and items carried by models in a warband.',
    ruleId: 'equipment-overview',
  },
  {
    id: 'kw-advance',
    rulesetId: OFFICIAL_RULESET_ID,
    term: 'ADVANCE',
    aliases: ['advance', 'advances'],
    definition: 'A permanent stat increase or new ability gained by a model when they spend enough XP.',
    ruleId: 'campaign-overview',
  },
];

export async function seedDatabase() {
  const existingRulesets = await db.rulesets.count();
  if (existingRulesets > 0) return;

  await db.transaction('rw', db.rulesets, db.rules, db.keywords, async () => {
    await db.rulesets.add(ruleset);
    await db.rules.bulkAdd(rules);
    await db.keywords.bulkAdd(keywords);
  });
}
