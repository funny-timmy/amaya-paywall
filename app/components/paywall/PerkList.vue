<script setup lang="ts">
const perks = [
  { icon: '📚', text: '120+ уровней и заданий' },
  { icon: '🚫', text: 'Никакой рекламы' },
  { icon: '✨', text: 'Новые игры каждую неделю' },
]
</script>

<template>
  <ul class="flex flex-col gap-2.5">
    <li v-for="perk in perks" :key="perk.text" class="flex items-center gap-3">
      <span
        class="grid size-7 shrink-0 place-items-center rounded-full bg-surface text-[15px] leading-[22px]"
        aria-hidden="true"
      >
        {{ perk.icon }}
      </span>
      <span class="text-base leading-[22px] font-bold">{{ perk.text }}</span>
    </li>
  </ul>
</template>
