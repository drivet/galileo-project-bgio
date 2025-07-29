import _ from "lodash";
import { CharacterAbility, CharacterCard, GalileoProjectGameState, Moon, moons, Player, RoboticProjectCard, RobotInPlay, RobotLevel as RobotLevels, RobotType, Track } from "./model";
import { takeTop } from "./utils";


// a list of thing you may still have to do after moving robot levels
// for now all you can do is update your ropbotic project
export type MoonLevelResolution = 'UpdateRoboticProject';

// export type MoonLevelChangeResult = boolean | MoonLevelResolution[];

export type Result<V, E = string> = 
  { ok: true; value: V } | 
  { ok: false; error: E }

function value<V>(value: V): {ok: true, value: V} {
  return { ok: true, value }
}

function error<E>(e: E): Result<never, E> {
  return { ok: false, error: e }
}

export type MoonLevelChangeResult = Result<MoonLevelResolution[], string>;

export function switchTrack(G: GalileoProjectGameState, player: Player): boolean {
  if (player.megacredits === 0 || !player.track) {
    return false;
  }

  if (player.track === 'Earth') {
    player.track = 'Mars';
  } else {
    player.track = 'Earth'
  }
  player.megacredits--;
  G.megacredits++;

  if (player.technologies.map(t => t.techId).includes("EarthMarsHighway") && !player.usedEarthMarsHighWay) {
    gainInfluence(G, player, 2);
    player.usedEarthMarsHighWay = true;
  }
  return true;
}

export function gainCredits(G: GalileoProjectGameState, player: Player, megacredits: number): boolean {
  if (megacredits <= 0) {
    return false;
  }

  let receive: number;
  if (player.technologies.map(t => t.techId).includes('AutomatedDrilling') && !player.usedAutomtaedDrilling) {
    receive = megacredits + 1;
    player.usedAutomtaedDrilling = true;
  } else {
    receive = megacredits;
  }
  const give = Math.min(receive, 10 - player.megacredits);
  G.megacredits -= give;
  player.megacredits += give;
  return true;
}

export function gainEnergy(G: GalileoProjectGameState, player: Player, energy: number) {
  const give = Math.min(energy, 5 - player.energy);
  G.energy -= give;
  player.energy += give;
}

export function gainInfluence(G: GalileoProjectGameState, player: Player, influence: number) {
  if (player.influence === 10) {
    return;
  }

  if ((player.influence + influence) > 10) {
    player.influence += Math.min(influence, 10 - player.influence);
    gainCredits(G, player, 1);
  } else {
    player.influence += influence;
  }
}

export function moonLevel(player: Player, moon: Moon): number {
  let level = 0;
  player.moons[moon].forEach(c => level += c.level);
  return level;
}

/**
 * One of the basic actions of the game
 * 
 * @param G 
 * @param player 
 * @param index 
 * @param ability 
 * @param track 
 * @returns 
 */

export function hireCharacter(G: GalileoProjectGameState, player: Player, index: number, ability: CharacterAbility, track: Track | undefined): boolean {
  if (!validateHire(G, player, index, track)) {
    return false;
  }

  const card = G.charactersForHire[index];
  const influenceGained = adjustCharacterInfluence(card, index);
  gainInfluence(G, player, influenceGained);
  gainCredits(G, player, card.megacredits);

  G.hireCharacterCtx = {
    characterToHire: card,
    ability: resolveCharacterAbility(card, player, ability, track),
  }
  return true;
}

/**
 * Do this when you hire Noor, or when Callisto lets you
 * 
 * @param G 
 * @param player 
 * @param moon 
 * 
 * @returns true if there's nothing to do, 
 *   false if there's an invalid state, 
 *   ContinueAction if there's still something to resolve
 */
export function assignMoonToRoboticProject(G: GalileoProjectGameState, player: Player, moon: Moon): MoonLevelChangeResult {
  const index = player.moonAssignemnts.indexOf(moon);
  if (index === -1) {
    // player doesn't have the moon passed in
    return error(`Player ${player.playerID} doesn't have moon ${moon} modifier`);
  }

  if (!player.roboticProject) {
    player.roboticProject = takeTop(G.secret.roboticProjectCards);
  }
  player.roboticProject.moon1 = moon;
  player.moonAssignemnts.splice(index, 1);

  return processRoboticProject(G, player);
}

/**
 * Do this when you hire Marty Simon, or when Callisto lets you
 * 
 * @param G 
 * @param player 
 * @param type 
 * @returns 
 */
export function assignTypeToRoboticProject(G: GalileoProjectGameState, player: Player, type: RobotType): MoonLevelChangeResult {
  const index = player.robotModifiers.indexOf(type);
  if (index === -1) {
    // player doesn't have the type
    return error(`Player ${player.playerID} doesn't have robot modifier ${type}`);
  }

  if (!player.roboticProject) {
    player.roboticProject = takeTop(G.secret.roboticProjectCards);
  }
  player.roboticProject.type = type;
  player.robotModifiers.splice(index, 1);
  
  return processRoboticProject(G, player);
}

/**
 * Do this when you hire Noor, or when Callisto lets you
 * 
 * @param G 
 * @param player 
 * @param robot 
 * @param moon 
 * @returns 
 */

export function assignMoonToRobotInPlay(G: GalileoProjectGameState, player: Player, robot: RobotInPlay, moon: Moon): MoonLevelChangeResult {
  const index = player.moonAssignemnts.indexOf(moon);
  if (index === -1) {
    return error(`Player ${player.playerID} doesn't have moon ${moon} modifier`);
  }

  const currentMoon = findRobot(player, robot);
  if(!currentMoon) {
    return error(`Player ${player.playerID} doesn't have specified robot`);
  }

  if (currentMoon === moon) {
    return error(`Player ${player.playerID} tried to move robot to same moon`);
  }

  if (robot.moon2) {
    // robot doesn't have a spare moon space
    return error(`Player ${player.playerID} tried to assign moon ${moon} to rbot with no free space`);
  }

  robot.moon2 = moon;
  player.moonAssignemnts.splice(index, 1);

  // move robot
  return moveRobotToMoon(G, player, robot, moon);
}

/**
 * Do this when you hire Marty Simon, or when Callisto lets you
 * 
 * @param player 
 * @param type 
 * @param robot 
 * @returns 
 */
export function assignTypeToRobotInPlay(player: Player, type: RobotType, robot: RobotInPlay): boolean {
  const index = player.robotModifiers.indexOf(type);
  if (index === -1) {
    // player doesn't have the type
    return false;
  }

  if (robot.typeModified) {
    // robot is already modified
    return false;
  }
  player.robotModifiers.splice(index, 1);
  robot.type = type;
  robot.typeModified = true;
  return true;
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
export function lowerThenIncreaseRobots(G: GalileoProjectGameState, player: Player, robot1: RobotInPlay | RoboticProjectCard, robot2: RobotInPlay | RoboticProjectCard): MoonLevelChangeResult {
  if (robot1.level === 1 || robot2.level === 6) {
    return error(`Tried to move level below 1 or above 6`);
  }
  let result1: MoonLevelChangeResult;
  if (!roboticProjectComplete(robot1)) {
    result1 = changeLevelRobot(G, player, robot1 as RobotInPlay, robot1.level - 1);
  } else {
    const err = changeLevelProject(G, player, robot1.level - 1);
    if (err) {
      result1 = error(`Could not change level of robotic project`);
    } else {
      result1 = value([]);
    }
  }

  if (!result1.ok) {
    return result1;
  }

  let result2: MoonLevelChangeResult;
  if (!roboticProjectComplete(robot2)) {
    result2 = changeLevelRobot(G, player, robot2 as RobotInPlay, robot2.level + 1); 
  } else {
    const err = changeLevelProject(G, player, robot2.level + 1);
    if (err) {
      return error(`Could not change level of robotic project`);
    } else {
      result2 = value([]);
    }
  }

  
  if (!result2.ok) {
    return result2;
  }

  return {ok: true, value: [...result1.value, ...result2.value]}
}

/**
 * Hire Leonard Simon
 * @param G 
 * @param player 
 * @param robot 
 * @returns 
 */
export function buyEnergyThenMove(G: GalileoProjectGameState, player: Player, robot?: RobotInPlay): MoonLevelChangeResult {
  if (robot && !robot.moon2) {
    return error(`Can only move robot with double assignment`);
  }

  payCredits(G, player, 1);
  gainEnergy(G, player, 1);

  if (!robot) {
    return value([])
  }

  const moon = findRobot(player, robot);
  if (!moon) {
    return error(`Player doesn't have specified moon modifier`);
  }

  return moveRobotToMoon(G, player, robot, moon === robot.moon1 ? robot.moon2! : robot.moon1);
}

export function moveRobotThenIncrease(G: GalileoProjectGameState, player: Player, robot: RobotInPlay): MoonLevelChangeResult {
  if (!robot.moon2) {
    // can only move robot with double assignment
    return error(`Can only move robot with double assignment`);
  }
  const moon = findRobot(player, robot);
  if (!moon) {
    return error(`Player doesn't have specified moon modifier`);
  }

  const destMoon = robot.moon1 || robot.moon2;
  
  const result1 = moveRobotToMoon(G, player, robot, destMoon);
  if (!result1.ok) {
    return result1;
  }

  const result2 = changeLevelRobot(G, player, robot, robot.level + 1);
  if (!result2.ok) {
    return result2;
  }

  return { ok: true, value: [...result1.value, ...result2.value]};  
}

/**
 * The bottom action of each hire
 * 
 * @param G 
 * @param player 
 * @param character 
 * @param characterToFire 
 * @returns 
 */
export function keepCharacter(G: GalileoProjectGameState, player: Player, character: CharacterCard, characterToFire?: CharacterCard): boolean {
  if (player.characters.length === maxCharacters(player)) {
    if (!characterToFire) {
      return false;
    }
    const index = player.characters.indexOf(characterToFire);
    if (index === -1) {
      return false;
    }
    player.characters.splice(index, 1);
    G.secret.discardedCharacters.unshift(characterToFire);
  }
  player.characters.push(character);
  return true;
}

function maxCharacters(player: Player): number {
  const ganymedeLevel = moonLevel(player, "Ganymede");
  const techBonus = player.technologies.map(t => t.techId).includes('MemoryScanner') ? 1 : 0;
  if (ganymedeLevel === 0) {
    return 2 + techBonus;
  } else if (ganymedeLevel <= 7) {
    return 3 + techBonus;
  } else if (ganymedeLevel <= 14) {
    return 5 + techBonus;
  } else {
    return 6 + techBonus;
  }
}

function changeLevelRobot(G: GalileoProjectGameState, player: Player, robot: RobotInPlay, newLevel: number): MoonLevelChangeResult {
  const moon = findRobot(player, robot);
  if (!moon) {
    return error(`Player ${player.playerID} doesn't have specified robot`);
  }

  const startMoonLevel = moonLevel(player, moon);
  adjustLevel(G, robot, newLevel);
  const endMoonLevel = moonLevel(player, moon);

  return value(handleMoonMarkers(G, player, startMoonLevel, endMoonLevel, moon));
}

function changeLevelProject(G: GalileoProjectGameState, player: Player, newLevel: number): boolean {
  const project = player.roboticProject;
  if (!project) {
    return false;
  }

  return adjustLevel(G, project, newLevel);
}


function adjustLevel(G: GalileoProjectGameState, level: RobotLevels, newLevel: number): boolean {
  if (level.level != level.baseLevel) {
    // level has been modified
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


function processRoboticProject(G: GalileoProjectGameState, player: Player): MoonLevelChangeResult {
  const roboticProject = player.roboticProject!;

  if (!roboticProjectComplete(roboticProject)) {
    return value([]);
  }

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

  return placeRobotOnMoon(G, player, robotInPlay, moon);
}

function placeRobotOnMoon(G: GalileoProjectGameState, player: Player, robot: RobotInPlay, moon: Moon): MoonLevelChangeResult  {
  const startMoonLevel = moonLevel(player, moon);
  player.moons[moon].push(robot);
  const endMoonLevel = moonLevel(player, moon);
  
  const result = handleMoonMarkers(G, player, startMoonLevel, endMoonLevel, moon)
  return value(result);
}

function moveRobotToMoon(G: GalileoProjectGameState, player: Player, robot: RobotInPlay, destMoon: Moon): MoonLevelChangeResult {
  const fromMoon = findRobot(player, robot)!;
  const startMoonLevel = moonLevel(player, fromMoon);
  const index = player.moons[fromMoon].indexOf(robot);
  if (index > -1) {
    player.moonAssignemnts.splice(index, 1);
  }
  const endMoonLevel = moonLevel(player, fromMoon);
  const fromResult = handleMoonMarkers(G, player, startMoonLevel, endMoonLevel, fromMoon);
  const destResult = placeRobotOnMoon(G, player, robot, destMoon);
  if (!destResult.ok) {
    return destResult;
  }

  return value([...fromResult, ...destResult.value]);
}

function handleMoonMarkers(G: GalileoProjectGameState, player: Player, startMoonLevel: number, endMoonLevel: number, moon: Moon): MoonLevelResolution[] {
  const [smaller, bigger] = startMoonLevel< endMoonLevel ? [startMoonLevel, endMoonLevel] : [endMoonLevel, startMoonLevel]
   if (moon === 'Callisto' && (
    (smaller < 2 && bigger >= 2) ||
    (smaller < 7 && bigger >= 7) ||
    (smaller < 12 && bigger >= 12)
    )
  ) {
    return ['UpdateRoboticProject'];
  } else if (moon === 'Europa' && (
    (smaller < 3 && bigger >= 3) ||
    (smaller < 6 && bigger >= 6) ||
    (smaller < 9 && bigger >= 9)
    )
  ) {
    gainEnergy(G, player, 1);
    return [];
  } else {
    return [];
  }
}


function findRobot(player: Player, robot: RobotInPlay): Moon | undefined {
  for(const m of moons) {
    if (_.includes(player.moons[m], robot)) {
      return m;
    }
  }
  return undefined;
}

function roboticProjectComplete(robot: RoboticProjectCard | RobotInPlay): boolean {
  return !!(robot.type && robot.moon1);
}


function adjustCharacterInfluence(card: CharacterCard, index: number): number {
  if (index < 2) {
    return card.baseInfluence;
  } else if (index === 2) {
    return card.baseInfluence - 1;
  } else if (index === 3) {
    return card.baseInfluence - 2;
  } else {
    return card.baseInfluence - 3;
  }
}

function resolveCharacterAbility(card: CharacterCard, player: Player, ability: CharacterAbility, track: Track | undefined): CharacterAbility[] {
  const ganymedeLevel = moonLevel(player, "Ganymede");
  if (ganymedeLevel < 4) {
    // player gets ability that matches track they're on 
    // OR matches the track they've chosen if they're at 0 influence
    if (player.influence === 0) {
      return track === card.immediateTrack ? ['Immediate'] : ['EndOfGame'];
    } else {
      return player.track === card.immediateTrack ? ['Immediate'] : ['EndOfGame'];
    }
  } else if (ganymedeLevel >= 4 && ganymedeLevel <= 10) {
    // player can resolve either ability
    return ability === 'Immediate' ? ['Immediate'] : ['EndOfGame'];
  } else {
    // player resolves both abilities
    return ['Immediate', 'EndOfGame'];
  }
}

function validateHire(G: GalileoProjectGameState, player: Player, index: number, track: Track | undefined): boolean {
  if (index < 0 || index > 4) {
    return false;
  }

  if (player.influence === 0 && !track) {
    // you need to specify a track to get the influence on if you have 0 
    // (i.e. you're not on a track)
    return false;
  }
  
  if (player.influence > 0 && track && player.track !== track) {
    // normally you wouldn't supply a track if you're on a track,
    // but if you do they have to match
    return false;
  }
  
  return true;
}

function payCredits(G: GalileoProjectGameState, player: Player, give: number) {
  G.megacredits += give;
  player.megacredits -= give;
}
