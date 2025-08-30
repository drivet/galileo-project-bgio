<script lang="ts" setup>
import { TechnologySide } from '../game/model';
import TechnologyTile from './TechnologyTile.vue';

const props = defineProps<{
  tech: (TechnologySide[]|null)[]
}>()
</script>
<style>

.technologies__tile-wrap {
  height: 25%;
  justify-content: center;
}

</style>
<template>
  <div class="technologies column">
    <div class="technologies__tile-wrap column" v-for="t in tech">
      <TechnologyTile :side="t ? t[0]: null" />
    </div>
  </div>
</template>
