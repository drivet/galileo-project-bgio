<script lang="ts" setup>
import { CharacterCard } from '../game/model';
import CharacterCardComp from './CharacterCard.vue';

const props = defineProps<{
  cards: (CharacterCard | null)[]
}>()
</script>
<style>
.character-strip__card-wrap {
  width: 20%;
  padding: 5px;
}
.character-card {
  width: 100%;
  height: 100%;
}
</style>
<template>
  <div class="character-strip row">
    <div class="character-strip__card-wrap" v-for="c in cards">
      <CharacterCardComp class="character-card" v-if="c" :card="c" />
      <div v-else class="card" ></div>
    </div>
  </div>
</template>
