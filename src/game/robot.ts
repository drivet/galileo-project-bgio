import _ from "lodash";
import { countRobots, gainCredits, gainEnergy, gainInfluence, moonLevel, payCredits } from "./game-utils";
import { GalileoProjectGameState, Player, Moon, RobotInPlay, RobotCard, RobotType, PlaceRobotCtx, RoboticProjectCard, moons } from "./model";
import { peek, takeTop, takeTopN } from "./utils";
import { changeLevelRobot } from "./levels";

// a list of thing you may still have to do after moving robot levels
// for now all you can do is update your ropbotic project
export type MoonLevelResolution = 'UpdateRoboticProject' | 'GainEnergy';
export type MoonLevelChangeResult = MoonLevelResolution[] | false;

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
    kind: 'robotToPlace',
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
    kind: 'robotToPlace',
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
 * Part of the Robotic Sequence develop effect.  Pick the top 4 robot cards and place
 * them into the player's hand.
 * 
 * @param G 
 * @param player 
 */
export function resolveRoboticSequencingPick4(G: GalileoProjectGameState, player: Player) {
  player.pick4Robots = takeTopN(G.secret.robotDeck, 4);
}

/**
 * Move chosen robot (from 4 cards) into play as if acquired.
 * Return rest to robot deck.
 * 
 * @param G 
 * @param player 
 * @param robot 
 * @returns 
 */
export function resolveRoboticSequencingChoose(G: GalileoProjectGameState, player: Player, index: number): boolean {
  if (!player.pick4Robots) {
    return false;
  }

  const robot = player.pick4Robots[index];

  if (!player.pick4Robots.includes(robot)) {
    return false;
  }

  player.pick4Robots.splice(index, 1);
  G.secret.robotDeck.push(...player.pick4Robots);
  player.pick4Robots = undefined;
  G.actionCtx.push({
    kind: 'robotToPlace',
    robotToPlace: robot,
  });
  return true;
}

/**
 * Resolve the automated assembly tech by making a whole new robotic
 * project and entering it into play as if acquired.
 * 
 * Might do NOTHING if we are out of Project cards
 * 
 * @param G 
 * @param player 
 * @param modifier 
 * @param moon 
 * @returns 
 */
export function resolveAutomatedAssembly(G: GalileoProjectGameState, player: Player, modifier?: RobotType, moon?: Moon): boolean  {
  if ((!modifier && moon) || (!moon && modifier)) {
    // Both moon and modifier must be defined, or neither of them
    return false;
  }

  if (!modifier && !moon && player.robotModifiers.length > 0 && player.moonAssignemnts.length > 0) {
    // player did not supply moon or modifier, but they have them.  Inavlid.
    return false;
  }
  
  if (G.secret.roboticProjectCards.length === 0 || !modifier || !moon) {
    // No projects left, or player has no moons or modifiers left
    // Not an invalid move, just can't do anything
    return true;
  }

  if (!player.robotModifiers.includes(modifier) || !player.moonAssignemnts.includes(moon)) {
    // player doesn't have either the moon or the modifier
    return false;
  }

  const newProject = takeTop(G.secret.roboticProjectCards);
  if (!newProject) {
    return true;
  }
  newProject.moon1 = moon;
  newProject.type = modifier;
  const robotInPlay: RobotInPlay = {
    type: newProject.type!,
    typeModified: true,
    moon1: moon,
    moon2: null,
    level: newProject.level,
    baseLevel: newProject.baseLevel,
  };

  G.actionCtx.push({
    kind: 'robotToPlace',
    robotToPlace: robotInPlay,
  });
  return true;
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
  if (!action || action.kind !== 'robotToPlace') {
    return false;
  }
  const robot = (G.actionCtx.pop() as PlaceRobotCtx).robotToPlace;
  return placeRobotOnMoon(player, robot, moon);
}


export function resolveMinerAbility(G: GalileoProjectGameState, player: Player): boolean {
  const total = countRobots(player, 'Miner') + 1;
  gainCredits(G, player, total);
  return true;
}

export function resolveStarZA1(G: GalileoProjectGameState, player: Player): boolean {
  return gainEnergy(G, player, 1);
}

export function resolveStarZA2(G: GalileoProjectGameState, player: Player): boolean {
  return gainInfluence(G, player, 3);
}

export function resolveStarZA4(G: GalileoProjectGameState, player: Player): boolean {
  return gainCredits(G, player, 2);
}

export function resolveStarZB1(G: GalileoProjectGameState, player: Player): boolean {
  return gainEnergy(G, player, 1);
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

  payCredits(G, player, 1);
  gainEnergy(G, player, 1);

  if (!robot) {
    // no wish to move a robot
    return [];
  }

  return moveRobotToMoon(player, robot, robotSelection!.moon === robot.moon1 ? robot.moon2! : robot.moon1);
}

/**
 * Hire Nakkia.
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
function moveRobotToMoon(player: Player, robot: RobotInPlay, destMoon: Moon): MoonLevelChangeResult {
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

function placeRobotOnMoon(player: Player, robot: RobotInPlay, moon: Moon): MoonLevelChangeResult  {
  if (robot.moon1 !== moon && robot.moon2 !== moon) {
    return false;
  }
  const startMoonLevel = moonLevel(player, moon);
  player.moons[moon].push(robot);
  const endMoonLevel = moonLevel(player, moon);
  
  return calculateMoonMarkers(startMoonLevel, endMoonLevel, moon)
}


/**
 * No state change made here, just checking what special markers exist between the start and end levels
 * 
 * @param startMoonLevel 
 * @param endMoonLevel 
 * @param moon 
 * @returns 
 */
export function calculateMoonMarkers(startMoonLevel: number, endMoonLevel: number, moon: Moon): MoonLevelResolution[] {
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