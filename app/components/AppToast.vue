<script setup lang="ts">
defineProps<{ message: string | null }>()
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    leave-active-class="transition duration-150 ease-in"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div
      v-if="message"
      role="status"
      class="pointer-events-none fixed inset-x-0 bottom-[calc(152px+env(safe-area-inset-bottom))] z-10 mx-auto w-[calc(100%-40px)] max-w-[390px] rounded-[14px] bg-fg px-4 py-3 text-center text-sm leading-5 font-bold text-white"
    >
      {{ message }}
    </div>
  </Transition>
</template>
