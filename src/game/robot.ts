import _ from "lodash";
import { gainEnergy, moonLevel, payCredits } from "./game-utils";
import { GalileoProjectGameState, Player, Moon, RobotInPlay, RobotCard, RobotType, PlaceRobotCtx, RoboticProjectCard, moons } from "./model";
import { peek, takeTop } from "./utils";
import { MoonLevelChangeResult, moveRobotToMoon, placeRobotOnMoon } from "./levels";


/**
 * Use this to select a robot in your moon pile.
 */
export interface RobotSelection {
  moon: Moon;
  index: number;
}

/**
 * "Buy" a robot from the sales area with influence.
 * 
 * @param G 
 * @param player 
 * @param index 
 */
export function acquireRobot(G: GalileoProjectGameState, player: Player, index: number, moon: Moon, lowerCost: boolean): boolean {
  if (index < 0 || index > 4) {
    return false;
  }
  const robot = G.robotsForSale[index];
  if (robot === null) {
    return false;
  }

  if (player.influence > 0 && robot.track !== player.track) {
    return false;
  }

  const ioLevel = moonLevel(player, 'Io');
  if ((ioLevel === 0 && lowerCost) || 
      (ioLevel > 0 && lowerCost && player.megacredits < 2)) {
    return false;
  }

  if (moon !== robot.moon1 && moon !== robot.moon2) {
    return false;
  }

  let cost = adjustRobotCost(robot, index);
  if (lowerCost) {
    const ioDiscount = getIoDiscount(ioLevel);
    if (ioDiscount > 0 && player.influence < (cost - ioDiscount)) {
      return false;
    }

    payCredits(G, player, 2);
    cost = (ioDiscount < 0) ? 0 : cost -= ioDiscount;
  }

  player.influence -= cost;
  G.actionCtx.push({
    stage: 'PlaceRobot',
    robotToPlace: robot,
  });
  G.robotsForSale[index] = null;
  return true;
}

/**
 * Move a robot project into play as if you bought it
 * 
 * @param G 
 * @param player 
 * @returns 
 */
export function acquireCompletedProject(G: GalileoProjectGameState, player: Player): boolean {
  if (!player.roboticProject || !roboticProjectComplete(player.roboticProject)) {
    return false;
  }
  const roboticProject = player.roboticProject!;
 
  const moon = roboticProject.moon1!;
  const robotInPlay: RobotInPlay = {
    type: roboticProject.type!,
    typeModified: true,
    moon1: moon,
    moon2: null,
    level: roboticProject.level,
    baseLevel: roboticProject.baseLevel,
  };
  player.roboticProject = undefined;
 
  G.actionCtx.push({
    stage: 'PlaceRobot',
    robotToPlace: robotInPlay,
  });
  return true; 
}

/**
 * Only robot project cards should work here
 * @param robot 
 * @returns 
 */
export function roboticProjectComplete(robot: RoboticProjectCard | undefined): boolean {
  return !!(robot && robot.type && robot.moon1);
}

/**
 * Move an acquied robot to a moon.  Changes Level of the moon.
 * 
 * Must be called after the acquire stage of a robot or project,
 * after the ability has been resolved.
 * 
 * @param G 
 * @param player 
 * @param moon 
 * @returns 
 */
export function deployRobotToMoon(G: GalileoProjectGameState, player: Player, moon: Moon): MoonLevelChangeResult {
  const action = peek(G.actionCtx);
  if (!action || action.stage !== 'PlaceRobot') {
    return false;
  }
  const robot = (G.actionCtx.pop() as PlaceRobotCtx).robotToPlace;
  return placeRobotOnMoon(player, robot, moon);
}

/**
 * Hire Marty Simon, or when Callisto lets you
 * 
 * @param G 
 * @param player 
 * @param type 
 * @returns 
 */
export function assignTypeToRobot(G: GalileoProjectGameState, player: Player, type: RobotType, robotSelection: RobotSelection | null): boolean {
  const modifierIndex = player.robotModifiers.indexOf(type);
  if (modifierIndex === -1) {
    // player doesn't have the type
    return false;
  }

  if (robotSelection) {
    const robot = player.moons[robotSelection.moon][robotSelection.index];
    if (robot.typeModified) {
      // robot is already modified
      return false;
    }
    player.robotModifiers.splice(modifierIndex, 1);
    robot.type = type;
    robot.typeModified = true;
  } else {
    if (!player.roboticProject) {
      player.roboticProject = takeTop(G.secret.roboticProjectCards);
    }
  
    if (player.roboticProject) {
      player.roboticProject.type = type;
      player.robotModifiers.splice(modifierIndex, 1);
    }
  }
  return true;
}

/**
 * Hire Noor, or when Callisto lets you
 * Pick a robot (moon, index) that has a double assignment, and if it has a free slot, add the moonMarker
 * 
 * @param G 
 * @param player 
 * @param robot 
 * @param moon 
 * @returns 
 */
export function assignMoonToRobot(G: GalileoProjectGameState, player: Player, robotSelection: RobotSelection | null, moonMarker: Moon): MoonLevelChangeResult {
  const moonMarkerIndex = player.moonAssignemnts.indexOf(moonMarker);
  if (moonMarkerIndex === -1) {
    return false
  }

  if (robotSelection) {
    const robot = player.moons[robotSelection.moon][robotSelection.index]; 
    if (robot.moon1 === moonMarker) {
      return false;
    }

    if (robot.moon2) {
      // robot doesn't have a spare moon space
      return false;
    }

    robot.moon2 = moonMarker;
    player.moonAssignemnts.splice(moonMarkerIndex, 1);

    // move robot
    return moveRobotToMoon(player, robot, moonMarker);
  } else {
    if (!player.roboticProject) {
      player.roboticProject = takeTop(G.secret.roboticProjectCards);
    }

    if (player.roboticProject) {
      player.roboticProject.moon1 = moonMarker;
      player.moonAssignemnts.splice(moonMarkerIndex, 1);
    }
    return [];
  }
}


/**
 * Hire Leonard Simon
 * You can buy 1 energy for 1 megacredit and then move a robot *if you wish*,
 * hence the optional robot.
 * 
 * @param G 
 * @param player 
 * @param robot 
 * @returns 
 */
export function buyEnergyThenMove(G: GalileoProjectGameState, player: Player, robotSelection?: RobotSelection): MoonLevelChangeResult {
  const robot = robotSelection ? selectRobot(player, robotSelection) : undefined;

  if (robot && !robot.moon2) {
    return false;
  }

  if (player.megacredits > 1) {
    payCredits(G, player, 1);
    gainEnergy(G, player, 1);
  }
  if (!robot) {
    // no wish to move a robot
    return [];
  }

  return moveRobotToMoon(player, robot, robotSelection!.moon === robot.moon1 ? robot.moon2! : robot.moon1);
}

function adjustRobotCost(card: RobotCard, index: number): number {
  if (index < 2) {
    return card.baseCost;
  } else if (index === 2) {
    return card.baseCost + 1;
  } else if (index === 3) {
    return card.baseCost + 2;
  } else {
    return card.baseCost + 3;
  }
}

function getIoDiscount(level: number): number {
  if (level === 0) {
    return 0;
  } else if (level >=1 && level <= 3) {
    return 1;
  } else if (level >= 4 && level <= 6) {
    return 2
  } else if (level >= 7 && level <= 9) {
    return 3;
  } else if (level >= 10 && level <= 12) {
    return 4;
  } else {
    return -1;
  }
}

export function findRobot(player: Player, robot: RobotInPlay): Moon | undefined {
  for(const m of moons) {
    if (_.includes(player.moons[m], robot)) {
      return m;
    }
  }
  return undefined;
}

function isRoboticProject(robot: RoboticProjectCard | RobotCard | RobotInPlay): boolean {
  return 'energy' in robot;
}

export function selectRobot(player: Player, robotSelection: RobotSelection): RobotInPlay {
  return player.moons[robotSelection.moon][robotSelection.index];
}