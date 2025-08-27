<script lang="ts" setup>
import { CharacterCard } from '../game/model';
import CharacterCardComp from './CharacterCard.vue';

const props = defineProps<{
  cards: (CharacterCard | null)[]
}>()
</script>
<style scoped>
.card-row {
  display: flex;
}

</style>
<template>
  <div class="card-row">
    <div v-for="c in cards">
      <CharacterCardComp v-if="c" :card="c" />
      <div v-else class="card" ></div>
    </div>
  </div>
</template>
