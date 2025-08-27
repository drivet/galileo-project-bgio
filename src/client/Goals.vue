<script lang="ts" setup>
import { PropType } from 'vue';
import { GoalTracker } from '../game/model';
import Goal from './Goal.vue';

const props = defineProps({
  goals: {
    type: Array as PropType<Array<GoalTracker> | null>,
    required: true,
  },
})
</script>
<style scoped>
.goal-coloumn {
  display: flex;
  flex-direction: column;
}
</style>
<template>
  <div class="goal-coloumn ">
    <div v-for="g in goals">
      <Goal :goal-tracker="g" />
    </div>
  </div>
</template>
