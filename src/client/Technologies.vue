<script lang="ts" setup>
import { TechnologySide } from '../game/model';
import TechnologyTile from './TechnologyTile.vue';

const props = defineProps<{
  tech: (TechnologySide[]|null)[]
}>()
</script>
<style scoped>
.tech-coloumn {
  display: flex;
  flex-direction: column;
}
</style>
<template>
  <div class="tech-coloumn ">
    <div v-for="t in tech">
      <TechnologyTile v-if="t" :side="t[0]"></TechnologyTile>
      <div v-else class="tech" ></div>
    </div>
  </div>
</template>
