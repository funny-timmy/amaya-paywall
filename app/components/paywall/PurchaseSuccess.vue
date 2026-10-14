<script setup lang="ts">
const props = defineProps<{ planTitle: string; endsAt: string }>()
defineEmits<{ play: [] }>()

const endsAtLabel = computed(() =>
  new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(props.endsAt)),
)
</script>

<template>
  <section class="flex flex-1 flex-col" aria-live="polite">
    <div
      class="flex flex-1 flex-col items-center justify-center gap-3 py-10 pr-[max(28px,env(safe-area-inset-right))] pl-[max(28px,env(safe-area-inset-left))] text-center"
    >
      <div class="grid size-30 place-items-center rounded-full bg-success shadow-[0_0_0_14px_rgba(34,164,93,0.15)]">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
          <path d="M14 29L23 38L42 18" stroke="white" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h1 class="pt-5 text-[30px] leading-9 font-black text-balance">Готово! Всё открыто</h1>
      <p class="text-base leading-[22px] font-semibold text-fg-muted">
        Тариф «{{ planTitle }}» активен до {{ endsAtLabel }}. Совушка ждёт тебя на новых уровнях
      </p>
    </div>

    <footer
      class="flex flex-col items-center gap-1 pt-4 pr-[max(20px,env(safe-area-inset-right))] pb-[calc(16px+env(safe-area-inset-bottom))] pl-[max(20px,env(safe-area-inset-left))]"
    >
      <PrimaryButton @click="$emit('play')">Играть!</PrimaryButton>
      <p class="pt-2 text-center text-xs leading-4 text-fg-muted">Покупка сохранена на этом устройстве</p>
    </footer>
  </section>
</template>
