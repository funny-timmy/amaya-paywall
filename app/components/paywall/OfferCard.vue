<script setup lang="ts">
import type { Offer } from '#shared/types/paywall'

const props = defineProps<{
  offer: Offer
  selected: boolean
  disabled?: boolean
}>()

defineEmits<{ select: [] }>()

const price = computed(() => formatMoney(props.offer.price))
const priceNote = computed(() => {
  if (props.offer.pricePerMonth) return `${formatMoney(props.offer.pricePerMonth)} в месяц`
  return props.offer.durationMonths === 1 ? 'в месяц' : ''
})
</script>

<template>
  <button
    type="button"
    role="radio"
    :aria-checked="selected"
    :disabled="disabled"
    class="relative flex min-h-[76px] w-full items-center gap-3 rounded-[20px] border-2 p-4 text-left transition-[background-color,border-color,transform] duration-150 enabled:active:scale-[0.99]"
    :class="
      selected
        ? 'border-accent bg-accent-tint shadow-[inset_0_0_0_2px_var(--color-accent)]'
        : 'border-card-border bg-surface'
    "
    @click="$emit('select')"
  >
    <span
      v-if="offer.badge"
      class="absolute -top-[11px] right-4 h-[22px] rounded-[11px] bg-success px-2.5 text-xs leading-[22px] font-extrabold tracking-[0.3px] text-white uppercase"
    >
      {{ offer.badge }}
    </span>

    <span
      class="grid size-6 shrink-0 place-items-center rounded-full border-2"
      :class="selected ? 'border-accent bg-accent' : 'border-card-border bg-surface'"
      aria-hidden="true"
    >
      <span v-if="selected" class="size-2 rounded-full bg-white" />
    </span>

    <span class="flex min-w-0 flex-1 flex-col">
      <span class="text-[17px] leading-[22px] font-extrabold">{{ offer.title }}</span>
      <span class="text-[13px] leading-[18px] font-semibold text-fg-muted">{{ offer.note }}</span>
    </span>

    <span class="flex shrink-0 flex-col items-end gap-[0.5px] text-right">
      <span class="text-xl leading-6 font-black whitespace-nowrap tabular-nums">{{ price }}</span>
      <span v-if="priceNote" class="text-xs leading-4 font-bold whitespace-nowrap text-fg-muted">
        {{ priceNote }}
      </span>
    </span>
  </button>
</template>
