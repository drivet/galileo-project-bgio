<script lang="ts" setup>
import { Track } from '../game/model';

const props = defineProps<{
   trackPositions: { player: string, track: Track|null, influence: number }[],
}>()
</script>
<style scoped>

</style>
<template>
  <div class="influenceTrack">
    <span v-for="t in trackPositions"> ({{ t.player }}, {{ t.influence }}, {{ t.track }} )</span>
  </div>
</template>
