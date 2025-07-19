import { Game } from "boardgame.io";
import { GalileoProjectGameState } from "./model";
import { setup } from "./setup";
import { SelectResourcesPhase } from "./init-resources";


export type strOrNull = string|null;

export const GalileoProjectGame: Game<GalileoProjectGameState> = {
  name: "Galileo Project",

  setup: ({ctx, random}) => setup(ctx, random),

  phases: {
    selectResources: SelectResourcesPhase
  },

  moves: {},
  
  endIf: ({ G, ctx }) => {
   
  },
};
