import type { Faction, WarbandVariant } from '../../../types';

const RULESET_ID = 'official-1.0';

export const factions: Faction[] = [
  // --- FAITHFUL ---
  {
    id: 'new-antioch',
    rulesetId: RULESET_ID,
    name: 'New Antioch',
    side: 'faithful',
    description: 'The Principality of New Antioch stands as the first line of defence against the forces of Hell. Their disciplined soldiers combine faith with military precision.',
    keywordIds: [],
  },
  {
    id: 'trench-pilgrims',
    rulesetId: RULESET_ID,
    name: 'Trench Pilgrims',
    side: 'faithful',
    description: 'A rag-tag procession of the mad, the guilty, and the divinely inspired. Blessed by visions of His angels, these pilgrims follow Prophets into battle.',
    keywordIds: [],
  },
  {
    id: 'iron-sultanate',
    rulesetId: RULESET_ID,
    name: 'The Iron Sultanate',
    side: 'faithful',
    description: 'Warriors of the Sultanate of the Iron Wall, defending humanity from the forces of Hell with ancient traditions and unwavering resolve.',
    keywordIds: [],
  },
  // --- HERETIC ---
  {
    id: 'heretic-legion',
    rulesetId: RULESET_ID,
    name: 'Heretic Legion',
    side: 'heretic',
    description: 'Mortals who have sworn allegiance to the powers of Hell, bolstered by demonic allies and forbidden rituals. They fight to tear down the walls of faith.',
    keywordIds: [],
  },
  {
    id: 'black-grail',
    rulesetId: RULESET_ID,
    name: 'Cult of the Black Grail',
    side: 'heretic',
    description: 'Fanatical devotees of a dark parody of the Holy Grail. They seek to corrupt the sacred and twist faith itself into a weapon against humanity.',
    keywordIds: [],
  },
  {
    id: 'court-serpent',
    rulesetId: RULESET_ID,
    name: 'Court of the Seven-Headed Serpent',
    side: 'heretic',
    description: 'An ancient and insidious faction that operates through deception, poison, and dark sorcery. Their agents infiltrate and corrupt from within.',
    keywordIds: [],
  },
];

export const warbandVariants: WarbandVariant[] = [
  // New Antioch variants
  { id: 'antioch-default', factionId: 'new-antioch', name: 'New Antioch', description: 'Standard New Antioch warband.', specialRules: [] },
  { id: 'antioch-papal', factionId: 'new-antioch', name: 'Papal States Intervention Force', description: 'Elite papal troops with access to blessed equipment and heavy armour.', specialRules: ['Access to Papal Guard models', 'Additional relic slots'] },
  { id: 'antioch-eire', factionId: 'new-antioch', name: 'Eire Rangers', description: 'Fast-moving scouts from the green isle, specializing in ranged combat and guerrilla tactics.', specialRules: ['Improved ranged attacks', 'Scout deployment'] },

  // Trench Pilgrims variants
  { id: 'pilgrims-default', factionId: 'trench-pilgrims', name: 'Trench Pilgrims', description: 'Standard Trench Pilgrims warband led by a Prophet.', specialRules: [] },
  { id: 'pilgrims-flagellants', factionId: 'trench-pilgrims', name: 'Flagellant Procession', description: 'Zealous self-mortifiers who gain power through suffering.', specialRules: ['Flagellant frenzy', 'Pain-fueled abilities'] },
  { id: 'pilgrims-relic-bearers', factionId: 'trench-pilgrims', name: 'Relic Bearers', description: 'Pilgrims devoted to carrying and protecting holy relics into battle.', specialRules: ['Additional relic slots', 'Relic aura abilities'] },

  // Iron Sultanate variants
  { id: 'sultanate-default', factionId: 'iron-sultanate', name: 'Iron Sultanate', description: 'Standard Iron Sultanate warband.', specialRules: [] },
  { id: 'sultanate-janissaries', factionId: 'iron-sultanate', name: 'Janissary Corps', description: 'Disciplined professional soldiers with superior training and equipment.', specialRules: ['Disciplined fire', 'Formation bonuses'] },
  { id: 'sultanate-dervish', factionId: 'iron-sultanate', name: 'Dervish Order', description: 'Whirling mystic warriors who channel divine fury in close combat.', specialRules: ['Whirling attacks', 'Mystic resilience'] },

  // Heretic Legion variants
  { id: 'heretic-default', factionId: 'heretic-legion', name: 'Heretic Legion', description: 'Standard Heretic Legion warband.', specialRules: [] },
  { id: 'heretic-possessed', factionId: 'heretic-legion', name: 'The Possessed', description: 'Warriors consumed by demonic entities, gaining monstrous strength at the cost of their humanity.', specialRules: ['Demonic mutations', 'Unstable possession'] },
  { id: 'heretic-summoners', factionId: 'heretic-legion', name: 'Summoner Cabal', description: 'Dark sorcerers focused on calling forth demonic entities to fight alongside them.', specialRules: ['Summoning rituals', 'Demonic allies'] },

  // Black Grail variants
  { id: 'grail-default', factionId: 'black-grail', name: 'Cult of the Black Grail', description: 'Standard Black Grail warband.', specialRules: [] },
  { id: 'grail-knights', factionId: 'black-grail', name: 'Grail Knights', description: 'Corrupted knights who parody the chivalric orders, mounted on nightmarish steeds.', specialRules: ['Mounted combat', 'Dark chivalry'] },
  { id: 'grail-penitent', factionId: 'black-grail', name: 'Order of the Penitent', description: 'Those who seek dark redemption through corrupted sacraments and blood rituals.', specialRules: ['Blood rituals', 'Dark sacraments'] },

  // Court of Serpent variants
  { id: 'serpent-default', factionId: 'court-serpent', name: 'Court of the Seven-Headed Serpent', description: 'Standard Court warband.', specialRules: [] },
  { id: 'serpent-assassins', factionId: 'court-serpent', name: 'Serpent Assassins', description: 'Silent killers who strike from the shadows with poisoned blades.', specialRules: ['Infiltrate', 'Poisoned weapons'] },
  { id: 'serpent-sorcerers', factionId: 'court-serpent', name: 'Circle of Whispers', description: 'Sorcerers who wield dark magic and forbidden knowledge as weapons.', specialRules: ['Dark sorcery', 'Mind control'] },
];
