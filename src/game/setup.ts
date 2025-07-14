import { Ctx } from "boardgame.io";
import { allGoals, CharacterCard, CharacterId, CharacterMarker, GalileoProjectGameState, 
  GoalTracker, 
  Moon, Player, RobotCard, RoboticProjectCard, RobotType, TechId, Track } from "./model";
import { shuffle, takeTopN } from "./utils";
import _ from "lodash";

function makeRobotCard(type: RobotType, track: Track, baseCost: number,
                       moon1: Moon, moon2: Moon | null,
                       initialLevel: number): RobotCard {
  return { type, track, baseCost, moon1, moon2, initialLevel };
}

const robotCards: RobotCard[] = [
  makeRobotCard("Builder", "Mars", 3, "Callisto", "Ganymede", 1),
  makeRobotCard("Builder", "Mars", 3, "Io", "Callisto", 1),
  makeRobotCard("Builder", "Mars", 4, "Europa", null, 2),
  makeRobotCard("Builder", "Mars", 4, "Ganymede", null, 2),
  makeRobotCard("Builder", "Mars", 5, "Io", null, 3),
  makeRobotCard("Builder", "Mars", 5, "Callisto", null, 3),
  makeRobotCard("Builder", "Earth", 3, "Ganymede", "Europa", 1), 
  makeRobotCard("Builder", "Earth", 3, "Europa", "Io", 1),
  makeRobotCard("Builder", "Earth", 4, "Callisto", null, 2),
  makeRobotCard("Builder", "Earth", 4, "Io", null, 2),  
  makeRobotCard("Builder", "Earth", 5, "Europa", null, 3),
  makeRobotCard("Builder", "Earth", 5, "Ganymede", null, 3),

  makeRobotCard("Miner", "Mars", 2, "Io", "Callisto", 1),
  makeRobotCard("Miner", "Mars", 2, "Callisto", "Ganymede", 1),
  makeRobotCard("Miner", "Mars", 3, "Europa", null, 2),
  makeRobotCard("Miner", "Mars", 3, "Ganymede", null, 2),
  makeRobotCard("Miner", "Mars", 4, "Io", null, 3),
  makeRobotCard("Miner", "Mars", 4, "Callisto", null, 3),
  makeRobotCard("Miner", "Earth", 2, "Ganymede", "Europa", 1),
  makeRobotCard("Miner", "Earth", 2, "Europa", "Io", 1),
  makeRobotCard("Miner", "Earth", 3, "Io", null, 2),
  makeRobotCard("Miner", "Earth", 3, "Callisto", null, 2),
  makeRobotCard("Miner", "Earth", 4, "Europa", null, 3),
  makeRobotCard("Miner", "Earth", 4, "Ganymede", null, 3), 

  makeRobotCard("StarZ", "Mars", 4, "Europa", "Io", 1),
  makeRobotCard("StarZ", "Mars", 4, "Ganymede", "Europa", 1),
  makeRobotCard("StarZ", "Mars", 5, "Callisto", null, 2),
  makeRobotCard("StarZ", "Mars", 5, "Io", null, 2),
  makeRobotCard("StarZ", "Mars", 6, "Ganymede", null, 3),
  makeRobotCard("StarZ", "Mars", 6, "Europa", null, 3),
  makeRobotCard("StarZ", "Earth", 4, "Callisto", "Ganymede", 1),
  makeRobotCard("StarZ", "Earth", 4, "Io", "Callisto", 1),
  makeRobotCard("StarZ", "Earth", 5, "Ganymede", null, 2),
  makeRobotCard("StarZ", "Earth", 5, "Europa", null, 2),
  makeRobotCard("StarZ", "Earth", 6, "Io", null, 3),
  makeRobotCard("StarZ", "Earth", 6, "Callisto", null, 3),

  makeRobotCard("Technician", "Mars", 5, "Ganymede", "Europa", 1),
  makeRobotCard("Technician", "Mars", 5, "Europa", "Io", 1),
  makeRobotCard("Technician", "Mars", 6, "Callisto", null, 2),
  makeRobotCard("Technician", "Mars", 6, "Io", null, 2),
  makeRobotCard("Technician", "Mars", 7, "Europa", null, 3),
  makeRobotCard("Technician", "Mars", 7, "Ganymede", null, 3),
  makeRobotCard("Technician", "Earth", 5, "Io", "Callisto", 1),
  makeRobotCard("Technician", "Earth", 5, "Callisto", "Ganymede", 1),
  makeRobotCard("Technician", "Earth", 6, "Europa", null, 2),
  makeRobotCard("Technician", "Earth", 6, "Ganymede", null, 2),
  makeRobotCard("Technician", "Earth", 7, "Callisto", null, 3),
  makeRobotCard("Technician", "Earth", 7, "Io", null, 3),
];

function makeCharacterCard(name: CharacterId, baseInfluence: number, 
                           megacredits: number, topTrack: Track, marker?: CharacterMarker): CharacterCard {
  return { name, baseInfluence, megacredits, topTrack, marker };
}

const characterCards: CharacterCard[] = [
  makeCharacterCard("MsChau", 3, 0, "Mars", "4"),
  makeCharacterCard("MsChau", 3, 0, "Mars"),
  makeCharacterCard("MsChau", 3, 0, "Earth", "3+"),
  makeCharacterCard("MsChau", 3, 0, "Earth"),

  makeCharacterCard("MnLeonardSimon", 5, 0, "Mars", "4"),
  makeCharacterCard("MnLeonardSimon", 5, 0, "Mars"),
  makeCharacterCard("MnLeonardSimon", 5, 0, "Earth", "3+"),
  makeCharacterCard("MnLeonardSimon", 5, 0, "Earth"),

  makeCharacterCard("MnHunterPerks", 4, 1, "Mars", "3+"),
  makeCharacterCard("MnHunterPerks", 4, 1, "Mars"),
  makeCharacterCard("MnHunterPerks", 4, 1, "Earth", "4"),
  makeCharacterCard("MnHunterPerks", 4, 1, "Earth"),

  makeCharacterCard("MartySimon", 4, 0, "Mars", "3+"),
  makeCharacterCard("MartySimon", 4, 0, "Mars"),
  makeCharacterCard("MartySimon", 4, 0, "Earth", "4"),
  makeCharacterCard("MartySimon", 4, 0, "Earth"),

  makeCharacterCard("MnDiatExpi", 5, 0, "Mars", "3+"),
  makeCharacterCard("MnDiatExpi", 5, 0, "Mars"),
  makeCharacterCard("MnDiatExpi", 5, 0, "Earth", "4"),
  makeCharacterCard("MnDiatExpi", 5, 0, "Earth"), 
  
  makeCharacterCard("MnMilutinMadic", 4, 0, "Mars", "4"),
  makeCharacterCard("MnMilutinMadic", 4, 0, "Mars"),
  makeCharacterCard("MnMilutinMadic", 4, 0, "Earth", "3+"),
  makeCharacterCard("MnMilutinMadic", 4, 0, "Earth"),

  makeCharacterCard("MnEliotBan", 4, 0, "Mars", "3+"),
  makeCharacterCard("MnEliotBan", 4, 0, "Mars"),
  makeCharacterCard("MnEliotBan", 4, 0, "Earth", "4"),
  makeCharacterCard("MnEliotBan", 4, 0, "Earth"),

  makeCharacterCard("MsLee", 5, 0, "Mars", "4"),
  makeCharacterCard("MsLee", 5, 0, "Mars"),
  makeCharacterCard("MsLee", 5, 0, "Earth", "3+"),
  makeCharacterCard("MsLee", 5, 0, "Earth"),

  makeCharacterCard("Noor", 4, 0, "Mars", "4"),
  makeCharacterCard("Noor", 4, 0, "Mars"),
  makeCharacterCard("Noor", 4, 0, "Earth", "3+"),
  makeCharacterCard("Noor", 4, 0, "Earth"),

  makeCharacterCard("TarakFreeman", 6, 0, "Mars", "4"),
  makeCharacterCard("TarakFreeman", 6, 0, "Mars"),
  makeCharacterCard("TarakFreeman", 6, 0, "Earth", "3+"),
  makeCharacterCard("TarakFreeman", 6, 0, "Earth"),

  makeCharacterCard("Nakkia", 4, 1, "Mars", "3+"),
  makeCharacterCard("Nakkia", 4, 1, "Mars"),
  makeCharacterCard("Nakkia", 4, 1, "Earth", "4"),
  makeCharacterCard("Nakkia", 4, 1, "Earth"),

  makeCharacterCard("MnIlaZoe", 5, 1, "Mars", "3+"),
  makeCharacterCard("MnIlaZoe", 5, 1, "Mars"),
  makeCharacterCard("MnIlaZoe", 5, 1, "Earth", "4"),
  makeCharacterCard("MnIlaZoe", 5, 1, "Earth"), 
];

function makeRoboticProjectCard(influence: number, megacredits: number, energy: number, initialLevel: number) {
  return { influence, megacredits, energy, initialLevel };
}
const projectCards: RoboticProjectCard[] = [
  makeRoboticProjectCard(5, 1, 0, 2),
  makeRoboticProjectCard(5, 0, 0, 4),
  makeRoboticProjectCard(0, 0, 1, 5),
  makeRoboticProjectCard(3, 1, 1, 1),
  makeRoboticProjectCard(9, 0, 0, 1),
  makeRoboticProjectCard(5, 2, 0, 1),
  makeRoboticProjectCard(4, 0, 1, 2),
  makeRoboticProjectCard(7, 1, 0, 1),
  makeRoboticProjectCard(4, 1, 0, 3),
  makeRoboticProjectCard(3, 3, 0, 2),
];

function setupTechnologies(ctx: Ctx, random: any): TechId[][] {
  const tech1: TechId = Math.floor(random.Number() * 2) === 0 ? "AutomatedDrilling" : "EarthMarsHighway";
  const tech2: TechId = Math.floor(random.Number() * 2) === 0 ? "CryptoExchange" : "AiClone";
  const tech3: TechId = Math.floor(random.Number() * 2) === 0 ? "Superconductivity" : "AutomatedAssembly";
  const tech4: TechId = Math.floor(random.Number() * 2) === 0 ? "RoboticSequencing" : "MemoryScanner";
  
  if (ctx.numPlayers === 4) {
    return [
      [tech1, tech1, tech1],
      [tech2, tech2, tech2],
      [tech3, tech3, tech3],
      [tech4, tech4, tech4],
    ];
  } else {
    return [
       [tech1, tech1],
       [tech2, tech2],
       [tech3, tech3],
       [tech4, tech4],
    ];
  }
}

function initPlayers(ctx: Ctx): Player[] {
  return ctx.playOrder.map((p, i) => ({
    playerID: p,
    track: null,
    influence: 0,
    characters: [],
    megacredits: 0,
    energy: 0,
    goalMarkers: 4,

    // maybe do not need these
    moonAssignemnts: ["Callisto", "Europa", "Ganymede", "Io"],
    robotModifiers: ["Builder", "Miner", "StarZ", "Technician"],
    
    moons: {
      "Callisto": 0,
      "Europa" : 0,
      "Ganymede": 0,
      "Io": 0,
    }
  }))
}

export function setup(ctx: Ctx, random: any): GalileoProjectGameState {
  const shuffledRobotCards = shuffle(random, robotCards);
  const usedCharacterCards = characterCards.filter(c =>
    !c.marker || 
    (c.marker === "3+" && ctx.numPlayers >= 3) || 
    (c.marker === "4" && ctx.numPlayers === 4)
  );
  const shuffledCharacterCards = shuffle(random, usedCharacterCards);

  const shuffledProjectCards = shuffle(random, projectCards);

  const robotsForSale = takeTopN(shuffledRobotCards, 5);
  const charactersForHire = takeTopN(shuffledCharacterCards, 5);

  const technologies = setupTechnologies(ctx, random);

  const goals = takeTopN(shuffle(random, allGoals), 4).map(goal => ({ goal, players: [] } as GoalTracker ));
  const starZASide = Math.floor(random.Number() * 2) === 0

  return {
    robotsForSale,
    charactersForHire,
    technologies,
    goals,
    starZASide,

    players : _.keyBy(initPlayers(ctx), p => p.playerID),
   
    secret: {
      robotDeck: shuffledRobotCards,
      characterDeck: shuffledCharacterCards,
      roboticProjectCards: shuffledProjectCards,
    }
  };
}