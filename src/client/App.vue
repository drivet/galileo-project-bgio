<script lang="ts" setup>
import { ref } from 'vue';

import { Client } from 'boardgame.io/client';
import { Local, SocketIO } from 'boardgame.io/multiplayer';
import { GalileoProjectGame } from '../game/game';
import { State } from 'boardgame.io';
import { GalileoProjectGameState, Track } from '../game/model';
import InitialResources from './InitialResources.vue';
import Resources from './Resources.vue';
import MainBoard from './MainBoard.vue';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const playerID = urlParams.get('player');

const client = Client<GalileoProjectGameState>({
  game: GalileoProjectGame,
  //multiplayer: SocketIO({ server: 'localhost:8000' }),
  multiplayer: Local({persist: true, storageKey: 'bgio'}),
  playerID: playerID ? playerID : undefined,
});
client.start();

let stateRef = ref(null as (State<GalileoProjectGameState> | null) );
client.subscribe((state: State<GalileoProjectGameState> | null) => stateRef.value = state);

function selectInitialResource(idx: number) {
  client.moves.ChooseInitialResources(idx);
}

function selectTrack(track: Track) {
  const state = client.getState();
  if (!state) {
    return;
  }
  const ctx = state.ctx;
  if (!ctx.activePlayers) {
    return;
  }
  const stage = ctx.activePlayers[ctx.currentPlayer];
  if (stage !== 'InfluenceSwitch') {
    return;
  }
  const G = state.G;
  const player = G.players[ctx.currentPlayer];
  if (player.track === null && player.influence > 0) {
    client.moves.ChooseTrack(track);
  }
}
</script>

<style>
.initial-resources-wrap {
  justify-content: center;
}
.galileo-app {
  width: 1920px;
  height: 1080px;
}
</style>

<template>
  <div class="galileo-app" v-if="stateRef">
    <div class="row">
      <MainBoard v-if="stateRef.G"
        @trackSelected="(track) => selectTrack(track)"
        :state="stateRef.G" />
      <Resources :G="stateRef.G"></Resources>
    </div>
    <div v-if="stateRef.G.initialResources" class="initial-resources-wrap row">
      <InitialResources @resourceSelected="(idx) => selectInitialResource(idx)"
        :cards="stateRef.G.initialResources"/>
    </div>
  </div>
</template>
