import { PlayerID } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';

import { ChooseInitialResources, EndIf, OnEnd } from './init-resources';
import {
  GalileoProjectFnCtx,
  GalileoProjectGameState,
  GalileoProjectMoveCtx,
  Player,
  RoboticProjectCard,
} from './model';

function makeRoboticProjectCard(
  influence: number,
  megacredits: number,
  energy: number,
  level: number,
): RoboticProjectCard {
  return { influence, megacredits, energy, level, baseLevel: level };
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
    moonAssignemnts: ['Callisto', 'Europa', 'Ganymede', 'Io'],
    robotModifiers: ['Builder', 'Miner', 'StarZ', 'Technician'],

    moons: {
      Callisto: [],
      Europa: [],
      Ganymede: [],
      Io: [],
    },
    technologies: [],
  };
}

it('should fail to choose a resource', () => {
  const G = {
    initialResources: [
      makeRoboticProjectCard(3, 1, 2, 2),
      makeRoboticProjectCard(4, 2, 1, 1),
    ] as RoboticProjectCard[],
  } as GalileoProjectGameState;

  const moveCtx = { G, playerID: '0' } as GalileoProjectMoveCtx;

  expect(ChooseInitialResources(moveCtx, 2)).toBe(INVALID_MOVE);
});

it('should choose a resource', () => {
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

it('should end phase if one card left', () => {
  const G = {
    initialResources: [makeRoboticProjectCard(3, 1, 2, 2)] as RoboticProjectCard[],
  } as GalileoProjectGameState;

  const fnCtx = { G } as GalileoProjectFnCtx;
  expect(EndIf(fnCtx)).toBe(true);
});

it('should not end phase if more than one card left', () => {
  const G = {
    initialResources: [
      makeRoboticProjectCard(3, 1, 2, 2),
      makeRoboticProjectCard(4, 2, 1, 1),
    ] as RoboticProjectCard[],
  } as GalileoProjectGameState;

  const fnCtx = { G } as GalileoProjectFnCtx;
  expect(EndIf(fnCtx)).toBe(false);
});

it('should end phase by putting card back', () => {
  const G = {
    initialResources: [makeRoboticProjectCard(3, 1, 2, 2)] as RoboticProjectCard[],
    secret: {
      roboticProjectCards: [makeRoboticProjectCard(4, 2, 1, 1)] as RoboticProjectCard[],
    },
  } as GalileoProjectGameState;

  const fnCtx = { G } as GalileoProjectFnCtx;
  OnEnd(fnCtx);
  expect(G.initialResources.length).toBe(0);
  expect(G.secret.roboticProjectCards.length).toBe(2);
  expect(G.secret.roboticProjectCards[0]).toEqual(makeRoboticProjectCard(3, 1, 2, 2));
});

it('should throw error if ending incorrectly (more than 1 card left)', () => {
  const G = {
    initialResources: [
      makeRoboticProjectCard(3, 1, 2, 2),
      makeRoboticProjectCard(4, 2, 1, 1),
    ] as RoboticProjectCard[],
  } as GalileoProjectGameState;

  const fnCtx = { G } as GalileoProjectFnCtx;
  expect(() => OnEnd(fnCtx)).toThrow();
});

it('should throw error if ending incorrectly (no cards left)', () => {
  const G = {
    initialResources: [] as RoboticProjectCard[],
  } as GalileoProjectGameState;

  const fnCtx = { G } as GalileoProjectFnCtx;
  expect(() => OnEnd(fnCtx)).toThrow();
});
