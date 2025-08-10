import { countRobots, moonLevel } from "./game-utils";
import { GalileoProjectGameState, RobotLevel, Player, RobotInPlay } from "./model";
import { RobotSelection, MoonLevelChangeResult, calculateMoonMarkers, findRobot, selectRobot } from "./robot";


/**
 * Technician robots are resolved by upping the level of a robot or project
 * of your choice by the number of technicians you have.
 * @param G 
 * @param player 
 * @param robot 
 * @returns 
 */
export function resolveTechnician(G: GalileoProjectGameState, player: Player, robotSelection: RobotSelection | null): MoonLevelChangeResult {
  const total = countRobots(player, 'Technician') + 1;
  return incrementLevel(G, player, robotSelection, total);
}

export function resolveStarZA5(G: GalileoProjectGameState, player: Player, robotSelection: RobotSelection | null): MoonLevelChangeResult {
  return incrementLevel(G, player, robotSelection, 3);
}

export function resolveStarZB2(G: GalileoProjectGameState, player: Player, robotSelection: RobotSelection | null): MoonLevelChangeResult {
  return incrementLevel(G, player, robotSelection, 1);
}

export function resolveSuperconductivity(G: GalileoProjectGameState, player: Player, robotSelection: RobotSelection | null): MoonLevelChangeResult {
  return changeLevel(G, player, robotSelection, 7);
}

export function resolveMnDiatExpi(G: GalileoProjectGameState, player: Player, robotSelection: RobotSelection | null): MoonLevelChangeResult {
  return incrementLevel(G, player, robotSelection, 1);
}

/**
 * Hire Ms Chau
 * 
 * @param G 
 * @param player 
 * @param robot1 
 * @param robot2 
 */
export function increaseTwoRobots(G: GalileoProjectGameState, player: Player, robotSelection1: RobotSelection | null, robotSelection2: RobotSelection | null): MoonLevelChangeResult {
  if (robotSelection1 === robotSelection2) {
    return false;
  }
  if (robotSelection1 && robotSelection2 &&
      (robotSelection1.moon === robotSelection2.moon && 
       robotSelection1.index == robotSelection2.index)) {
    return false;
  }
  const result1 = incrementLevel(G, player, robotSelection1, 1);
  if (!result1) {
    return result1;
  }
  const result2 = incrementLevel(G, player, robotSelection2, 1);
  if (!result2) {
    return result2;
  }

  return [...result1, ...result2];
}

/**
 * Hire Mn Ila Zoe
 * 
 * @param G 
 * @param player 
 * @param robot1 
 * @param robot2 
 * @returns 
 */
export function lowerThenIncreaseRobots(G: GalileoProjectGameState, player: Player, robotSelection1: RobotSelection | null, robotSelection2: RobotSelection | null, level: number): MoonLevelChangeResult {
  if (robotSelection1 === robotSelection2) {
    return false;
  }
  if (robotSelection1 && robotSelection2 &&
      (robotSelection1.moon === robotSelection2.moon && 
       robotSelection1.index == robotSelection2.index)) {
    return false;
  }
  const result1 = incrementLevel(G, player, robotSelection1, -1 * level);
  if (!result1) {
    return result1;
  }
  const result2 = incrementLevel(G, player, robotSelection2, level);
  if (!result2) {
    return result2;
  }

  return [...result1, ...result2];
}

export function incrementLevel(G: GalileoProjectGameState, player: Player, robotSelection: RobotSelection | null, level: number): MoonLevelChangeResult {
  if (robotSelection) {
    const robot = selectRobot(player, robotSelection);
    return changeLevelRobot(G, player, robot, robot.level + level);
  } else {
    return changeLevelProject(G, player, player.roboticProject!.level + level) ? [] : false;
  }
}

export function changeLevel(G: GalileoProjectGameState, player: Player, robotSelection: RobotSelection | null, level: number): MoonLevelChangeResult {
  if (robotSelection) {
    const robot = selectRobot(player, robotSelection);
    return changeLevelRobot(G, player, robot, level);
  } else {
    return changeLevelProject(G, player, level) ? [] : false;
  }
}

export function changeLevelRobot(G: GalileoProjectGameState, player: Player, robot: RobotInPlay, newLevel: number): MoonLevelChangeResult {
  const moon = findRobot(player, robot);
  if (!moon) {
    return false;
  }

  const startMoonLevel = moonLevel(player, moon);
  adjustLevel(G, robot, Math.min(newLevel, 6));
  const endMoonLevel = moonLevel(player, moon);

  return calculateMoonMarkers(startMoonLevel, endMoonLevel, moon);
}

export function changeLevelProject(G: GalileoProjectGameState, player: Player, newLevel: number): boolean {
  const project = player.roboticProject;
  if (!project) {
    return false;
  }

  return adjustLevel(G, project, Math.min(newLevel, 6));
}

/**
 * I'm going to the trouble of adjusting the tokens on the board.
 * But I'm not sure if I really need to do that.
 * 
 * @param G 
 * @param level 
 * @param newLevel 
 * @returns 
 */
function adjustLevel(G: GalileoProjectGameState, level: RobotLevel, newLevel: number): boolean {
  if (level.level != level.baseLevel) {
    // level has been modified, so that means there's a token here.
    // we're going to return the token to the pool
    if (level.level === 1 || level.level === 2) {
      G.levels_1_2++;
    } else if (level.level === 3 || level.level === 4) {
      G.levels_3_4++;
    } else if (level.level === 5 || level.level === 6) {
      G.levels_5_6++;
    } else if (level.level === 7) {
      G.levels_7++;
    } 
    level.level = level.baseLevel;
  }

  if (newLevel != level.baseLevel) {
    // new level requires a token, so take from the pool
    if (newLevel === 1 || newLevel === 2) {
      G.levels_1_2--;
    } else if (newLevel === 3 || newLevel === 4) {
      G.levels_3_4--;
    } else if (newLevel === 5 || newLevel === 6) {
      G.levels_5_6--;
    } else if (newLevel === 7) {
      G.levels_7--;
    } 
  }

  level.level = newLevel;
  return true;
}