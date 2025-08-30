<script lang="ts" setup>
import { RobotCard } from '../game/model';
import RobotCardComp from './RobotCard.vue';

const props = defineProps<{
  cards: (RobotCard | null)[];
  pile: number;
}>()
</script>
<style>
.robot-strip__card-wrap {
  width: 20%;
  padding: 5px;
}

.robot-card {
  width: 100%;
  height: 100%;
}

</style>
<template>
  <div class="robot-strip row">
    <div class="robot-strip__card-wrap" v-for="c in cards">
      <RobotCardComp class="robot-card" v-if="c" :card="c" />
      <div v-else class="card" ></div>
    </div>
   
  </div>
</template>
