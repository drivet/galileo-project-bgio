<script lang="ts" setup>
import { RobotCard } from '../game/model';

const props = defineProps<{
  card: RobotCard
}>()
</script>
<style scoped>

</style>
<template>
  <div class="card robot-card">
    <div class="robot-card__cost">
      {{ card.baseCost }}
    </div> 
    <div class="robot-card__type">
      {{ card.type }}
    </div>
    <div class="robot-card__moons">
      <div class="robot-card__moon">{{ card.moon1 }}</div>
      <div v-if="card.moon2" class="robot-card__moon">{{ card.moon2 }}</div>
    </div>
    <div class="robot-card__level">
      {{ card.level }}
    </div>
  </div>
</template>
