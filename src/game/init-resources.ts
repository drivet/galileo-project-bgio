import { PhaseConfig } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';

import { GalileoProjectFnCtx, GalileoProjectMoveCtx, RoboticProjectCard } from './model';

export const ChooseInitialResources = (moveCtx: GalileoProjectMoveCtx, chosenIdx: number) => {
  const { G, playerID } = moveCtx;
  if (!G.initialResources[chosenIdx]) {
    return INVALID_MOVE;
  }
  const player = G.players[playerID];
  const projectCard = G.initialResources[chosenIdx];
  player.roboticProject = projectCard;
  G.initialResources[chosenIdx] = null;

  player.energy = projectCard.energy;
  player.megacredits = projectCard.megacredits;
  player.influence = projectCard.influence;
};

export const EndIf = (fnCtx: GalileoProjectFnCtx): boolean => {
  const { G } = fnCtx;
  return G.initialResources.filter((r) => r).length === 1;
};

export const OnEnd = (fnCtx: GalileoProjectFnCtx) => {
  const { G } = fnCtx;
  const leftOvers = G.initialResources.filter((r) => r) as RoboticProjectCard[];
  if (leftOvers.length !== 1) {
    throw new Error('Should have exactly one initial resources left');
  }
  G.initialResources = [];
  G.secret.roboticProjectCards.unshift(leftOvers[0]);
};

export const SelectResourcesPhase: PhaseConfig = {
  start: true,
  turn: {
    minMoves: 1,
    maxMoves: 1,
  },
  moves: {
    ChooseInitialResources,
  },
  endIf: EndIf,
  onEnd: OnEnd,
};
