<script lang="ts" setup>
import { ref } from 'vue';

import { Client } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer';
import { GalileoProjectGame } from '../game/game';
import { State } from 'boardgame.io';
import { GalileoProjectGameState } from '../game/model';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const playerID = urlParams.get('player');

const client = Client<GalileoProjectGameState>({
  game: GalileoProjectGame,
  multiplayer: SocketIO({ server: 'localhost:8000' }),
  playerID: playerID ? playerID : undefined,
});
client.start();

let stateRef = ref(null as (State<GalileoProjectGameState> | null) );
client.subscribe((state: State<GalileoProjectGameState> | null) => stateRef.value = state);

</script>

<template>

</template>
