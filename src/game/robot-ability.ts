import { pushCharacterCtx } from './character';
import { countRobots, gainCredits, gainEnergy, gainInfluence } from './game-utils';
import { incrementLevel, MoonLevelChangeResult } from './levels';
import { CharacterAbility, GalileoProjectGameState, Player } from './model';
import { RobotSelection } from './robot';
import { developTech, TechDiscount } from './technology';
import { peek } from './utils';

export function resolveBuilderAbility(
  G: GalileoProjectGameState,
  player: Player,
  index: number,
  ability: CharacterAbility,
): boolean {
  const total = countRobots(player, 'Builder') + 1;
  if (index >= total || index < 0 || index > 4) {
    return false;
  }

  if (ability === 'Both') {
    return false;
  }

  const character = G.charactersForHire[index];
  if (!character) {
    return false;
  }
  G.charactersForHire[index] = null;
  pushCharacterCtx(G, ability, character);
  return true;
}

export function resolveMinerAbility(G: GalileoProjectGameState, player: Player): boolean {
  const total = countRobots(player, 'Miner') + 1;
  gainCredits(G, player, total);
  return true;
}

/**
 * Technician robots are resolved by upping the level of a robot or project
 * of your choice by the number of technicians you have.
 * @param G
 * @param player
 * @param robot
 * @returns
 */
export function resolveTechnicianAbility(
  G: GalileoProjectGameState,
  player: Player,
  robotSelection: RobotSelection | null,
): MoonLevelChangeResult {
  const total = countRobots(player, 'Technician') + 1;
  return incrementLevel(G, player, robotSelection, total);
}

export function resolveStarZA1(G: GalileoProjectGameState, player: Player): boolean {
  if (validateStarZMove(G, player, true, 1)) {
    return false;
  }
  return gainEnergy(G, player, 1);
}

export function resolveStarZA2(G: GalileoProjectGameState, player: Player): boolean {
  if (validateStarZMove(G, player, true, 2)) {
    return false;
  }
  return gainInfluence(G, player, 3);
}

export function resolveStarZA3(
  G: GalileoProjectGameState,
  player: Player,
  ability: CharacterAbility,
): boolean {
  if (validateStarZMove(G, player, true, 3)) {
    return false;
  }
  const index = 0;
  const character = G.charactersForHire[index];
  if (!character) {
    return false;
  }
  if (ability === 'Both') {
    return false;
  }
  G.charactersForHire[index] = null;
  pushCharacterCtx(G, ability, character);
  return true;
}

export function resolveStarZA4(G: GalileoProjectGameState, player: Player): boolean {
  if (validateStarZMove(G, player, true, 4)) {
    return false;
  }
  return gainCredits(G, player, 2);
}

export function resolveStarZA5(
  G: GalileoProjectGameState,
  player: Player,
  robotSelection: RobotSelection | null,
): MoonLevelChangeResult {
  if (validateStarZMove(G, player, true, 5)) {
    return false;
  }
  return incrementLevel(G, player, robotSelection, 3);
}

export function resolveStarZB1(G: GalileoProjectGameState, player: Player): boolean {
  if (validateStarZMove(G, player, false, 1)) {
    return false;
  }
  return gainEnergy(G, player, 1);
}

export function resolveStarZB2(
  G: GalileoProjectGameState,
  player: Player,
  robotSelection: RobotSelection | null,
): MoonLevelChangeResult {
  if (validateStarZMove(G, player, false, 2)) {
    return false;
  }
  return incrementLevel(G, player, robotSelection, 1);
}

/**
 * Pick first character, gain hiring effect, discard.
 *
 * @param G
 * @param player
 * @returns
 */
export function resolveStarZB3(G: GalileoProjectGameState, player: Player) {
  if (validateStarZMove(G, player, false, 3)) {
    return false;
  }
  const index = 0;
  const card = G.charactersForHire[index];
  if (!card) {
    return false;
  }
  G.charactersForHire[index] = null;
  gainInfluence(G, player, card.baseInfluence);
  gainCredits(G, player, card.megacredits);
  G.discardedCharacters.push(card);
}

export function resolveStarZB4(
  G: GalileoProjectGameState,
  player: Player,
  index: number,
  discount: TechDiscount,
): boolean {
  if (validateStarZMove(G, player, false, 4)) {
    return false;
  }
  return developTech(G, player, index, discount);
}

export function resolveStarZB5(G: GalileoProjectGameState, player: Player, index: number): boolean {
  if (validateStarZMove(G, player, false, 5)) {
    return false;
  }

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

  goalTracker.players.push(player.playerID);
  return true;
}

/**
 *
 * @param G
 * @param player
 * @param side
 * @param bonus from 1-5
 * @returns
 */
function validateStarZMove(
  G: GalileoProjectGameState,
  player: Player,
  side: boolean,
  bonus: number,
): boolean {
  if (G.starZASide !== side) {
    return false;
  }
  const action = peek(G.actionCtx);
  if (!action || action.stage !== 'PlaceRobot' || action.robotToPlace.type !== 'StarZ') {
    return false;
  }
  const starZCount = countRobots(player, 'StarZ') + 1;
  if (bonus < 1 || bonus > starZCount) {
    return false;
  }
  return true;
}
