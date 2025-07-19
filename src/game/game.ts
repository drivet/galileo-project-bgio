import { Game } from 'boardgame.io';

import { SelectResourcesPhase } from './init-resources';
import { GalileoProjectGameState } from './model';
import { setup } from './setup';

export type strOrNull = string | null;

export const GalileoProjectGame: Game<GalileoProjectGameState> = {
  name: 'Galileo Project',

  setup: ({ ctx, random }) => setup(ctx, random),

  phases: {
    selectResources: SelectResourcesPhase,
  },

  moves: {},

  endIf: ({ _G, _ctx }) => {},
};
