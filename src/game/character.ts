
import { gainInfluence, gainCredits, countRobots, moonLevel } from "./game-utils";
import { CharacterCard, CharacterCtx, GalileoProjectGameState, Player, Track } from "./model";
import { peek } from "./utils";

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
export function hireCharacter(G: GalileoProjectGameState, player: Player, index: number, track?: Track): boolean {
  if (!validateHire(player, index, track)) {
    return false;
  }

  const card = G.charactersForHire[index];
  if (!card) {
    return false;
  }
  gainInfluence(G, player, adjustCharacterInfluence(card, index));
  gainCredits(G, player, card.megacredits);

  G.actionCtx.push({
    kind: 'characterToUse',
    character: card,
  });  
  return true;
}


export function resolveBuilderAbility(G: GalileoProjectGameState, player: Player, index: number) {
  const total = countRobots(player, 'Builder') + 1;
  if (index >= total || index < 0 || index > 4) {
    return false;
  }

  const character = G.charactersForHire[index];
  if (!character) {
    return false;
  }
  G.charactersForHire[index] = null;
  G.actionCtx.push({
    kind: 'characterToUse',
    character,
  });  
}

export function resolveStarZA3(G: GalileoProjectGameState) {
  const index = 0;
  const character = G.charactersForHire[index];
  if (!character) {
    return false;
  }
  G.charactersForHire[index] = null;
  G.actionCtx.push({
    kind: 'characterToUse',
    character,
  });  
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
  if (!action || action.kind !== 'characterToUse') {
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
  const character = (G.actionCtx.pop() as CharacterCtx).character;
  player.characters.push(character); 
  return true;
}

export function discardCharacter(G: GalileoProjectGameState): boolean {
  const action = peek(G.actionCtx);
  if (!action || action.kind !== 'characterToUse') {
    return false;
  }
  const character = (G.actionCtx.pop() as CharacterCtx).character;
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

function validateHire(player: Player, index: number, track?: Track): boolean {
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