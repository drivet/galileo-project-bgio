import { Server, Origins } from 'boardgame.io/server';
import { GalileoProjectGame } from './game/game';

const server = Server({
  games: [GalileoProjectGame],
  origins: [Origins.LOCALHOST],
});

server.run(8000);
