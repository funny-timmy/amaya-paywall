<script setup lang="ts">
defineProps<{
  loading?: boolean
  disabled?: boolean
}>()
</script>

<template>
  <button
    type="button"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    class="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl text-lg leading-[normal] font-black text-white transition-[transform,box-shadow] duration-75"
    :class="
      disabled || loading
        ? 'bg-accent-disabled shadow-[0_4px_0_var(--color-accent-disabled-press)]'
        : 'bg-accent shadow-[0_4px_0_var(--color-accent-press)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-accent-press)]'
    "
  >
    <span
      v-if="loading"
      class="size-5 animate-spin-fast rounded-full border-3 border-white/45 border-t-white"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
