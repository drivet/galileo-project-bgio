import _ from "lodash";
import { GalileoProjectGameState, Moon, Player, RobotType, TechId } from "./model";

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

  if (playerHasTech(player, 'EarthMarsHighway') && !player.usedEarthMarsHighWay) {
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
  if (playerHasTech(player, 'AutomatedDrilling') && !player.usedAutomtaedDrilling) {
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

export function gainEnergy(G: GalileoProjectGameState, player: Player, energy: number): boolean {
  if (energy < 0) {
    return false;
  }
  const give = Math.min(energy, 5 - player.energy);
  G.energy -= give;
  player.energy += give;
  return true;
}

export function gainInfluence(G: GalileoProjectGameState, player: Player, influence: number): boolean {
  if (influence < 0) {
    return false;
  }

  if (player.influence === 10) {
    return true;
  }

  if ((player.influence + influence) > 10) {
    player.influence += Math.min(influence, 10 - player.influence);
    gainCredits(G, player, 1);
  } else {
    player.influence += influence;
  }
  return true;
}


export function moonLevel(player: Player, moon: Moon): number {
  let level = 0;
  player.moons[moon].forEach(c => level += c.level);
  if (moon === 'Callisto') {
    return Math.min(level, 14);
  } else if (moon === 'Europa') {
    return Math.min(level, 12);
  } else if (moon === 'Ganymede') {
    return Math.min(level, 15);
  } else {
    // Io
    return Math.min(level, 13);
  }
}

export function payCredits(G: GalileoProjectGameState, player: Player, give: number) {
  G.megacredits += give;
  player.megacredits -= give;
}

export function payEnergy(G: GalileoProjectGameState, player: Player, give: number) {
  G.energy += give;
  player.energy -= give;
}

export function countRobots(player: Player, robotType: RobotType): number {
  const ioCount = player.moons.Io.filter(r => r.type === robotType).length;
  const europaCount = player.moons.Europa.filter(r => r.type === robotType).length;
  const ganymedeCount = player.moons.Ganymede.filter(r => r.type === robotType).length;
  const callistoCount = player.moons.Callisto.filter(r => r.type === robotType).length;
  return ioCount + europaCount + ganymedeCount + callistoCount;
}

function playerHasTech(player: Player, tech: TechId): boolean {
  return player.technologies.map(t => t.techId).includes(tech);
}