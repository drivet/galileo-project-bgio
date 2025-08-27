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

<style scoped>
</style>

<template>
  <h1>Galileo Project!</h1>
  <MainBoard v-if="stateRef?.G" :state="stateRef?.G" />
  <!--
  <InitialResources v-if="stateRef?.G.initialResources" @resourceSelected="(idx) => selectInitialResource(idx)"
    :cards="stateRef?.G.initialResources"></InitialResources>
  -->
  <!-- <vue-json-pretty :data="stateRef?.G" /> -->
</template>
