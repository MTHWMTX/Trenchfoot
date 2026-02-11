import type { EquipmentTemplate } from '../../../types';

export const equipmentTemplates: EquipmentTemplate[] = [
  // --- MELEE WEAPONS ---
  { id: 'eq-sword', factionId: '', name: 'Sword', type: 'melee_weapon', cost: 10, gloryCost: 0, stats: { dice: 2, melee: '+0', damage: 1 }, specialRules: ['Parry: +1 to ARMOUR SAVE in melee if not attacking this activation.'], restrictions: [] },
  { id: 'eq-knife', factionId: '', name: 'Knife', type: 'melee_weapon', cost: 5, gloryCost: 0, stats: { dice: 1, melee: '+0', damage: 1 }, specialRules: [], restrictions: [] },
  { id: 'eq-bayonet', factionId: '', name: 'Bayonet', type: 'melee_weapon', cost: 5, gloryCost: 0, stats: { dice: 1, melee: '+0', damage: 1 }, specialRules: ['Reach: +1" ENGAGEMENT RANGE when attached to a rifle.'], restrictions: [] },
  { id: 'eq-mace', factionId: '', name: 'Mace', type: 'melee_weapon', cost: 15, gloryCost: 0, stats: { dice: 2, melee: '+0', damage: 2 }, specialRules: ['Crushing: -1 to enemy ARMOUR SAVE.'], restrictions: [] },
  { id: 'eq-greatsword', factionId: '', name: 'Greatsword', type: 'melee_weapon', cost: 25, gloryCost: 0, stats: { dice: 3, melee: '+0', damage: 2 }, specialRules: ['Two-handed: Cannot use a second melee weapon or shield.', 'Sweeping: May split attacks between targets in ENGAGEMENT RANGE.'], restrictions: [] },
  { id: 'eq-flail', factionId: '', name: 'Flail', type: 'melee_weapon', cost: 15, gloryCost: 0, stats: { dice: 2, melee: '+0', damage: 1 }, specialRules: ['Ignore Shield: Target cannot use shield bonuses.'], restrictions: [] },
  { id: 'eq-staff', factionId: '', name: 'Staff', type: 'melee_weapon', cost: 5, gloryCost: 0, stats: { dice: 1, melee: '+0', damage: 1 }, specialRules: ['Arcane Focus: +1 to sorcery rolls when equipped.'], restrictions: [] },
  { id: 'eq-improvised-weapon', factionId: '', name: 'Improvised Weapon', type: 'melee_weapon', cost: 0, gloryCost: 0, stats: { dice: 1, melee: '-1', damage: 1 }, specialRules: [], restrictions: [] },
  { id: 'eq-scimitar', factionId: 'iron-sultanate', name: 'Scimitar', type: 'melee_weapon', cost: 15, gloryCost: 0, stats: { dice: 2, melee: '+0', damage: 1 }, specialRules: ['Swift Strike: +1 to hit on the charge.'], restrictions: [] },
  { id: 'eq-hellforged-blade', factionId: 'heretic-legion', name: 'Hellforged Blade', type: 'melee_weapon', cost: 30, gloryCost: 0, stats: { dice: 3, melee: '+0', damage: 2 }, specialRules: ['Daemon-touched: +1 damage against FAITHFUL models.', 'Cursed: Bearer suffers 1 wound if they roll all 1s in melee.'], restrictions: [] },
  { id: 'eq-poisoned-blade', factionId: 'court-serpent', name: 'Poisoned Blade', type: 'melee_weapon', cost: 20, gloryCost: 0, stats: { dice: 2, melee: '+0', damage: 1 }, specialRules: ['Poisoned: Successful wounds require a second ARMOUR SAVE or suffer an additional wound.'], restrictions: [] },
  { id: 'eq-sacrificial-dagger', factionId: 'black-grail', name: 'Sacrificial Dagger', type: 'melee_weapon', cost: 15, gloryCost: 0, stats: { dice: 1, melee: '+1', damage: 1 }, specialRules: ['Blood Sacrifice: When this weapon kills a model, the wielder regains 1 wound.'], restrictions: [] },

  // --- RANGED WEAPONS ---
  { id: 'eq-pistol', factionId: '', name: 'Pistol', type: 'ranged_weapon', cost: 15, gloryCost: 0, stats: { range: 8, dice: 1, shoot: '+0' }, specialRules: ['Quick Draw: May be used in melee as a ranged attack (1 shot).'], restrictions: [] },
  { id: 'eq-rifle', factionId: '', name: 'Rifle', type: 'ranged_weapon', cost: 20, gloryCost: 0, stats: { range: 24, dice: 1, shoot: '+0' }, specialRules: [], restrictions: [] },
  { id: 'eq-sniper-rifle', factionId: '', name: 'Sniper Rifle', type: 'ranged_weapon', cost: 35, gloryCost: 0, stats: { range: 36, dice: 1, shoot: '+1' }, specialRules: ['Aimed Shot: +1 to hit if model did not move.', 'Armour Piercing: -2 to target ARMOUR SAVE.'], restrictions: [] },
  { id: 'eq-machine-gun', factionId: '', name: 'Machine Gun', type: 'ranged_weapon', cost: 50, gloryCost: 0, stats: { range: 24, dice: 4, shoot: '+0' }, specialRules: ['Heavy: Cannot move and shoot.', 'Suppressive: Target suffers -1 to hit until its next activation.'], restrictions: [] },
  { id: 'eq-musket', factionId: 'iron-sultanate', name: 'Musket', type: 'ranged_weapon', cost: 15, gloryCost: 0, stats: { range: 18, dice: 1, shoot: '+0' }, specialRules: ['Reload: Cannot fire two turns in a row.', 'Devastating: +1 damage.'], restrictions: [] },
  { id: 'eq-throwing-knives', factionId: 'court-serpent', name: 'Throwing Knives', type: 'ranged_weapon', cost: 10, gloryCost: 0, stats: { range: 6, dice: 2, shoot: '+0' }, specialRules: ['Quick: May be used as a free action once per activation.', 'Poisoned: Successful wounds are poisoned.'], restrictions: [] },
  { id: 'eq-bombard', factionId: 'iron-sultanate', name: 'Bombard', type: 'ranged_weapon', cost: 60, gloryCost: 0, stats: { range: 30, dice: 1, shoot: '-1' }, specialRules: ['Indirect Fire: May target models outside LINE OF SIGHT.', 'Blast 2": Hits all models within 2" of impact.', 'Setup: Requires one ACTION to deploy before firing.'], restrictions: [] },

  // --- ARMOUR ---
  { id: 'eq-light-armour', factionId: '', name: 'Light Armour', type: 'armour', cost: 10, gloryCost: 0, stats: { save: '+1' }, specialRules: [], restrictions: [] },
  { id: 'eq-medium-armour', factionId: '', name: 'Medium Armour', type: 'armour', cost: 20, gloryCost: 0, stats: { save: '+2' }, specialRules: ['-1" MOVEMENT.'], restrictions: [] },
  { id: 'eq-heavy-armour', factionId: '', name: 'Heavy Armour', type: 'armour', cost: 35, gloryCost: 0, stats: { save: '+3' }, specialRules: ['-2" MOVEMENT.'], restrictions: [] },
  { id: 'eq-shield', factionId: '', name: 'Shield', type: 'armour', cost: 10, gloryCost: 0, stats: { save: '+1' }, specialRules: ['+1 ARMOUR SAVE against ranged attacks.', 'Occupies one hand.'], restrictions: [] },

  // --- RELICS ---
  { id: 'eq-holy-water', factionId: '', name: 'Holy Water', type: 'relic', cost: 15, gloryCost: 1, stats: {}, specialRules: ['One use. Throw at HERETIC model within 6". Deals D3 wounds (no armour save).'], restrictions: ['FAITHFUL only'] },
  { id: 'eq-banner-of-faith', factionId: '', name: 'Banner of Faith', type: 'relic', cost: 25, gloryCost: 2, stats: {}, specialRules: ['All friendly models within 6" gain +1 to MORALE CHECKs.', 'Two-handed: Cannot use ranged weapons while carrying.'], restrictions: ['FAITHFUL only'] },
  { id: 'eq-cursed-icon', factionId: '', name: 'Cursed Icon', type: 'relic', cost: 20, gloryCost: 1, stats: {}, specialRules: ['FAITHFUL models within 3" suffer -1 to hit.', 'Bearer gains +1 to melee damage.'], restrictions: ['HERETIC only'] },
  { id: 'eq-dark-tome', factionId: '', name: 'Dark Tome', type: 'relic', cost: 30, gloryCost: 2, stats: {}, specialRules: ['Bearer may attempt one sorcery power per ROUND.', 'Dangerous: On a failed sorcery roll of 1, suffer D3 wounds.'], restrictions: ['HERETIC only'] },

  // --- ITEMS ---
  { id: 'eq-smoke-bomb', factionId: '', name: 'Smoke Bomb', type: 'item', cost: 10, gloryCost: 0, stats: {}, specialRules: ['One use. Place a 3" smoke cloud within 6". Models inside cannot be targeted by ranged attacks.'], restrictions: [] },
  { id: 'eq-bandages', factionId: '', name: 'Bandages', type: 'item', cost: 10, gloryCost: 0, stats: {}, specialRules: ['One use. Spend an ACTION to heal 1 wound on this model or an adjacent friendly model.'], restrictions: [] },
  { id: 'eq-trench-whistle', factionId: '', name: 'Trench Whistle', type: 'item', cost: 15, gloryCost: 0, stats: {}, specialRules: ['One use. All friendly models within 12" may immediately move 3" toward the bearer.'], restrictions: [] },
];
