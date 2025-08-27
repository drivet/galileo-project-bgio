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

<style scoped>
.row {
  display: flex;
}
</style>

<template>
 <div class="row">
   <Goals :goals="state.goals"/>
   <Technologies :tech="state.technologies" />
   <div>
      <RobotsForSale :cards="state.robotsForSale"/>
      <InfluenceTrack 
        :trackPositions="Object.values(state.players).map(p => ({player: p.playerID, track: p.track, influence: p.influence}))"/>
      <CharactersForHire :cards="state.charactersForHire"/>
   </div>
</div>
</template>