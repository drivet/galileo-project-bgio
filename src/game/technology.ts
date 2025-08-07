import { gainCredits, gainInfluence, payCredits, payEnergy } from "./game-utils";
import { DevelopTechCtx, GalileoProjectGameState, Player } from "./model";
import { peek } from "./utils";

export const ENERGY_DISCOUNT = 1;
export const MEGACREDIT_DSCOUNT = 2;
export type TechDiscount = 1 | 2;

/**
 * Develop a technology, possibly with a discount from a Star Z B-side ability
 * 
 * @param G 
 * @param player 
 * @param index 
 * @param discount 
 * @returns 
 */
export function developTech(G: GalileoProjectGameState, player: Player, index: number, discount?: TechDiscount): boolean {
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
    kind: 'techToKeep',
    techToKeep: tech,
  });
  return true;
}

export function keepTech(G: GalileoProjectGameState, player: Player): boolean {
  const action = peek(G.actionCtx);
  if (!action || action.kind !== 'techToKeep') {
    return false;
  }
  const tech = (G.actionCtx.pop() as DevelopTechCtx).techToKeep;
  player.technologies.push(tech);
  return true;
}

export function resolveCryptoExchange(G: GalileoProjectGameState, player: Player): boolean {
  gainCredits(G, player, 4);
  gainInfluence(G, player, 4);
  return true;
}
