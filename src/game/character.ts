
import { gainInfluence, gainCredits, countRobots, moonLevel, otherTrack } from "./game-utils";
import { CharacterAbility, CharacterCard, DiscardCharacterCtx, GalileoProjectGameState, KeepCharacterCtx, Player, Track } from "./model";
import { peek } from "./utils";

function pushCharacterCtx(G: GalileoProjectGameState, ability: CharacterAbility, card: CharacterCard) {
  if (ability === 'Immediate') {
    G.actionCtx.push({
      kind: 'discardCharacter',
      character: card,
    });
  } else {
     G.actionCtx.push({
      kind: 'keepCharacter',
      character: card,
    });
  }
}

/**
 * One of the basic actions of the game
 * 
 * @param G 
 * @param player 
 * @param index 
 * @param ability This is only a choice on certain Ganeymede spaces, otherwise it's determined by your track, or it's always both
 * @param track This is only a choice if you're on the 0 space.
 * @returns 
 */
export function hireCharacter(G: GalileoProjectGameState, player: Player, index: number, ability: CharacterAbility, track: Track): boolean {
  const card = G.charactersForHire[index];
  if (!card) {
    return false;
  }

  if (!validateHire(player, card, ability, track)) {
    return false;
  }

  if (player.influence === 0) {
    player.track = track;
  }

  gainInfluence(G, player, adjustCharacterInfluence(card, index));
  gainCredits(G, player, card.megacredits);

  pushCharacterCtx(G, ability, card);
  return true;
}


export function resolveBuilderAbility(G: GalileoProjectGameState, player: Player, index: number, ability: CharacterAbility) {
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
}

export function resolveStarZA3(G: GalileoProjectGameState, ability: CharacterAbility) {
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
}

export function resolveStarZB3(G: GalileoProjectGameState, player: Player) {
  const index = 0;
  const card = G.charactersForHire[index];
  if (!card) {
    return false;
  }
  G.charactersForHire[index] = null;
  gainInfluence(G, player, adjustCharacterInfluence(card, index));
  gainCredits(G, player, card.megacredits);
  G.secret.discardedCharacters.push(card);
}

/**
 * The bottom action of each hire.
 * 
 * @param G 
 * @param player 
 * @param character 
 * @param characterToFire 
 * @returns 
 */
export function keepCharacter(G: GalileoProjectGameState, player: Player, characterToFire?: CharacterCard): boolean {
  const action = peek(G.actionCtx);
  if (!action || action.kind !== 'keepCharacter') {
    return false;
  }
  
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
  const character = (G.actionCtx.pop() as KeepCharacterCtx).character;
  player.characters.push(character); 
  return true;
}

export function discardCharacter(G: GalileoProjectGameState): boolean {
  const action = peek(G.actionCtx);
  if (!action || action.kind !== 'discardCharacter') {
    return false;
  }
  const character = (G.actionCtx.pop() as DiscardCharacterCtx).character;
  G.secret.discardedCharacters.push(character);
  return true;
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

function validateHire(player: Player, card: CharacterCard, ability: CharacterAbility, track: Track): boolean {
  if (player.influence > 0 && player.track !== track) {
    // track has to match, but only if you actually have influence
    return false;
  }
  
  const ganymedeLevel = moonLevel(player, "Ganymede");
  if (ganymedeLevel < 4) {
    // at this level, the ability must match your track, and you can't do both
    if (ability === 'Both') {
      return false;
    } else if (ability === 'Immediate' && card.immediateTrack !== track) {
      return false;
    } else if (ability === 'EndOfGame' && otherTrack(card.immediateTrack) !== track) {
      return false;
    }
  } else if (ganymedeLevel >= 4 && ganymedeLevel <= 10 && ability === 'Both') {
    // At this level, you can resolve either of the character's abilities,
    // but not both
    return false;
  } else if (ganymedeLevel > 10 && ability !== 'Both') {
    // at this level, you have to resolve both
    return false;
  }
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