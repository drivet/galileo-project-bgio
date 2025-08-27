<script lang="ts" setup>
import { PropType } from 'vue';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import { RoboticProjectCard } from '../game/model';

const props = defineProps({
  cards: {
    type: Array as PropType<Array<RoboticProjectCard | null>>,
    required: true,
  },
});
const emit = defineEmits(['resourceSelected']);
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
    <div v-for="(c, idx) in cards">
      <vue-json-pretty @click="$emit('resourceSelected', idx)" v-if="c !== null" 
        class="card character" 
        :data="c" />
      <div v-else class="card" ></div>
    </div>
  </div>

</template>
