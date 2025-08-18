import { moonLevel } from "./game-utils";
import { GalileoProjectGameState, Player, RobotInPlay } from "./model";

export function claimGoal(G: GalileoProjectGameState, player: Player, index: number): boolean {
  if (index < 0 || index > 3) {
    return false;
  }

  const goalTracker = G.goals[index];
  if (goalTracker.players.length >= 3) {
    return false;
  }

  if (goalTracker.players.includes(player.playerID)) {
    return false;
  }

  if (goalTracker.goal === 'Control4RobotsLevel6' && !validateControl4RobotsLevel6(player)) {
    return false;
  } else if (goalTracker.goal === 'Control5RobotsWithDouble' && !validateControl5RobotsWithDouble(player)) {
    return false;
  } else if (goalTracker.goal === 'Control7RobotsSamecColor' && !validateControl7RobotsSamecColor(player)) {
    return false;
  } else if (goalTracker.goal === 'Develop4Technologies' && !validateDevelop4Technologies(player)) {
    return false;
  } else if (goalTracker.goal === 'Have4Characters' && !validateHave4Characters(player)) {
    return false;
  } else if (goalTracker.goal === 'Have4ModifiedRobots' && !validateHave4Characters(player)) {
    return false;
  } else if (goalTracker.goal === 'Have8MegaCredits' && !validateHave8MegaCredits(player)) {
    return false;
  } else if (goalTracker.goal === 'Reach6OnEachMoon' && !validateReach6OnEachMoon(player)) {
    return false;
  }

  goalTracker.players.push(player.playerID);
  return true;
}

function validateControl4RobotsLevel6(player: Player): boolean {
  return allRobots(player).filter(r => r.level >= 6).length >= 4;
}

function validateControl5RobotsWithDouble(player: Player): boolean  {
  return allRobots(player).filter(r => r.moon2 != null).length >= 5
}

function validateControl7RobotsSamecColor(player: Player): boolean  {
  const all = allRobots(player);
  return all.filter(r => r.track === 'Earth').length >= 7 ||
         all.filter(r => r.track === 'Mars').length >= 7;
}

function validateDevelop4Technologies(player: Player): boolean {
  return player.technologies.length >= 4;
}

function validateHave4Characters(player: Player): boolean  {
  return player.characters.length >= 4;
}

function validateHave8MegaCredits(player: Player): boolean  {
  return player.megacredits >= 8;
}

function validateReach6OnEachMoon(player: Player): boolean  {
  return moonLevel(player, 'Callisto') >= 6 && 
         moonLevel(player, 'Europa') >= 6 &&
         moonLevel(player, 'Ganymede') >= 6 &&
         moonLevel(player, 'Io') >= 6;
}

function allRobots(player: Player): RobotInPlay[] {
  return [...player.moons.Io,
          ...player.moons.Callisto,
          ...player.moons.Ganymede,
          ...player.moons.Europa];
}