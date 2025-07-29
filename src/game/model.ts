import { FnContext, PlayerID } from 'boardgame.io';

export const moons = ['Io', 'Europa', 'Ganymede', 'Callisto'] as const;

export type Moon = (typeof moons)[number];

export type Track = 'Mars' | 'Earth';

export const robotTypes = ['Miner', 'Builder', 'StarZ', 'Technician'] as const;

export type RobotType = (typeof robotTypes)[number];

export interface RobotInPlay {
  type: RobotType;
  typeModified: boolean;
  
  moon1: Moon;
  moon2: Moon | null;  
  
  level: number;
  baseLevel: number;
}

export interface RobotCard {
  type: RobotType;
  // true if the type is from a modifier; can't have more than one
  typeModified: boolean;

  baseLevel: number;
  level: number;

  track: Track;
  baseCost: number;
  moon1: Moon;
  moon2: Moon | null;
}

export interface RoboticProjectCard {
  // initial resources given to player
  influence: number;
  megacredits: number;
  energy: number;

  baseLevel: number;
  level: number;

  // from modifiers
  type?: RobotType;
  moon1?: Moon;
  moon2?: Moon;
}

export interface RobotLevel {
  baseLevel: number;
  level: number;
}

export const characterIds = [
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
  'Nakkia',
  'MnLeonardSimon',
] as const;

export type CharacterId = (typeof characterIds)[number];
export type CharacterMarker = '4' | '3+';

export interface CharacterCard {
  name: CharacterId;
  baseInfluence: number;
  megacredits: number;
  immediateTrack: Track;
  marker?: CharacterMarker;
}

export const technologies = [
  'AutomatedDrilling',
  'EarthMarsHighway',

  'CryptoExchange',
  'AiClone',

  'Superconductivity',
  'AutomatedAssembly',

  'RoboticSequencing',
  'MemoryScanner',
] as const;

export type TechId = (typeof technologies)[number];

export interface TechnologySide {
  energy: number;
  megacredits: number;
  vp: number;
  techId: TechId;
}

export interface TechnologyCard {
  sideA: TechnologySide;
  sideB: TechnologySide;
}

export const allGoals = [
  'Control5RobotsWithDouble',
  'Control4RobotsLevel6',
  'Have4Characters',
  'Have8MegaCredits',
  'Develop4Technologies',
  'Reach6OnEachMoon',
  'Have4ModifiedRobots',
  'Control7RobotsSamecColor',
] as const;

export type GoalId = (typeof allGoals)[number];

export interface Player {
  playerID: PlayerID;
  influence: number;
  track: Track | null;
  characters: CharacterCard[];
  megacredits: number;
  energy: number;
  goalMarkers: number;
  moons: { [moon in Moon]: (RobotInPlay)[] };

  // 4 (initial) moon assignments, 4 (initial) robot modifier
  moonAssignemnts: Moon[];
  robotModifiers: RobotType[];

  roboticProject?: RoboticProjectCard;

  technologies: TechnologySide[];
  usedAutomtaedDrilling?: boolean;
  usedEarthMarsHighWay?: boolean;
}

export interface GoalTracker {
  goal: GoalId;
  players: PlayerID[];
}

export type CharacterAbility = 'Immediate' | 'EndOfGame';

export interface HireCharacterCtx {
  characterToHire: CharacterCard;
  ability: CharacterAbility[];
}

export interface AcquireRobotState {

}

export interface DevelopTechState {

}

export interface GalileoProjectGameState {
  secret: {
    robotDeck: RobotCard[];
    characterDeck: CharacterCard[];
    discardedCharacters: CharacterCard[];
    roboticProjectCards: RoboticProjectCard[];
  };

  // used at the start of the game to give people resources
  // take one, blank out the index
  initialResources: (RoboticProjectCard | null)[];

  players: { [key: string]: Player };

  robotsForSale: RobotCard[];
  charactersForHire: CharacterCard[];
  technologies: TechnologySide[][];
  goals: GoalTracker[];
  starZASide: boolean;

  // not sure if I really need to keep track of these...
  energy: number;
  megacredits: number;
  levels_1_2: number;
  levels_3_4: number;
  levels_5_6: number;
  levels_7: number;

  hireCharacterCtx?: HireCharacterCtx; 
}

export type GalileoProjectFnCtx = FnContext<GalileoProjectGameState>;
export type GalileoProjectMoveCtx = GalileoProjectFnCtx & {
  playerID: PlayerID;
};

export type EventsAPI = GalileoProjectFnCtx['events'];
