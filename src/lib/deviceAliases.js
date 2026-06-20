/** Hebrew alias tokens used to match device names from the API (not shown in the UI). */

export const HEBREW_DEVICE_ALIASES = {
  fridge: 'מקרר',
  oven: 'תנור',
  coffee: 'קפה',
  dishwasher: 'מדיח',
  pantry: 'מזווה',
  cabinet: 'ארון',
};

export function matchesFridge(alias) {
  return /fridge|refrigerator|מקרר/i.test(alias);
}

export function matchesOven(alias) {
  return /oven|תנור/i.test(alias);
}

export function matchesCoffee(alias) {
  return /coffee|קפה/i.test(alias);
}

export function matchesDishwasher(alias) {
  return /dishwasher|מדיח/i.test(alias);
}

export function matchesStorage(alias) {
  return /pantry|cabinet|ארון|מזווה/i.test(alias);
}
