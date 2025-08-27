import { Game } from 'boardgame.io';

import { discardCharacter, hireCharacter, keepCharacter } from './character';
import { processMoonResult, switchTrack } from './game-utils';
import {
  ImmediateMartySimon,
  ImmediateMnDiatExpi,
  ImmediateMnEliotBan,
  ImmediateMnHunterPerks,
  ImmediateMnIlaZoe,
  ImmediateMnLeonardSimon,
  ImmediateMnMilutinMadic,
  ImmediateMsChau,
  ImmediateMsLee,
  ImmediateNakkia,
  ImmediateNoor,
  ImmediateTarakFreeman,
} from './immediate-hire-resolve';
import { SelectResourcesPhase } from './init-resources';
import {
  CharacterAbility,
  CharacterCard,
  DiscardCharacterCtx,
  GalileoProjectGameState,
  GalileoProjectMoveCtx,
  KeepCharacterCtx,
  KeepTechCtx,
  Moon,
  PlaceRobotCtx,
  RobotType,
  Track,
} from './model';
import { acquireCompletedProject, acquireRobot, assignMoonToRobot, assignTypeToRobot, deployRobotToMoon, roboticProjectComplete, RobotSelection } from './robot';
import {
  resolveBuilderAbility,
  resolveMinerAbility,
  resolveStarZA1,
  resolveStarZA2,
  resolveStarZA3,
  resolveStarZA4,
  resolveStarZA5,
  resolveStarZB1,
  resolveStarZB3,
  resolveStarZB5,
  resolveTechnicianAbility,
} from './robot-ability';
import { setupGame } from './setup';
import {
  developTech,
  keepTech,
  resolveAutomatedAssembly,
  resolveMemoryScanner,
  resolveRoboticSequencingChoose,
  resolveRoboticSequencingPick4,
  resolveSuperconductivity,
  TechDiscount,
} from './technology';
import { peek } from './utils';
import { INVALID_MOVE } from 'boardgame.io/core';

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

const ChooseTrack = (moveCtx: GalileoProjectMoveCtx, track: Track) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  if (player.track !== null || player.influence === 0) {
    return INVALID_MOVE;
  }
  player.track = track;
  events.endStage();
};

const HireCharacter = (
  moveCtx: GalileoProjectMoveCtx,
  index: number,
  ability: CharacterAbility,
  track: Track,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!hireCharacter(G, player, index, ability, track)) {
    return INVALID_MOVE;
  }

  const next =
    ability === 'Immediate' || ability === 'Both' ? immediateAbilityStage(G) : nextStage(G);
  events.setStage(next);
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

const DevelopTechnology = (
  moveCtx: GalileoProjectMoveCtx,
  index: number,
  discount?: TechDiscount,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!developTech(G, player, index, discount)) {
    return INVALID_MOVE;
  }

  events.setStage(resolveTechStage(G));
};

const KeepTech = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!keepTech(G, player)) {
    return INVALID_MOVE;
  }

  events.setStage(nextStage(G));
};

const AcquireRobot = (
  moveCtx: GalileoProjectMoveCtx,
  robotSelection: RobotSelection,
  lowerCost: boolean,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!acquireRobot(G, player, robotSelection.index, robotSelection.moon, lowerCost)) {
    return INVALID_MOVE;
  }

  events.setStage(resolveRobotStage(G));
};

const ResolveSuperconductivity = (
  moveCtx: GalileoProjectMoveCtx,
  robotSelection: RobotSelection | null,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  const result = resolveSuperconductivity(G, player, robotSelection);
  if (!result) {
    return INVALID_MOVE;
  }
  processMoonResult(G, player, result);

  events.setStage(nextStage(G));
};

const RoboticSequencingPick4 = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID } = moveCtx;
  const player = G.players[playerID];
  resolveRoboticSequencingPick4(G, player);
};

const RoboticSequencingChoose = (moveCtx: GalileoProjectMoveCtx, index: number) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!resolveRoboticSequencingChoose(G, player, index)) {
    return INVALID_MOVE;
  }

  events.setStage(resolveRobotStage(G));
};

const ResolveAutomatedAssembly = (
  moveCtx: GalileoProjectMoveCtx,
  modifier?: RobotType,
  moon?: Moon,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!resolveAutomatedAssembly(G, player, modifier, moon)) {
    return INVALID_MOVE;
  }

  if (G.secret.roboticProjectCards.length === 0 || !modifier || !moon) {
    // No projects left, or player has no moons or modifiers left
    // Not an invalid move, just can't do anything
    return;
  }

  events.setStage(resolveRobotStage(G));
};

const ResolveMemoryScanner = (moveCtx: GalileoProjectMoveCtx, index: number) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!resolveMemoryScanner(G, player, index)) {
    return INVALID_MOVE;
  }

  events.setStage(immediateAbilityStage(G));
};

const ResolveBuilder = (
  moveCtx: GalileoProjectMoveCtx,
  index: number,
  ability: CharacterAbility,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!resolveBuilderAbility(G, player, index, ability)) {
    return INVALID_MOVE;
  }
  const next = ability === 'Immediate' ? immediateAbilityStage(G) : nextStage(G);
  events.setStage(next);
};

const ResolveMiner = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!resolveMinerAbility(G, player)) {
    return INVALID_MOVE;
  }
  events.setStage(nextStage(G));
};

const ResolveTechnician = (
  moveCtx: GalileoProjectMoveCtx,
  robotSelection: RobotSelection | null,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  const result = resolveTechnicianAbility(G, player, robotSelection);
  if (!result) {
    return INVALID_MOVE;
  }
  processMoonResult(G, player, result);
  events.setStage(nextStage(G));
};

const ResolveStarZA1 = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  if (!resolveStarZA1(G, player)) {
    return INVALID_MOVE;
  }
  events.setStage(nextStage(G));
};

const ResolveStarZA2 = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!resolveStarZA2(G, player)) {
    return INVALID_MOVE;
  }
  events.setStage(nextStage(G));
};

const ResolveStarZA3 = (moveCtx: GalileoProjectMoveCtx, ability: CharacterAbility) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!resolveStarZA3(G, player, ability)) {
    return INVALID_MOVE;
  }
  const next = ability === 'Immediate' ? immediateAbilityStage(G) : nextStage(G);
  events.setStage(next);
};

const ResolveStarZA4 = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!resolveStarZA4(G, player)) {
    return INVALID_MOVE;
  }
  events.setStage(nextStage(G));
};

const ResolveStarZA5 = (moveCtx: GalileoProjectMoveCtx, robotSelection: RobotSelection | null) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  const result = resolveStarZA5(G, player, robotSelection);
  if (!result) {
    return INVALID_MOVE;
  }
  processMoonResult(G, player, result);
  events.setStage(nextStage(G));
};

const ResolveStarZB1 = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  if (!resolveStarZB1(G, player)) {
    return INVALID_MOVE;
  }
  events.setStage(nextStage(G));
};

const ResolveStarZB2 = (moveCtx: GalileoProjectMoveCtx, robotSelection: RobotSelection | null) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  const result = resolveStarZA5(G, player, robotSelection);
  if (!result) {
    return INVALID_MOVE;
  }
  processMoonResult(G, player, result);
  events.setStage(nextStage(G));
};

const ResolveStarZB3 = (moveCtx: GalileoProjectMoveCtx) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  if (!resolveStarZB3(G, player)) {
    return INVALID_MOVE;
  }
  events.setStage(nextStage(G));
};

const ResolveStarZB4 = (moveCtx: GalileoProjectMoveCtx, index: number, discount: TechDiscount) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  if (!developTech(G, player, index, discount)) {
    return INVALID_MOVE;
  }

  events.setStage(resolveTechStage(G));
};

const ResolveStarZB5 = (moveCtx: GalileoProjectMoveCtx, index: number) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];
  if (!resolveStarZB5(G, player, index)) {
    return INVALID_MOVE;
  }
  events.setStage(nextStage(G));
};

const PlaceRobot = (moveCtx: GalileoProjectMoveCtx, moon: Moon) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  const result = deployRobotToMoon(G, player, moon);
  if (!result) {
    return INVALID_MOVE;
  }

  processMoonResult(G, player, result);
  events.setStage(nextStage(G));
};

const PlaceMoon = (
  moveCtx: GalileoProjectMoveCtx,
  robotSelection: RobotSelection|null,
  moon: Moon
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  const action = peek(G.actionCtx);
  if (!action || action.stage !== 'PlaceModifier') {
    return INVALID_MOVE;
  }
  G.actionCtx.pop();

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

const PlaceType = (
  moveCtx: GalileoProjectMoveCtx,
  type: RobotType,
  robotSelection: RobotSelection | null,
) => {
  const { G, playerID, events } = moveCtx;
  const player = G.players[playerID];

  const action = peek(G.actionCtx);
  if (!action || action.stage !== 'PlaceModifier') {
    return INVALID_MOVE;
  }
  G.actionCtx.pop();

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

export function nextStage(G: GalileoProjectGameState): string {
  const action = peek(G.actionCtx);
  if (!action) {
    // we're done, go on to the goal stage
    return 'ClaimGoal';
  } else {
    return action.stage;
  }
}

export function resolveRobotStage(G: GalileoProjectGameState): string {
  const action = peek(G.actionCtx) as PlaceRobotCtx;
  const robotType = action.robotToPlace.type;
  return 'Resolve' + robotType;
}

export function immediateAbilityStage(G: GalileoProjectGameState): string {
  const action = peek(G.actionCtx) as DiscardCharacterCtx | KeepCharacterCtx;
  const card = action.character;
  return 'Immediate' + card.name;
}

export function resolveTechStage(G: GalileoProjectGameState): string {
  const action = peek(G.actionCtx) as KeepTechCtx;
  const techId = action.techToKeep.techId;
  return techId === 'AutomatedDrilling' || techId === 'EarthMarsHighway' || techId === 'AiClone'
    ? 'KeepTech'
    : 'Resolve' + techId;
}

export const GalileoProjectGame: Game<GalileoProjectGameState> = {
  name: 'GalileoProject',

  setup: ({ ctx, random }) => setupGame(ctx.playOrder, random),

  phases: {
    SelectResources: SelectResourcesPhase,
  },

  turn: {
    onBegin: ({ events }) => {
      events.setActivePlayers({currentPlayer: 'InfluenceSwitch'});
    },

    stages: {
      InfluenceSwitch: {
        moves: {
          SwitchTrack, ChooseTrack,
        },
        next: 'ChooseAction',
      },

      ChooseAction: {
        moves: {
          HireCharacter,
          AcquireRobot,
          DevelopTechnology,
        },
      },
      KeepTech: { moves: { KeepTech } },
      ResolveSuperconductivity: { moves: { ResolveSuperconductivity } },
      ResolveAutomatedAssembly: { moves: { ResolveAutomatedAssembly } },
      ResolveRoboticSequencing: { moves: { RoboticSequencingPick4, RoboticSequencingChoose } },
      ResolveMemoryScanner: { moves: { ResolveMemoryScanner } },

      ResolveBuilder: { moves: { ResolveBuilder } },
      ResolveMiner: { moves: { ResolveMiner } },
      ResolveTechnician: { moves: { ResolveTechnician } },
      ResolveStarZ: {
        moves: {
          ResolveStarZA1,
          ResolveStarZA2,
          ResolveStarZA3,
          ResolveStarZA4,
          ResolveStarZA5,
          ResolveStarZB1,
          ResolveStarZB2,
          ResolveStarZB3,
          ResolveStarZB4,
          ResolveStarZB5,
        },
      },
      PlaceRobot: { moves: { PlaceRobot } },

      KeepCharacter: { moves: { KeepCharacter } },
      DiscardCharacter: { moves: { DiscardCharacter } },

      ImmediateMartySimon: { moves: { ImmediateMartySimon } },
      ImmediateMnDiatExpi: { moves: { ImmediateMnDiatExpi } },
      ImmediateMnEliotBan: { moves: { ImmediateMnEliotBan } },
      ImmediateMnHunterPerks: { moves: { ImmediateMnHunterPerks } },
      ImmediateMnIlaZoe: { moves: { ImmediateMnIlaZoe } },
      ImmediateMnLeonardSimon: { moves: { ImmediateMnLeonardSimon } },
      ImmediateMnMilutinMadic: { moves: { ImmediateMnMilutinMadic } },
      ImmediateMsChau: { moves: { ImmediateMsChau } },
      ImmediateMsLee: { moves: { ImmediateMsLee } },
      ImmediateNakkia: { moves: { ImmediateNakkia } },
      ImmediateNoor: { moves: { ImmediateNoor } },
      ImmediateTarakFreeman: { moves: { ImmediateTarakFreeman } },

      PlaceModifier: { moves: { PlaceMoon, PlaceType } },
    },
  },

  endIf: ({ _G, _ctx }) => {},
};
