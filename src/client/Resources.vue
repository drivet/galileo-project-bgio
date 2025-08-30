<script lang="ts" setup>
import { GalileoProjectGameState } from '../game/model';

const props = defineProps<{
  G: GalileoProjectGameState
}>()
</script>
<style>
</style>
<template>
  <div class="resources">
    <div class="resources__robot-deck">
      Robots: {{ G.secret.robotDeck.length }}
    </div> 
    <div class="resources__character-deck">
      Characters: {{ G.secret.characterDeck.length }}
    </div>
    <div class="resources__project-deck">
      Projects: {{ G.secret.roboticProjectCards.length }}
    </div>   
    <div class="resources__energy">
      Energy: {{ G.energy }}
    </div>
    <div class="resources__levels">
      <div>Level 1-2: {{ G.levels_1_2 }}</div>
      <div>Level 3-4: {{ G.levels_3_4 }}</div>
      <div>Level 5-6: {{ G.levels_5_6 }}</div>
      <div>Level 7: {{ G.levels_7 }}</div>
    </div>
    <div class="resources__megacredits">
      Credits: {{ G.megacredits }}
    </div> 
  </div>
</template>
