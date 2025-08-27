<script lang="ts" setup>
import { Track } from '../game/model';

interface TrackPos {
  player: string;
  track: Track|null;
  influence: number;
}
const props = defineProps<{
   trackPositions: TrackPos[],
}>();

function getPlayers(trackPositions: TrackPos[], influence: number, track: Track|null): string[] {
  return trackPositions.filter(t => t.influence === influence && t.track === track).map(t => t.player);
}

</script>
<style>
.influence-track__switch-reminder {
  width: 7.6923%;
}
.influence-track__zero {
  width: 7.6923%;
  justify-content: center;
}
.influence-track__plus {
  width: 7.6923%;
}
.influence-track__credit-reminder {
  width: 7.6923%;
}
.influence-track__earth-wrap {
  width: 100%;
  height: 50%;
}
.influence-track__mars-wrap {
  width: 100%;
  height: 50%;
}

.influence-track__zero-pos,
.influence-track__earth-pos,
.influence-track__mars-pos {
  aspect-ratio: 1/1;
  width: 100%;
  border-radius: 50%;
  border: 3px solid;
}

.influence-track__earth-pos {
  border-color: blue;
}

.influence-track__mars-pos {
  border-color: red;
}
</style>
<template>
  <div class="influence-track row">
    <div class="influence-track__switch-reminder"></div>
    <div class="influence-track__zero column">
      <div class="influence-track__zero-pos">
        <div>0</div>
        <span v-for="p in getPlayers(trackPositions, 0, null)">{{ p }}, </span>
      </div>
    </div>
    <div class="influence-track__plus col" v-for="idx in 10">
      <div class="influence-track__earth-wrap">
        <div class="influence-track__earth-pos">
          <div>{{ idx }}</div>
          <span v-for="p in getPlayers(trackPositions, idx, 'Earth')">{{ p }}, </span>
        </div>
      </div>
      <div class="influence-track__mars-wrap">
        <div class="influence-track__mars-pos">
          <div>{{ idx }}</div>
          <span v-for="p in getPlayers(trackPositions, idx, 'Mars')">{{ p }}, </span>
        </div>
      </div>
    </div>
    <div class="influence-track__credit-reminder"></div>
  </div>
</template>
