<script lang="ts" setup>
import { GalileoProjectGameState, Player, Track } from '../game/model';
import Goals from './Goals.vue';
import InfluenceTrack from './InfluenceTrack.vue';
import RobotsForSale from './RobotsForSale.vue';
import CharactersForHire from './CharactersForHire.vue';
import Technologies from './Technologies.vue';
import StarZTrack from './StarZTrack.vue';

const props = defineProps<{
  state: GalileoProjectGameState
}>();

interface TrackPos {
  influence: number;
  track: Track | null;
  player: string;
}
function trackPos(state: GalileoProjectGameState): TrackPos[] {
  return Object.values(state.players)
    .map(p => ({player: p.playerID, track: p.track, influence: p.influence}));
}
const emit = defineEmits(['trackSelected']);
</script>

<style>
.main-board {
  width: 1200px;
  height: 600px;
}
.main-board__goals-wrap {
  width: 12%;
  padding: 5px;
}

.main-board__goals {
  height: 100%;
}

.main-board__tech-wrap {
  width: 13%;
  padding: 5px;
}

.main-board__tech {
  height: 100%;
}

.main-board__starz-wrap {
  width: 8%;
  justify-content: center;
}

.main-board__strip-track {
  width: 67%;
}

.main-board__robot-strip-wrap {
  height: 40%;
}

.main-board__robot-strip {
  width: 100%;
  height: 100%;
}

.main-board__influence-track-wrap {
  height: 20%;
  width: 100%;
  justify-content: center;

}
.main-board__influence-track {
  height: 100%;
  width: 83.33%;
}
.main-board__character-strip-wrap {
  height: 40%;
}

.main-board__character-strip {
  width: 100%;
  height: 100%;
}
.main-board__starz {
  width: 50%;
  height: 50%;
}
</style>

<template>
  <div class="main-board row">
    <div class="main-board__goals-wrap">
      <Goals class="main-board__goals" :goals="state.goals"/>
    </div>
  
    <div class="main-board__tech-wrap">
      <Technologies class="main-board__tech" :tech="state.technologies" />
    </div>

    <div class="main-board__starz-wrap row">
      <StarZTrack class="main-board__starz" :aSide="state.starZASide" />
    </div>
   
    <div class="main-board__strip-track column">
      <div class="main-board__robot-strip-wrap">
        <RobotsForSale class="main-board__robot-strip" :cards="state.robotsForSale" :pile="state.secret.robotDeck.length"/>
      </div>

      <div class="main-board__influence-track-wrap row">
        <InfluenceTrack class="main-board__influence-track"
          @trackSelected="(track) => $emit('trackSelected', track)"
          :trackPositions="trackPos(state)"/>
      </div>
     
      <div class="main-board__character-strip-wrap">
        <CharactersForHire class="main-board__character-strip" :cards="state.charactersForHire"/>
      </div>
    </div>
</div>
</template>