<script lang="ts" setup>
import { TechnologySide } from '../game/model';
import TechnologyTile from './TechnologyTile.vue'

const props = defineProps<{
  side: TechnologySide
}>()
</script>
<style scoped>

</style>
<template>
  <div class="tile">
    <div class="tile__type">
      {{ side.techId }}
    </div> 
    <div class="tile__energy">
      {{ side.energy }}
    </div>
    <div class="tile__credits">
      {{ side.megacredits }}
    </div>
    <div class="tile__vp">
      {{ side.vp }}
    </div>
  </div>
</template>
