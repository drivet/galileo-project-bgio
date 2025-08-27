<script lang="ts" setup>
import { GoalTracker } from '../game/model';

const props = defineProps<{
  goalTracker: GoalTracker
}>()
</script>

<style scoped>
</style>

<template>
  <div class="goal">
    <div class="goal__type">
      {{ goalTracker.goal }}
    </div>
    <div class="goal__players">
      <span v-for="p in goalTracker.players">{{ p }}, </span>
    </div>
  </div>
</template>
