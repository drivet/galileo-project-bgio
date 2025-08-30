import { gainCredits, gainInfluence, payCredits, payEnergy } from './game-utils';
import { changeLevel, MoonLevelChangeResult } from './levels';
import {
  GalileoProjectGameState,
  KeepTechCtx,
  Moon,
  Player,
  RobotInPlay,
  RobotType,
} from './model';
import { RobotSelection } from './robot';
import { peek, takeTop, takeTopN } from './utils';

export const ENERGY_DISCOUNT = 1;
export const MEGACREDIT_DSCOUNT = 2;
export type TechDiscount = 1 | 2;

/**
 * Develop a technology, possibly with a discount from a Star Z B-side ability.
 *
 * Pay the fee, and register an action ctx so that we remember to "keep the
 * technology", which just consists of the player moving the tech to their pile.
 *
 * @param G
 * @param player
 * @param index
 * @param discount
 * @returns
 */
export function developTech(
  G: GalileoProjectGameState,
  player: Player,
  index: number,
  discount?: TechDiscount,
): boolean {
  const techStack = G.technologies[index];

  if (techStack.length === 0) {
    return false;
  }

  const tech = techStack[0];
  const energyCost = discount !== ENERGY_DISCOUNT ? tech.energy : tech.energy - 1;
  const creditCost = discount !== MEGACREDIT_DSCOUNT ? tech.megacredits : tech.megacredits - 1;
  if (energyCost > player.energy || creditCost > player.megacredits) {
    return false;
  }

  payCredits(G, player, creditCost);
  payEnergy(G, player, energyCost);

  techStack.pop();
  G.actionCtx.push({
    stage: 'KeepTech',
    techToKeep: tech,
  });
  return true;
}

export function keepTech(G: GalileoProjectGameState, player: Player): boolean {
  const action = peek(G.actionCtx);
  if (!action || action.stage !== 'KeepTech') {
    return false;
  }
  const tech = (G.actionCtx.pop() as KeepTechCtx).techToKeep;
  player.technologies.push(tech);
  return true;
}

export function resolveCryptoExchange(G: GalileoProjectGameState, player: Player): boolean {
  gainCredits(G, player, 4);
  gainInfluence(G, player, 4);
  return true;
}

export function resolveSuperconductivity(
  G: GalileoProjectGameState,
  player: Player,
  robotSelection: RobotSelection | null,
): MoonLevelChangeResult {
  return changeLevel(G, player, robotSelection, 7);
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
export function resolveRoboticSequencingChoose(
  G: GalileoProjectGameState,
  player: Player,
  index: number,
): boolean {
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
    stage: 'PlaceRobot',
    robotToPlace: robot,
  });
  return true;
}

/**
 * Resolve the automated assembly tech by making a whole new robotic
 * project and entering it into play as if acquired.
 *
 * Might do NOTHING if we are out of Project cards.
 *
 * @param G
 * @param player
 * @param modifier
 * @param moon
 * @returns
 */
export function resolveAutomatedAssembly(
  G: GalileoProjectGameState,
  player: Player,
  modifier?: RobotType,
  moon?: Moon,
): boolean {
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
    stage: 'PlaceRobot',
    robotToPlace: robotInPlay,
  });
  return true;
}

export function resolveMemoryScanner(
  G: GalileoProjectGameState,
  player: Player,
  index: number,
): boolean {
  const card = G.discardedCharacters[index];
  if (!card) {
    return false;
  }

  G.discardedCharacters.splice(index, 1);

  G.actionCtx.push({
    stage: 'KeepCharacter',
    character: card,
  });

  return true;
}
