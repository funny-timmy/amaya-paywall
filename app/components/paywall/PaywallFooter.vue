<script setup lang="ts">
defineProps<{
  ctaLabel: string
  loading?: boolean
  /** Тарифы или доступ ещё грузятся — в кнопке только спиннер, без текста */
  preparing?: boolean
  disabled?: boolean
  error?: string | null
  restoring?: boolean
}>()

defineEmits<{ buy: []; restore: [] }>()
</script>

<template>
  <footer
    class="sticky bottom-0 flex flex-col items-center gap-1 bg-[linear-gradient(to_bottom,transparent,var(--color-screen)_24px)] pt-4 pr-[max(20px,env(safe-area-inset-right))] pb-[calc(16px+env(safe-area-inset-bottom))] pl-[max(20px,env(safe-area-inset-left))]"
  >
    <div v-if="error" class="w-full pb-2">
      <div role="alert" class="flex items-start gap-2.5 rounded-[14px] bg-danger-tint px-3.5 py-3">
        <span
          class="grid size-5 shrink-0 place-items-center rounded-full bg-danger text-[13px] leading-5 font-black text-white"
          aria-hidden="true"
        >
          !
        </span>
        <p class="text-sm leading-5 font-bold text-danger-fg">{{ error }}</p>
      </div>
    </div>

    <PrimaryButton :loading="loading || preparing" :disabled="disabled" @click="$emit('buy')">
      <span v-if="preparing" class="sr-only">Загружаем тарифы</span>
      <template v-else>{{ loading ? 'Оформляем…' : ctaLabel }}</template>
    </PrimaryButton>

    <button
      type="button"
      :disabled="loading || restoring"
      class="h-11 px-3 text-sm leading-[normal] font-bold text-fg-muted underline decoration-from-font [text-underline-position:from-font] enabled:active:opacity-70"
      @click="$emit('restore')"
    >
      Восстановить покупки
    </button>

    <p class="text-center text-xs leading-4 text-fg-muted">Тестовая покупка — деньги не списываются</p>
  </footer>
</template>
