<script lang="ts" setup>
import { CharacterCard } from '../game/model';

const props = defineProps<{
  aSide: boolean
}>();

function getSide(aSide: boolean): string {
  return aSide ? 'A' : 'B';
}
</script>
<style>
.star-z-track {
  border: 1px solid;
}
.star-z-track__side {
  width: 100%;
  height: 20%;
}
.star-z-track__bonus-1,
.star-z-track__bonus-2,
.star-z-track__bonus-3,
.star-z-track__bonus-4,
.star-z-track__bonus-5 {
  width: 100%;
  height: 16%;
}
</style>
<template>
  <div class="star-z-track">
    <div class="star-z-track__side">
      {{ getSide(aSide) }}
    </div> 
    <div class="star-z-track__bonus-1">
    </div>
    <div class="star-z-track__bonus-2">
    </div> 
    <div class="star-z-track__bonus-3">
    </div>
    <div class="star-z-track__bonus-4">
    </div>
    <div class="star-z-track__bonus-5">
    </div>
  </div>
</template>
