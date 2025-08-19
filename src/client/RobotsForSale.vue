<script lang="ts" setup>
import { PropType } from 'vue';
import { RobotCard } from '../game/model';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

const props = defineProps({
  cards: {
    type: Array as PropType<Array<RobotCard | null>>,
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
.mars {
  background-color: #FFB3A7;
}
.earth {
  background-color: #D5FFFF;
}
</style>
<template>
  <div class="card-row">
    <div v-for="c in cards">
      <vue-json-pretty v-if="c !== null" 
        class="card robot" :class="{ mars: c.track === 'Mars', earth: c.track === 'Earth' }" 
        :data="c" />
      <div v-else class="card" ></div>
    </div>
  </div>
</template>
