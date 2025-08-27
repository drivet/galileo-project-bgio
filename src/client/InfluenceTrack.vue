<script lang="ts" setup>
import { Track } from '../game/model';

const props = defineProps<{
   trackPositions: { player: string, track: Track|null, influence: number }[],
}>()
</script>
<style>
.influence-track {
  margin: var(--gap);
}
</style>
<template>
  <div class="influence-track">
    <span v-for="t in trackPositions"> ({{ t.player }}, {{ t.influence }}, {{ t.track }} )</span>
  </div>
</template>
