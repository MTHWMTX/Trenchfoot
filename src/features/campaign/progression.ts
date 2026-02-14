/**
 * 12-game campaign progression constants.
 * Each entry defines the threshold value and field strength for that game number.
 */

interface Progression {
  threshold: number;
  fieldStrength: number;
}

// Indexed by game number (1-12). Index 0 is unused.
const PROGRESSION_TABLE: Progression[] = [
  { threshold: 0, fieldStrength: 0 },       // 0: unused
  { threshold: 700, fieldStrength: 10 },     // Game 1
  { threshold: 800, fieldStrength: 11 },     // Game 2
  { threshold: 900, fieldStrength: 12 },     // Game 3
  { threshold: 1000, fieldStrength: 13 },    // Game 4
  { threshold: 1100, fieldStrength: 14 },    // Game 5
  { threshold: 1200, fieldStrength: 15 },    // Game 6
  { threshold: 1300, fieldStrength: 16 },    // Game 7
  { threshold: 1400, fieldStrength: 17 },    // Game 8
  { threshold: 1500, fieldStrength: 18 },    // Game 9
  { threshold: 1600, fieldStrength: 19 },    // Game 10
  { threshold: 1700, fieldStrength: 20 },    // Game 11
  { threshold: 1800, fieldStrength: 22 },    // Game 12
];

export function getProgression(gameNumber: number): Progression {
  const clamped = Math.max(1, Math.min(12, gameNumber));
  return PROGRESSION_TABLE[clamped];
}

export const MAX_GAMES = 12;
