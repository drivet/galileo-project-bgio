<script lang="ts" setup>
import { ref } from 'vue';

import { Client } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer';
import { TicTacToe, TicTacToeGameState } from '../game/game';
import { State } from 'boardgame.io';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const playerID = urlParams.get('player');

const client = Client<TicTacToeGameState>({
  game: TicTacToe,
  multiplayer: SocketIO({ server: 'localhost:8000' }),
  playerID: playerID ? playerID : undefined,
});
client.start();

let stateRef = ref(null as (State<TicTacToeGameState> | null) );
client.subscribe((state: State<TicTacToeGameState> | null) => stateRef.value = state);

function cellClick(event: MouseEvent) {
 if (!(event.target instanceof HTMLElement)) {
    return;
  }
  const id = parseInt(event.target.dataset.id || "-1");
  client.moves.clickCell(id);
}
</script>

<template>
  <table>
    <tbody>
      <tr>
        <td class="cell" data-id="0" @click="cellClick">{{ stateRef?.G.cells[0] }}</td>
        <td class="cell" data-id="1" @click="cellClick">{{ stateRef?.G.cells[1] }}</td>
        <td class="cell" data-id="2" @click="cellClick">{{ stateRef?.G.cells[2] }}</td>
      </tr>
      <tr>
        <td class="cell" data-id="3" @click="cellClick">{{ stateRef?.G.cells[3] }}</td>
        <td class="cell" data-id="4" @click="cellClick">{{ stateRef?.G.cells[4] }}</td>
        <td class="cell" data-id="5" @click="cellClick">{{ stateRef?.G.cells[5] }}</td>
      </tr> 
      <tr>
        <td class="cell" data-id="6" @click="cellClick">{{ stateRef?.G.cells[6] }}</td>
        <td class="cell" data-id="7" @click="cellClick">{{ stateRef?.G.cells[7] }}</td>
        <td class="cell" data-id="8" @click="cellClick">{{ stateRef?.G.cells[8] }}</td>
      </tr>
    </tbody>
  </table>
  <p v-if="stateRef?.ctx.gameover?.winner" class="winner">
    Winner: {{ stateRef?.ctx.gameover.winner }}
  </p>
  <p v-else-if="stateRef?.ctx.gameover" class="winner">Draw!</p>
</template>
