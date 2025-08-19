import { hireCharacter } from './character';
import { CharacterCtx, RandomAPI } from './model';
import { setupGame } from './setup';

class NotRandomAPI {
  Number(): number {
    return 1;
  }
  Shuffle<T>(deck: T[]): T[] {
    return deck;
  }
}

describe('Hiring tests', () => {
  it('should handle bad input', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    const player = G.players[0];
    player.influence = 3;
    expect(hireCharacter(G, player, -1)).toBe(false);
    expect(hireCharacter(G, player, 5)).toBe(false);

    // must supply track if influence at 0
    player.influence = 0;
    expect(hireCharacter(G, player, 5)).toBe(false);

    player.track = 'Earth';
    player.influence = 3;
    expect(hireCharacter(G, player, 5, 'Mars')).toBe(false);
  });

  it('should gain influence by hiring', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    const player = G.players[0];
    player.influence = 3;
    player.track = 'Earth';
    const result = hireCharacter(G, player, 0);
    expect(result).toBe(true);
    expect((G.actionCtx[0] as CharacterCtx).character).toBeTruthy();
    expect(player.influence).toBe(3 + (G.actionCtx[0] as CharacterCtx).character.baseInfluence!);
  });

  it('should gain less influence by hiring index 2', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    const player = G.players[0];
    player.influence = 3;
    player.track = 'Earth';
    const result = hireCharacter(G, player, 2);
    expect(result).toBe(true);
    expect((G.actionCtx[0] as CharacterCtx).character).toBeTruthy();
    expect(player.influence).toBe(
      3 + (G.actionCtx[0] as CharacterCtx).character.baseInfluence! - 1,
    );
  });

  it('should gain less influence by hiring index 3', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    const player = G.players[0];
    player.influence = 3;
    player.track = 'Earth';
    const result = hireCharacter(G, player, 3);
    expect(result).toBe(true);
    expect((G.actionCtx[0] as CharacterCtx).character).toBeTruthy();
    expect(player.influence).toBe(
      3 + (G.actionCtx[0] as CharacterCtx).character.baseInfluence! - 2,
    );
  });

  it('should gain less influence by hiring index 4', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    const player = G.players[0];
    player.influence = 3;
    player.track = 'Earth';
    const result = hireCharacter(G, player, 4);
    expect(result).toBe(true);
    expect((G.actionCtx[0] as CharacterCtx).character).toBeTruthy();
    expect(player.influence).toBe(
      3 + (G.actionCtx[0] as CharacterCtx).character.baseInfluence! - 3,
    );
  });

  it('should gain megacredit by hiring', () => {
    const G = setupGame(['0', '1'], new NotRandomAPI() as RandomAPI);
    G.charactersForHire[0] = {
      name: 'MartySimon',
      baseInfluence: 2,
      megacredits: 2,
      immediateTrack: 'Earth',
    };
    const player = G.players[0];
    player.influence = 3;
    player.track = 'Earth';
    const megacredits = player.megacredits;
    const result = hireCharacter(G, player, 0);
    expect(result).toBe(true);
    expect((G.actionCtx[0] as CharacterCtx).character).toBeTruthy();
    expect(player.influence).toBe(3 + (G.actionCtx[0] as CharacterCtx).character.baseInfluence!);
    expect(player.megacredits).toBe(megacredits + 2);
  });
});
