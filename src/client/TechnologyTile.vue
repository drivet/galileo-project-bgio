<script lang="ts" setup>
import { TechnologySide } from '../game/model';

const props = defineProps<{
  side: TechnologySide | null
}>()
</script>
<style>

.tile {
  border: 1px solid;
  border-radius: 10px;
  font-size: smaller;
  aspect-ratio: 3 / 2;
}

</style>
<template>
  <div v-if="side" class="tile">
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
  <div v-else>
  </div>
</template>
