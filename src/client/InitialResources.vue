<script lang="ts" setup>
import { PropType } from 'vue';
import { RoboticProjectCard } from '../game/model';

const props = defineProps({
  cards: {
    type: Array as PropType<Array<RoboticProjectCard | null>>,
    required: true,
  },
});
const emit = defineEmits(['resourceSelected']);
</script>
<style>
.resource-card {
  width: 150px;
  height: 230px;
  border: 1px solid;
  border-radius: 5px;
}
</style>
<template>
  <div class="initial-resources row">
    <div class="resource-card-wrap" v-for="(c, idx) in cards">
      <div v-if="c" @click="$emit('resourceSelected', idx)" class="resource-card">
        <div class="resource-card__influence">
          {{ c.influence }}
        </div> 
        <div class="resource-card__credits">
          {{ c.megacredits }}
        </div>
        <div class="resource-card__energy">
          {{ c.energy }}
        </div>
        <div class="resource-card__level">
          {{ c.level }}
        </div>
      </div>
      <div v-else class="resource-card">
      </div>
    </div>
  </div>
</template>
