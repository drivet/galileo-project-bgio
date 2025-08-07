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
  track?: Track;
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

  pick4Robots?: RobotCard[];
}


export interface GoalTracker {
  goal: GoalId;
  players: PlayerID[];
}

export type CharacterAbility = 'Immediate' | 'EndOfGame';


/**
 * This is set the the current character being "processed".  
 * The character could have been
 * - hired
 * - chosen among the first X for a Builder resolution
 * - the first character from a Star Z A side resolution
 * 
 * Being processed means you are resolving their immediate effect,
 * or you need to move it to your character roster.
 */
export interface CharacterCtx {
  kind: 'characterToUse'
  character: CharacterCard;
}

/**
 * Use this when you need to resolve a robot ability before placing
 * the robot on the moon.
 */
export interface AcquireRobotCtx {
  kind: 'robotToPlace';
  robotToPlace: RobotInPlay;
}

export interface DevelopTechCtx {
  kind: 'techToKeep';
  techToKeep: TechnologySide;
}

export type ActionCtx = CharacterCtx | AcquireRobotCtx | DevelopTechCtx;

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

  robotsForSale: (RobotCard | null)[];
  charactersForHire: (CharacterCard | null)[];
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

  actionCtx: ActionCtx[];
}

export type GalileoProjectFnCtx = FnContext<GalileoProjectGameState>;
export type GalileoProjectMoveCtx = GalileoProjectFnCtx & {
  playerID: PlayerID;
};

export type EventsAPI = GalileoProjectFnCtx['events'];
export interface RandomAPI {
    D4(): number;
    D4(diceCount: number): number[];
    D6(): number;
    D6(diceCount: number): number[];
    D10(): number;
    D10(diceCount: number): number[];
    D12(): number;
    D12(diceCount: number): number[];
    D20(): number;
    D20(diceCount: number): number[];
    Die(spotvalue?: number): number;
    Die(spotvalue: number, diceCount: number): number[];
    Number(): number;
    Shuffle<T>(deck: T[]): T[];
}
