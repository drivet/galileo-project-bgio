<script lang="ts" setup>
import { GalileoProjectGameState } from '../game/model';
import Goals from './Goals.vue';
import InfluenceTrack from './InfluenceTrack.vue';
import RobotsForSale from './RobotsForSale.vue';
import CharactersForHire from './CharactersForHire.vue';
import Technologies from './Technologies.vue';

const props = defineProps<{
  state: GalileoProjectGameState
}>()
</script>

<style>
.main-board {
  width: 1200px;
  height: 600px;
}
.main-board__goals-wrap {
  width: 12%;
}

.main-board__goals {
  height: 100%;
}

.main-board__tech-wrap {
  width: 13%;
}

.main-board__tech {
  height: 100%;
}

.main-board__starz {
  width: 8%;
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

.main-board__influence-track {
  height: 20%;
}

.main-board__character-strip-wrap {
  height: 40%;
}

.main-board__character-strip {
  width: 100%;
  height: 100%;
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

    <div class="main-board__starz">

    </div>
   
    <div class="main-board__strip-track column">
      <div class="main-board__robot-strip-wrap">
        <RobotsForSale class="main-board__robot-strip" :cards="state.robotsForSale"/>
      </div>

      <div class="main-board__influence-track">
        <InfluenceTrack 
          :trackPositions="Object.values(state.players).map(p => ({player: p.playerID, track: p.track, influence: p.influence}))"/>
      </div>
     
      <div class="main-board__character-strip-wrap">
        <CharactersForHire class="main-board__character-strip" :cards="state.charactersForHire"/>
      </div>
    </div>
</div>
</template>