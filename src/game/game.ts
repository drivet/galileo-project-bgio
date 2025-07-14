import { Game, PlayerID } from "boardgame.io";
import { INVALID_MOVE } from 'boardgame.io/core';
import { GalileoProjectGameState } from "./model";
import { setup } from "./setup";


export type strOrNull = string|null;

export const GalileoProjectGame: Game<GalileoProjectGameState> = {
  name: "Galileo Project",
  
  setup: ({ctx, random}) => setup(ctx, random),

  moves: {}, 
  
  endIf: ({ G, ctx }) => {
   
  },
};
