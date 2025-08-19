<script lang="ts" setup>
import { PropType } from 'vue';
import { CharacterCard } from '../game/model';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

const props = defineProps({
  cards: {
    type: Array as PropType<Array<CharacterCard | null>>,
    required: true,
  },
})
</script>
<style scoped>
.card-row {
  display: flex;
}
.card {
  width: 250px;
}
</style>
<template>
  <div class="card-row">
    <div v-for="c in cards">
      <vue-json-pretty v-if="c !== null" 
        class="card character" 
        :data="c" />
      <div v-else class="card" ></div>
    </div>
  </div>
</template>
