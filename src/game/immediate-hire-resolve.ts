import { INVALID_MOVE } from "boardgame.io/dist/types/packages/core";
import { gainEnergy, gainCredits, gainInfluence, processMoonResult } from "./game-utils";
import { increaseTwoRobots } from "./levels";
import { GalileoProjectGameState, GalileoProjectMoveCtx, RobotType, Moon, DiscardCharacterCtx, KeepCharacterCtx } from "./model";
import { RobotSelection, roboticProjectComplete, acquireCompletedProject, assignTypeToRobot, assignMoonToRobot } from "./robot";
import { peek } from "./utils";
import { robotAbilityStage, nextStage } from "./game";



const ImmediateMnDiatExpi = (moveCtx: GalileoProjectMoveCtx, robot: RobotSelection | null) => {
  const { G, events } = moveCtx;
};

const ImmediateMnEliotBan = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  gainEnergy(G, player, 1);
  events.setStage(nextStage(G));
};

const ImmediateMnHunterPerks = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, events } = moveCtx;
};

const ImmediateMnIlaZoe = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, events } = moveCtx;
};

const ImmediateMnLeonardSimon = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, events } = moveCtx;
};

const ImmediateMnMilutinMadic = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  gainCredits(G, player, 2);
  events.setStage(nextStage(G));
};

const ImmediateMsChau = (moveCtx: GalileoProjectMoveCtx, robot1: RobotSelection | null, robot2: RobotSelection | null) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  const moonResult = increaseTwoRobots(G, player, robot1, robot2);
  if (!moonResult) {
    return INVALID_MOVE;
  }

  const nonEnergyResult = processEnergy(G, player, moonResult);
  nonEnergyResult.forEach(r => {
    if (r === 'UpdateRoboticProject') {
      G.actionCtx.push({ kind: 'placeModifier' });
    }
  }); 
  events.setStage(nextStage(G));
};

const ImmediateMsLee = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  gainInfluence(G, player, 3);
  events.setStage(nextStage(G));
};

const ImmediateNakkia = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, events } = moveCtx;
};

const ImmediateNoor = (moveCtx: GalileoProjectMoveCtx, robotSelection: RobotSelection | null, moon: Moon) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
 
  const moonResult = assignMoonToRobot(G, player, robotSelection, moon);
  if (!moonResult) {
    return INVALID_MOVE;
  }
  processMoonResult(G, player, moonResult);
  
  let next: string;
  if (player.roboticProject && roboticProjectComplete(player.roboticProject)) {
    acquireCompletedProject(G, player);
    next = robotAbilityStage(G);
  } else {
    next = nextStage(G);
  }
  events.setStage(next);
}

const ImmediateMartySimon = (moveCtx: GalileoProjectMoveCtx, type: RobotType, robotSelection: RobotSelection | null) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!assignTypeToRobot(G, player, type, robotSelection)) {
    return INVALID_MOVE;
  }

  let next: string;
  if (player.roboticProject && roboticProjectComplete(player.roboticProject)) {
    acquireCompletedProject(G, player);
    next = robotAbilityStage(G);
  } else {
    next = nextStage(G);
  }
  events.setStage(next);
};

const ImmediateTarakFreeman = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  gainCredits(G, player, 1);
  events.setStage(nextStage(G));
};
