<script setup lang="ts">
defineProps<{ retrying?: boolean }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    role="alert"
    class="flex min-h-[164px] flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-card-border bg-surface px-5 py-[27px] text-center"
  >
    <p class="text-[17px] leading-[normal] font-extrabold">Не удалось загрузить тарифы</p>
    <p class="text-sm leading-[normal] font-semibold text-fg-muted">Проверь интернет и попробуй снова</p>
    <div class="pt-1">
      <button
        type="button"
        :disabled="retrying"
        class="h-11 rounded-[14px] border-2 border-fg bg-surface px-5 text-[15px] leading-[normal] font-extrabold transition-opacity enabled:active:opacity-70 disabled:opacity-60"
        @click="$emit('retry')"
      >
        Попробовать снова
      </button>
    </div>
  </div>
</template>
