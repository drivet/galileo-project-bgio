import { PhaseConfig } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';

import { GalileoProjectFnCtx, GalileoProjectMoveCtx } from './model';

export const ChooseInitialResources = (fnCtx: GalileoProjectMoveCtx, chosenIdx: number) => {
  const { G, playerID } = fnCtx;
  if (!G.initialResources[chosenIdx]) {
    return INVALID_MOVE;
  }
  const player = G.players[playerID];
  const projectCard = G.initialResources[chosenIdx];
  player.roboticProjects.push(projectCard);
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
  const leftOver = G.initialResources.filter((r) => r)[0];
  if (!leftOver) {
    throw new Error('Should have one initial resources left');
  }
  G.initialResources = [];
  G.secret.roboticProjectCards.unshift(leftOver);
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
