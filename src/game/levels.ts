import { gainCredits, gainInfluence, moonLevel } from "./game-utils";
import { GalileoProjectGameState, RobotLevel, Player, RobotInPlay, Moon } from "./model";
import { RobotSelection, findRobot, selectRobot } from "./robot";

// a list of thing you may still have to do after moving robot levels
// for now all you can do is update your ropbotic project
export type MoonLevelResolution = 'UpdateRoboticProject' | 'GainEnergy';
export type MoonLevelChangeResult = MoonLevelResolution[] | false;

export const GAIN_MEGACREDIT = 0;
export const GAIN_INFLUENCE = 1;
export const INCREASE_LEVEL = 2;
export type HunterBonus = 0 | 1 | 2;
export function applyHunterPerksBonuses(G: GalileoProjectGameState, player: Player, bonuses: HunterBonus[], robotSelection?: RobotSelection|null): MoonLevelChangeResult {
  const maxBonusCount = Math.min(player.technologies.length, 3);
  if (bonuses.length > maxBonusCount) {
    return false;
  }

  const set = new Set(bonuses);
  if (set.size < bonuses.length) {
    // some bonues appeared twice
    return false;
  }

  let result: MoonLevelChangeResult = [];
  bonuses.forEach(b => {
    if (b === GAIN_MEGACREDIT) {
      if (!gainCredits(G, player, 1)) {
        return false;
      }
    } else if (b === GAIN_INFLUENCE) {
      if (gainInfluence(G, player, 2)) {
        return false;
      }
    } else if (b === INCREASE_LEVEL) {
      if (robotSelection !== undefined) {
        result = incrementLevel(G, player, robotSelection, 1);
      } else {
        return false;
      }
    }
  });

  return result;
}

/**
 * Hire Nakkia (or part of Leonard Simon)
 * 
 * Move a robot to another moon (must have a double moon assignement), then increase level by 1
 * 
 * @param G
 * @param player 
 * @param robot 
 * @returns 
 */
export function moveRobotThenIncrease(G: GalileoProjectGameState, player: Player, robotSelection: RobotSelection): MoonLevelChangeResult {
  const robot = selectRobot(player, robotSelection);

  if (!robot.moon2) {
    // can only move robot with double assignment
    return false;
  }

  const destMoon = robot.moon1 || robot.moon2;
 
  const result1 = moveRobotToMoon(player, robot, destMoon);
  if (!result1) {
    return result1;
  }

  const result2 = changeLevelRobot(G, player, robot, 1);
  if (!result2) {
    return result2;
  }

  return [...result1, ...result2];
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

/**
 * This can only be done on a deployed robot with a double moon assignment
 * This can result in several "extra" actions after the move, since two moon
 * levels are being manipulated.
 * 
 * @param G 
 * @param player 
 * @param robot 
 * @param destMoon 
 * @returns 
 */
export function moveRobotToMoon(player: Player, robot: RobotInPlay, destMoon: Moon): MoonLevelChangeResult {
  if (!robot.moon2) {
    return false;
  }

  const fromMoon = findRobot(player, robot)!;
  const startMoonLevel = moonLevel(player, fromMoon);
  const index = player.moons[fromMoon].indexOf(robot);
  if (index > -1) {
    player.moonAssignemnts.splice(index, 1);
  }
  const endMoonLevel = moonLevel(player, fromMoon);
  const fromResult = calculateMoonMarkers(startMoonLevel, endMoonLevel, fromMoon);
  const destResult = placeRobotOnMoon(player, robot, destMoon);
  if (!destResult) {
    return false;
  }
 
  return [...fromResult, ...destResult];
}

export function placeRobotOnMoon(player: Player, robot: RobotInPlay, moon: Moon): MoonLevelChangeResult  {
  if (robot.moon1 !== moon && robot.moon2 !== moon) {
    return false;
  }
  const startMoonLevel = moonLevel(player, moon);
  player.moons[moon].push(robot);
  const endMoonLevel = moonLevel(player, moon);
  
  return calculateMoonMarkers(startMoonLevel, endMoonLevel, moon)
}

function changeLevelRobot(G: GalileoProjectGameState, player: Player, robot: RobotInPlay, newLevel: number): MoonLevelChangeResult {
  const moon = findRobot(player, robot);
  if (!moon) {
    return false;
  }

  const startMoonLevel = moonLevel(player, moon);
  adjustLevel(G, robot, Math.min(newLevel, 6));
  const endMoonLevel = moonLevel(player, moon);

  return calculateMoonMarkers(startMoonLevel, endMoonLevel, moon);
}

function changeLevelProject(G: GalileoProjectGameState, player: Player, newLevel: number): boolean {
  const project = player.roboticProject;
  if (!project) {
    return false;
  }

  return adjustLevel(G, project, Math.min(newLevel, 6));
}

/**
 * No state change made here, just checking what special markers exist between the start and end levels
 * 
 * @param startMoonLevel 
 * @param endMoonLevel 
 * @param moon 
 * @returns 
 */
function calculateMoonMarkers(startMoonLevel: number, endMoonLevel: number, moon: Moon): MoonLevelResolution[] {
  if (moon !== 'Callisto' && moon !== 'Europa') {
    return [];
  }

  const [smaller, bigger] = 
     startMoonLevel < endMoonLevel ? [startMoonLevel, endMoonLevel] : [endMoonLevel, startMoonLevel];
  
  if (smaller === bigger) {
    return [];
  }

  if (moon === 'Callisto') {
    const matched = [2, 7, 12].filter(p => p > smaller && p <= bigger).length;
    return (Array(matched) as MoonLevelResolution[]).fill('UpdateRoboticProject');
  } else {
    // Europa
    const matched = [3, 6, 9].filter(p => p > smaller && p <= bigger).length;
    return (Array(matched) as MoonLevelResolution[]).fill('GainEnergy');
  }
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