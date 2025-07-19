// mutate deck, return taken items
export function takeTopN<T extends any>(items: T[], N: number): T[] {
  return items.splice(0, N);
}

export function shuffle<T extends any>(random: any, deck: readonly T[] | T[]): T[] {
  return random.Shuffle(deck as unknown[] as T[]);
}

export function randInt(random: any, max: number) {
  return Math.floor(random.Number() * max);
}