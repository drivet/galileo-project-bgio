<script lang="ts" setup>
import { Player } from '../game/model';

const props = defineProps<{
  player: Player
}>();
</script>

<style>
</style>

<template>
  <section class="player-summary">
    <h2 class="player-summer__header">Player {{ player.playerID }}</h2>
    <div class="player-summer__resources">
      
    </div>
  </section>
</template>
