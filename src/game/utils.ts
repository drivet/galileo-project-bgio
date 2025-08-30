// mutate deck, return taken items
export function takeTopN<T>(items: T[], N: number): T[] {
  return items.splice(0, N);
}

export function takeTop<T>(items: T[]): T | undefined {
  return items.splice(0, 1)[0];
}

export function peek<T>(items: T[]): T | undefined {
  return items[items.length - 1];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function shuffle<T>(random: any, deck: readonly T[] | T[]): T[] {
  return random.Shuffle(deck as unknown[] as T[]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function randInt(random: any, max: number) {
  return Math.floor(random.Number() * max);
}

/**
 * Slide items to fill in the empty slots, and replace slots with new cards
 * Modifies items in place
 * @param items
 * @param deck
 */
export function slideAndReplace<T>(items: (T | null)[], deck: T[]) {
  const newItems = items.filter((i) => i);
  const count = items.length - newItems.length;
  for (let i = 0; i < count; i++) {
    const top = takeTop(deck);
    if (top) {
      newItems.push(top);
    }
  }
  for (let i = 0; i < newItems.length; i++) {
    items[i] = newItems[i];
  }
}
