export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollD66(): number {
  const tens = rollD6();
  const units = rollD6();
  return tens * 10 + units;
}

export function lookupEntry<T extends { rollMin: number; rollMax: number }>(
  entries: T[],
  roll: number
): T | undefined {
  return entries.find(e => roll >= e.rollMin && roll <= e.rollMax);
}
