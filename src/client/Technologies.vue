<script lang="ts" setup>
import { PropType } from 'vue';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import { TechnologySide } from '../game/model';

const props = defineProps({
  tech: {
    type: Array as PropType<Array<Array<TechnologySide> | null>>,
    required: true,
  },
})
</script>
<style scoped>
.tech-coloumn {
  display: flex;
  flex-direction: column;
}
.tech {
  width: 270px;
}

</style>
<template>
  <div class="tech-coloumn ">
    <div v-for="t in tech">
      <vue-json-pretty v-if="t !== null" 
        class="tech" :data="t[0]" />
      <div v-else class="tech" ></div>
    </div>
  </div>
</template>
