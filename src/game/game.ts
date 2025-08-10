import { Game } from 'boardgame.io';

import { SelectResourcesPhase } from './init-resources';
import { PlaceRobotCtx, CharacterAbility, CharacterCard, GalileoProjectGameState, GalileoProjectMoveCtx, Moon, Track, DiscardCharacterCtx, KeepCharacterCtx } from './model';
import { setupGame } from './setup';
import { INVALID_MOVE } from 'boardgame.io/dist/types/packages/core';
import { switchTrack } from './game-utils';
import { discardCharacter, hireCharacter, keepCharacter } from './character';
import { developTech, keepTech, TechDiscount } from './technology';
import { acquireRobot } from './robot';import { peek } from './utils';
import { immediateAbilityStage } from './immediate-hire-resolve';

const SwitchTrack = (moveCtx: GalileoProjectMoveCtx, move: boolean) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (move) {
    if (!switchTrack(G, player)) {
      return INVALID_MOVE;
    }
  }
  events.endStage();
};

export function immediateAbilityStage(G: GalileoProjectGameState): string {
  const action = peek(G.actionCtx) as DiscardCharacterCtx | KeepCharacterCtx;
  const card = action.character;
  return 'Immediate' + card.name;
}

const HireCharacter = (moveCtx: GalileoProjectMoveCtx, index: number, ability: CharacterAbility, track: Track) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!hireCharacter(G, player, index, ability, track)) {
    return INVALID_MOVE;
  }

  events.setStage(immediateAbilityStage(G));
};

const KeepCharacter = (moveCtx: GalileoProjectMoveCtx, characterToFire?: CharacterCard) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!keepCharacter(G, player, characterToFire)) {
    return INVALID_MOVE;
  }

  events.setStage(nextStage(G));
};

const DiscardCharacter = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, events } = moveCtx;

  if (!discardCharacter(G)) {
    return INVALID_MOVE;
  }

  events.setStage(nextStage(G));
};


const DevelopTechnology = (moveCtx: GalileoProjectMoveCtx, index: number, discount?: TechDiscount) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!developTech(G, player, index, discount)) {
    return INVALID_MOVE;
  }
};

const KeepTech = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!keepTech(G, player)) {
    return INVALID_MOVE;
  }

  events.setStage(nextStage(G));
};


const AcquireRobot =  (moveCtx: GalileoProjectMoveCtx, index: number, moon: Moon, lowerCost: boolean) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!acquireRobot(G, player, index, moon, lowerCost)) {
    return INVALID_MOVE;
  }
};


export function nextStage(G: GalileoProjectGameState): string {
  const action = peek(G.actionCtx);
  if (!action) {
    // we're done, go on to the goal stage
    return 'ClaimGoal';
  } else if (action.kind === 'techToKeep') {
    return 'KeepTech';
  } else if (action.kind === 'robotToPlace') {
    return 'PlaceRobot';
  } else if (action.kind === 'discardCharacter') {
    return 'DiscardCharacter';
  } else if (action.kind === 'keepCharacter') {
    return 'KeepCharacter';
  } else {
    return 'PlaceModifier';
  }
}

export function robotAbilityStage(G: GalileoProjectGameState): string {
  const action = peek(G.actionCtx) as PlaceRobotCtx;
  const robotType = action.robotToPlace.type;
  return "Resolve" + robotType;
}

export const GalileoProjectGame: Game<GalileoProjectGameState> = {
  name: 'Galileo Project',

  setup: ({ ctx, random }) => setupGame(ctx.playOrder, random),

  phases: {
    SelectResources: SelectResourcesPhase,
  },

  turn: {
    onBegin: ({ events }) => events.setStage('InfluenceSwitch'),
    
    stages: {
      InfluenceSwitch : {
        moves: {
          SwitchTrack
        },
        next: 'ChooseAction'
      },

      ChooseAction: {
        moves: {
          HireCharacter,
          AcquireRobot,
          DevelopTechnology
        }
      },
      KeepTech: { moves: { KeepTech } },

      KeepCharacter: { moves: { KeepCharacter } },
      DiscardCharacter: { moves: { DiscardCharacter } },

      ImmediateMartySimon: { moves: { AssignTypeToProjectMartySimon, AssignTypeToRobotMartySimon } },
      ImmediateMnDiatExpi: { moves: { ImmediateMnDiatExpi } },
      ImmediateMnEliotBan: { moves: { ImmediateMnEliotBan } },
      ImmediateMnHunterPerks: { moves: { ImmediateMnHunterPerks} },
      ImmediateMnIlaZoe: { moves: { ImmediateMnIlaZoe } },
      ImmediateMnLeonardSimon: { moves: { ImmediateMnLeonardSimon } },
      ImmediateMnMilutinMadic: { moves: { ImmediateMnMilutinMadic } }, 
      ImmediateMsChau: { moves: { ImmediateMsChau } },
      ImmediateMsLee: { moves: { ImmediateMsLee } },
      ImmediateNakkia: { moves: { ImmediateNakkia } }, 
      ImmediateNoor: { moves: { AssignMoonToRobotNoor, AssignMoonToProjectNoor } },
      ImmediateTarakFreeman: { moves: { ImmediateTarakFreeman } },
    }
  },

  endIf: ({ _G, _ctx }) => {},
};

