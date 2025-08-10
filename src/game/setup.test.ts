import { RandomAPI } from "./model";
import { setupGame } from "./setup";

class NotRandomAPI {

  Number(): number {
    return 1;
  }
  Shuffle<T>(deck: T[]): T[] {
    return deck;
  }
}

it('should show 5 robots for sale', () => {
  const G = setupGame(["0", "1"], new NotRandomAPI() as RandomAPI);
  expect(G.robotsForSale.length).toBe(5);
});
