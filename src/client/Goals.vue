<script lang="ts" setup>
import { PropType } from 'vue';
import { GoalTracker } from '../game/model';

const props = defineProps({
  goals: {
    type: Array as PropType<Array<GoalTracker> | null>,
    required: true,
  },
})

function points(goal: number, pos: number) {
  if (goal === 0) {
    if (pos === 0) {
      return 6;
    } else if (pos === 1) {
      return 4;
    } else {
      return 2;
    }
  } else if (goal === 1) {
    if (pos === 0) {
      return 5;
    } else if (pos === 1) {
      return 4;
    } else {  
      return 3;
    }
  } else if (goal === 2) {
    if (pos === 0) {
      return 5;
    } else if (pos === 1) {
      return 3;
    } else {  
      return 1;
    }
  } else {
    if (pos === 0) {
      return 4;
    } else if (pos === 1) {
      return 3;
    } else {
      return 2;
    }
  }
}
</script>
<style>
.goals__discount-reminder {
  height: 6%;
}
.goals__goal-wrap {
  height: 23.5%;
}

.goals__type {
  height: 50%;
}
.goals__players {
  height: 50%;
}
.goals__marker {
  width: 33.33%;
}
</style>
<template>
  <div class="goals column">
    <div class="goals__discount-reminder">

    </div>
    <div class="goals__goal-wrap col" v-for="(g, idx) in goals">
      <div class="goals__type">
        {{ g.goal }}
      </div>
      <div class="goals__players row">
        <div class="goals__marker"> {{ points(idx, 0) }}</div>
        <div class="goals__marker"> {{ points(idx, 1) }}</div>
        <div class="goals__marker"> {{ points(idx, 2) }}</div>
      </div>
    </div>
  </div>
</template>
