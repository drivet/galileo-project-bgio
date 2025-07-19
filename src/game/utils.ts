// mutate deck, return taken items
export function takeTopN<T>(items: T[], N: number): T[] {
  return items.splice(0, N);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function shuffle<T>(random: any, deck: readonly T[] | T[]): T[] {
  return random.Shuffle(deck as unknown[] as T[]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function randInt(random: any, max: number) {
  return Math.floor(random.Number() * max);
}
