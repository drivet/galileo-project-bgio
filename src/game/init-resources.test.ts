
import { PlayerID } from "boardgame.io";
import { ChooseInitialResources } from "./init-resources";
import { GalileoProjectGameState, GalileoProjectMoveCtx, Player, RoboticProjectCard } from "./model";
import { INVALID_MOVE } from "boardgame.io/core";

function makeRoboticProjectCard(influence: number, megacredits: number, energy: number, initialLevel: number) {
  return { influence, megacredits, energy, initialLevel };
}

function makePlayer(playerID: PlayerID): Player {
  return {
    playerID,
    track: null,
    influence: 0,
    characters: [],
    megacredits: 0,
    energy: 0,
    goalMarkers: 4,

    // maybe do not need these
    moonAssignemnts: ["Callisto", "Europa", "Ganymede", "Io"],
    robotModifiers: ["Builder", "Miner", "StarZ", "Technician"],

    roboticProjects: [],
    moons: {
      "Callisto": 0,
      "Europa" : 0,
      "Ganymede": 0,
      "Io": 0,
    }
  };
}

it ('should fail to choose a resource', () => {
  const G = {
    initialResources: [] as RoboticProjectCard[],
  } as GalileoProjectGameState;

  const moveCtx = { G, playerID: '0' } as GalileoProjectMoveCtx;
  
  expect(ChooseInitialResources(moveCtx, 0)).toBe(INVALID_MOVE);
});

it ('should choose a resource', () => {
  const G = {
    initialResources: [
      makeRoboticProjectCard(3, 1, 2, 2),
      makeRoboticProjectCard(4, 2, 1, 1),
    ] as RoboticProjectCard[],
    players: { '0': makePlayer('0') } as { [key: string]: Player },
  } as GalileoProjectGameState;

  const playerID = '0';
  const moveCtx = { G, playerID } as GalileoProjectMoveCtx;
  
  ChooseInitialResources(moveCtx, 1);
  expect(G.players[playerID].energy).toBe(1);
  expect(G.players[playerID].megacredits).toBe(2);
});