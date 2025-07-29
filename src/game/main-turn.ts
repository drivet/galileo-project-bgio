import { StageMap, StageConfig } from "boardgame.io";
import { GalileoProjectGameState, GalileoProjectMoveCtx, Moon, Track } from "./model";
import { INVALID_MOVE } from "boardgame.io/core";
import { HireCharacter } from "./hire-character";

export interface BuyRobotMove {
  index: number;

  // Io lets players spend money to lower cost of robot
  megacredits: number;

  // moon to assign robot to
  moon: Moon;
}

export interface DevelopTechMove {
  index: number;
}

export const ChooseTrack = (moveCtx: GalileoProjectMoveCtx, track: Track) => {
  const { G, playerID } = moveCtx;
  const player = G.players[playerID];
  if (player.influence === 0 || player.track ) {
    return INVALID_MOVE;
  }
  player.track = track;
}

export const SwitchTrack = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID } = moveCtx;
  const player = G.players[playerID];
  if (player.influence === 0 || !player.track || player.megacredits === 0) {
     return INVALID_MOVE;
  }
  player.track === 'Earth' ? player.track = 'Mars' : player.track = 'Earth';
  player.megacredits--;
  G.megacredits++;
}


export const BuyRobot = (moveCtx: GalileoProjectMoveCtx, move: BuyRobotMove) => {
}

export const DevelopTech = (moveCtx: GalileoProjectMoveCtx, move: DevelopTechMove) => {
}

const stageMap: StageMap<GalileoProjectGameState> = {
  track: {
    moves: {
      ChooseTrack,
      SwitchTrack,
    },
    next: 'action'
  } as StageConfig<GalileoProjectGameState>,
  
  action: {
    moves: {
      HireCharacter,
      BuyRobot,
      DevelopTech,
    },
    next: 'goal'
  } as StageConfig<GalileoProjectGameState>,

  resolveImmediateHire: {
    moves: {
      ResolveImmediate,
      IncreaseRobotsByOne,
      LowerAndIncreaseRobot,
      PlaceMoonAssignment,
      PlaceRobotModifier,
      MoveDoubleMoonAndIncrease,
      TradeEnergyAndMoveDoubleMoon,
      ApplyBonuses,
    }
  } as StageConfig<GalileoProjectGameState>,

  goal: { 
    moves: {
    }
  } as StageConfig<GalileoProjectGameState>,
}