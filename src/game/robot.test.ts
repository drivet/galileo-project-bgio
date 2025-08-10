import { PlaceRobotCtx, RandomAPI } from "./model";
import { acquireRobot } from "./robot";
import { setupGame } from "./setup";

class NotRandomAPI {

  Number(): number {
    return 1;
  }
  Shuffle<T>(deck: T[]): T[] {
    return deck;
  }
}

describe('Acquire robot tests', () => {
  it('should reject bad indexes', () => {
    const G = setupGame(["0", "1"], new NotRandomAPI() as RandomAPI);
    G.robotsForSale[0]!.moon1 = 'Io';
    G.robotsForSale[0]!.track = 'Earth'
    const player = G.players[0];
    player.track = 'Earth';
    player.influence = 3;
    expect(acquireRobot(G, player, -1, 'Io', false)).toBe(false);
    expect(acquireRobot(G, player, 5, 'Io', false)).toBe(false);
  });
  
  it('should reject wrong track', () => {
    const G = setupGame(["0", "1"], new NotRandomAPI() as RandomAPI);
    G.robotsForSale[0]!.moon1 = 'Io';
    G.robotsForSale[0]!.track = 'Earth'
    const player = G.players[0];
    player.track = 'Mars';
    player.influence = 3;
    expect(acquireRobot(G, player, 0, 'Io', false)).toBe(false);
  });
  
  it('should reject wrong moon', () => {
    const G = setupGame(["0", "1"], new NotRandomAPI() as RandomAPI);
    G.robotsForSale[0]!.moon1 = 'Io';
    G.robotsForSale[0]!.moon2 = null;
    G.robotsForSale[0]!.track = 'Earth'
    const player = G.players[0];
    player.track = 'Earth';
    player.influence = 3;
    expect(acquireRobot(G, player, 0, 'Callisto', false)).toBe(false);
  });

  it('should pay with influence', () => {
    const G = setupGame(["0", "1"], new NotRandomAPI() as RandomAPI);
    const firstRobot = G.robotsForSale[0]!;
    firstRobot.baseCost = 2;
    const player = G.players[0];
    player.track = firstRobot.track;
    player.influence = 3;
    player.megacredits = 3;
    expect(acquireRobot(G, player, 0, firstRobot.moon1, false)).toBe(true);
    expect(player.influence).toBe(1);
    expect(player.megacredits).toBe(3);
    expect((G.actionCtx[0] as PlaceRobotCtx).robotToPlace).toBe(firstRobot);
  });
  
  it('should get an Io discount', () => {
    const G = setupGame(["0", "1"], new NotRandomAPI() as RandomAPI);
    const firstRobot = G.robotsForSale[0]!;
    firstRobot.baseCost = 3;
    const player = G.players[0];
    player.moons['Io'].push({
      level: 5,
      baseLevel: 5,
      moon1: 'Io',
      moon2: null,
      type: 'Miner',
      typeModified: false
    });
    player.track = firstRobot.track;
    player.influence = 3;
    player.megacredits = 3;
    expect(acquireRobot(G, player, 0, firstRobot.moon1, true)).toBe(true);
    expect(player.influence).toBe(2);
    expect(player.megacredits).toBe(1);
  });
});