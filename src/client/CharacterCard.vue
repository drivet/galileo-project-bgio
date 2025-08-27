<script lang="ts" setup>
import { CharacterCard } from '../game/model';

const props = defineProps<{
  card: CharacterCard
}>()
</script>
<style scoped>

</style>
<template>
  <div class="card character-card">
    <div class="character-card__influence">
      {{ card.baseInfluence }}
    </div> 
    <div class="character-card__name">
      {{ card.name }}
    </div>
    <div class="robot-card__credits">
      {{ card.megacredits }}
    </div>
    <div class="robot-card__immediate">
      {{ card.immediateTrack }}
    </div>
  </div>
</template>
