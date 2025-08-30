import { INVALID_MOVE } from 'boardgame.io/core';

import { nextStage, resolveRobotStage } from './game';
import { gainCredits, gainEnergy, gainInfluence, processMoonResult } from './game-utils';
import {
  applyHunterPerksBonuses,
  increaseTwoRobots,
  incrementLevel,
  lowerThenIncreaseRobots,
  moveRobotThenIncrease,
} from './levels';
import { GalileoProjectMoveCtx, Moon, RobotType } from './model';
import {
  acquireCompletedProject,
  assignMoonToRobot,
  assignTypeToRobot,
  buyEnergyThenMove,
  roboticProjectComplete,
  RobotSelection,
} from './robot';

export const ImmediateMsChau = (
  moveCtx: GalileoProjectMoveCtx,
  robot1: RobotSelection | null,
  robot2: RobotSelection | null,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  const result = increaseTwoRobots(G, player, robot1, robot2);
  if (!result) {
    return INVALID_MOVE;
  }
  processMoonResult(G, player, result);
  events.setStage(nextStage(G));
};

export const ImmediateMnDiatExpi = (
  moveCtx: GalileoProjectMoveCtx,
  robot: RobotSelection | null,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  const result = incrementLevel(G, player, robot, 1);
  if (!result) {
    return INVALID_MOVE;
  }
  processMoonResult(G, player, result);
  events.setStage(nextStage(G));
};

export const ImmediateMnMilutinMadic = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  if (gainEnergy(G, player, 1)) {
    return INVALID_MOVE;
  }
  events.setStage(nextStage(G));
};

export const GAIN_MEGACREDIT = 0;
export const GAIN_INFLUENCE = 1;
export const INCREASE_LEVEL = 2;
export type HunterBonus = 0 | 1 | 2;
export const ImmediateMnHunterPerks = (
  moveCtx: GalileoProjectMoveCtx,
  bonuses: HunterBonus[],
  robotSelection?: RobotSelection | null,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  const result = applyHunterPerksBonuses(G, player, bonuses, robotSelection);
  if (!result) {
    return INVALID_MOVE;
  }
  processMoonResult(G, player, result);
  events.setStage(nextStage(G));
};

export const ImmediateMnEliotBan = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  if (!gainCredits(G, player, 2)) {
    return INVALID_MOVE;
  }
  events.setStage(nextStage(G));
};

export const ImmediateTarakFreeman = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  if (gainCredits(G, player, 1)) {
    return INVALID_MOVE;
  }
  events.setStage(nextStage(G));
};

export const ImmediateNoor = (
  moveCtx: GalileoProjectMoveCtx,
  robotSelection: RobotSelection | null,
  moon: Moon,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  const result = assignMoonToRobot(G, player, robotSelection, moon);
  if (!result) {
    return INVALID_MOVE;
  }
  processMoonResult(G, player, result);

  let next: string;
  if (player.roboticProject && roboticProjectComplete(player.roboticProject)) {
    acquireCompletedProject(G, player);
    next = resolveRobotStage(G);
  } else {
    next = nextStage(G);
  }
  events.setStage(next);
};

export const ImmediateMnIlaZoe = (
  moveCtx: GalileoProjectMoveCtx,
  robot1: RobotSelection | null,
  robot2: RobotSelection | null,
  level: number,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  const result = lowerThenIncreaseRobots(G, player, robot1, robot2, level);
  if (!result) {
    return INVALID_MOVE;
  }
  processMoonResult(G, player, result);
  events.setStage(nextStage(G));
};

export const ImmediateMartySimon = (
  moveCtx: GalileoProjectMoveCtx,
  type: RobotType,
  robotSelection: RobotSelection | null,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!assignTypeToRobot(G, player, type, robotSelection)) {
    return INVALID_MOVE;
  }

  let next: string;
  if (player.roboticProject && roboticProjectComplete(player.roboticProject)) {
    acquireCompletedProject(G, player);
    next = resolveRobotStage(G);
  } else {
    next = nextStage(G);
  }
  events.setStage(next);
};

export const ImmediateMsLee = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  if (!gainInfluence(G, player, 3)) {
    return INVALID_MOVE;
  }
  events.setStage(nextStage(G));
};

export const ImmediateNakkia = (moveCtx: GalileoProjectMoveCtx, robotSelection: RobotSelection) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  const result = moveRobotThenIncrease(G, player, robotSelection);
  if (!result) {
    return INVALID_MOVE;
  }
  processMoonResult(G, player, result);
  events.setStage(nextStage(G));
};

export const ImmediateMnLeonardSimon = (
  moveCtx: GalileoProjectMoveCtx,
  robotSelection: RobotSelection,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  const result = buyEnergyThenMove(G, player, robotSelection);
  if (!result) {
    return INVALID_MOVE;
  }
  processMoonResult(G, player, result);
  events.setStage(nextStage(G));
};
