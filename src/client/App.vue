<script lang="ts" setup>
import { ref } from 'vue';

import { Client } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer';
import { GalileoProjectGame } from '../game/game';
import { State } from 'boardgame.io';
import { GalileoProjectGameState } from '../game/model';
import InitialResources from './InitialResources.vue';
import MainBoard from './MainBoard.vue';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const playerID = urlParams.get('player');

const client = Client<GalileoProjectGameState>({
  game: GalileoProjectGame,
  //multiplayer: SocketIO({ server: 'localhost:8000' }),
  playerID: playerID ? playerID : undefined,
});
client.start();

let stateRef = ref(null as (State<GalileoProjectGameState> | null) );
client.subscribe((state: State<GalileoProjectGameState> | null) => stateRef.value = state);

function selectInitialResource(idx: number) {
  client.moves.ChooseInitialResources(idx);
}
</script>

<style>
.initial-resources-wrap {
  justify-content: center;
}
</style>

<template>
  <MainBoard v-if="stateRef?.G" :state="stateRef?.G" />

  <div v-if="stateRef?.G.initialResources" class="initial-resources-wrap row">
    <InitialResources @resourceSelected="(idx) => selectInitialResource(idx)"
      :cards="stateRef?.G.initialResources"/>
  </div>
</template>
