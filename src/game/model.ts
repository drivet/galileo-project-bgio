import { Ctx, PlayerID } from "boardgame.io";

const moons = [
  'Io',
  'Europa',
  'Ganymede',
  'Callisto',
] as const;

export type Moon = typeof moons[number];

export type Track = 'Mars' | 'Earth';

const robotTypes = [
  'Miner',
  'Builder',
  'StarZ',
  'Technician',
] as const;

export type RobotType = typeof robotTypes[number];

export interface RobotCard {
  type: RobotType;
  track: Track;
  baseCost: number;
  moon1: Moon;
  moon2: Moon | null;
  initialLevel: number;
}

const characterIds = [
  'MsChau',
  'MnDiatExpi',
  'MnMilutinMadic',
  'MnHunterPerks',
  'MnEliotBan',
  'TarakFreeman',
  'Noor',
  'MnIlaZoe',
  'MartySimon',
  'MsLee',
  "Nakkia",
  "MnLeonardSimon"
] as const;

export type CharacterId = typeof characterIds[number];
export type CharacterMarker = "4" | "3+";

export interface CharacterCard {
  name: CharacterId;
  baseInfluence: number;
  megacredits: number;
  topTrack: Track;
  marker?: CharacterMarker;
}

const technologies = [
  'AutomatedDrilling',
  'EarthMarsHighway',

  'CryptoExchange',
  'AiClone',
  
  'Superconductivity',
  'AutomatedAssembly',
  
  'RoboticSequencing',
  'MemoryScanner'
] as const;

export type TechId = typeof technologies[number];

export interface TechnologyCard {
  sideA: TechId;
  sideB: TechId;
}

export interface RoboticProjectCard {
  influence: number;
  megacredits: number;
  energy: number;
  initialLevel: number;

  // needed to fill this out
  type?: RobotType;
  moon1?: Moon;
  moon2?: Moon;
}

export const allGoals = [
  'Control5RobotsWithDouble',
  'Control4RobotsLevel6',
  'Have4Characters',
  'Have8MegaCredits',
  'Develop4Technologies',
  'Reach6OnEachMoon',
  'Have4ModifiedRobots',
  'Control7RobotsSamecColor'
] as const;

export type GoalId = typeof allGoals[number];

export interface Player {
  playerID: PlayerID;
  influence: number;
  track: Track | null;
  characters: CharacterCard[];
  megacredits: number;
  energy: number;
  goalMarkers: number;
  moons:  { [moon in Moon]: number; }

  // 4 moon assignments, 4 robot modifier
  // Maybe don't need these as we can figure things out
  // from the state of project cards
  moonAssignemnts: Moon[];
  robotModifiers: RobotType[];

  roboticProjects: RoboticProjectCard[];
}

export interface GoalTracker {
  goal: GoalId;
  players: PlayerID[];
}

export interface GalileoProjectGameState {
  secret: {
    robotDeck: RobotCard[];
    characterDeck: CharacterCard[];
    roboticProjectCards: RoboticProjectCard[];
  };

  // used at the start of the game to give people resources
  // take one, blank out the index
  initialResources: (RoboticProjectCard|null)[];

  players: { [key: string]: Player };

  robotsForSale: RobotCard[];
  charactersForHire: CharacterCard[];
  technologies: TechId[][];
  goals: GoalTracker[];
  starZASide: boolean;
}

export type GalileoProjectFnCtx = { G: GalileoProjectGameState, ctx: Ctx };
export type GalileoProjectMoveCtx = GalileoProjectFnCtx & { playerID: PlayerID };