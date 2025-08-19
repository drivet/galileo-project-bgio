import { gainCredits, gainEnergy, gainInfluence, switchTrack } from './game-utils';
import { RandomAPI } from './model';
import { setupGame } from './setup';

class NotRandomAPI {
  Number(): number {
    return 1;
  }
  Shuffle<T>(deck: T[]): T[] {
    return deck;
  }
}

describe('Switch track tests', () => {
  it('should not switch at start of game', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    expect(switchTrack(G, G.players[0])).toBe(false);
  });

  it('should pay to switch', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    G.megacredits = 10;
    const player = G.players[0];
    player.track = 'Earth';
    player.megacredits = 5;
    player.influence = 1;
    expect(switchTrack(G, player)).toBe(true);
    expect(player.track).toEqual('Mars');
    expect(player.megacredits).toBe(4);
    expect(G.megacredits).toBe(11);
    expect(player.influence).toBe(1);
  });

  it('should gain influence if has EarthMarsHighway (once)', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    G.megacredits = 10;
    const player = G.players[0];
    player.technologies = [{ energy: 1, megacredits: 1, vp: 1, techId: 'EarthMarsHighway' }];
    player.influence = 1;
    player.track = 'Earth';
    player.megacredits = 5;
    expect(switchTrack(G, player)).toBe(true);
    expect(player.influence).toBe(3);
    expect(player.megacredits).toBe(4);

    // switching again should not give more influence
    expect(switchTrack(G, player)).toBe(true);
    expect(player.influence).toBe(3);

    //...but should still cost
    expect(player.megacredits).toBe(3);
  });
});

describe('Gain credit tests', () => {
  it('should handle bad input', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    G.megacredits = 10;
    const player = G.players[0];
    player.megacredits = 2;
    expect(gainCredits(G, player, -1)).toBe(false);
  });

  it('should gain credits', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    G.megacredits = 10;
    const player = G.players[0];
    player.megacredits = 2;
    expect(gainCredits(G, player, 1)).toBe(true);
    expect(player.megacredits).toBe(3);
    expect(G.megacredits).toBe(9);
  });

  it('should gain extra credits with automatic drilling', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    G.megacredits = 10;
    const player = G.players[0];
    player.megacredits = 2;
    player.technologies = [{ energy: 1, megacredits: 1, vp: 1, techId: 'AutomatedDrilling' }];
    expect(gainCredits(G, player, 1)).toBe(true);
    expect(player.megacredits).toBe(4);
    expect(G.megacredits).toBe(8);
  });

  it('should not gain more than 10 credits', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    G.megacredits = 10;
    const player = G.players[0];
    player.megacredits = 8;
    expect(gainCredits(G, player, 3)).toBe(true);
    expect(player.megacredits).toBe(10);
    expect(G.megacredits).toBe(8);
  });
});

describe('Gain energy tests', () => {
  it('should handle bad input', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    G.energy = 10;
    const player = G.players[0];
    player.energy = 2;
    expect(gainEnergy(G, player, -1)).toBe(false);
  });

  it('should gain energy', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    G.energy = 10;
    const player = G.players[0];
    player.energy = 2;
    expect(gainEnergy(G, player, 1)).toBe(true);
    expect(player.energy).toBe(3);
    expect(G.energy).toBe(9);
  });

  it('should not gain more than 5 energy', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    G.energy = 10;
    const player = G.players[0];
    player.energy = 4;
    expect(gainEnergy(G, player, 2)).toBe(true);
    expect(player.energy).toBe(5);
    expect(G.energy).toBe(9);
  });
});

describe('Gain influence tests', () => {
  it('should handle bad input', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    const player = G.players[0];
    player.influence = 2;
    expect(gainInfluence(G, player, -1)).toBe(false);
  });

  it('should gain influence', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    const player = G.players[0];
    player.megacredits = 2;
    player.influence = 2;
    expect(gainInfluence(G, player, 3)).toBe(true);
    expect(player.influence).toBe(5);
    expect(player.megacredits).toBe(2);
  });

  it('should not gain influence past 10', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    const player = G.players[0];
    player.megacredits = 2;
    player.influence = 10;
    expect(gainInfluence(G, player, 3)).toBe(true);
    expect(player.influence).toBe(10);
    expect(player.megacredits).toBe(2);
  });

  it('should gain credit when going past 10', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    const player = G.players[0];
    player.megacredits = 2;
    player.influence = 9;
    expect(gainInfluence(G, player, 3)).toBe(true);
    expect(player.influence).toBe(10);
    expect(player.megacredits).toBe(3);
  });
});
