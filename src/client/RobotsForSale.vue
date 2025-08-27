<script lang="ts" setup>
import { RobotCard } from '../game/model';
import RobotCardComp from './RobotCard.vue';

const props = defineProps<{
  cards: (RobotCard | null)[]
}>()
</script>
<style scoped>
.card-row {
  display: flex;
  width: 1100px;
}

</style>
<template>
  <div class="card-row">
    <div v-for="c in cards">
      <RobotCardComp v-if="c" :card="c" />
      <div v-else class="card" ></div>
    </div>
  </div>
</template>
