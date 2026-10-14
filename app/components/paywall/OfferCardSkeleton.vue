<template>
  <div
    class="flex min-h-[76px] flex-col justify-center gap-2.5 rounded-[20px] border-2 border-card-border bg-surface p-4"
    aria-hidden="true"
  >
    <div class="skeleton-bar h-3 w-[46%] rounded-md" />
    <div class="skeleton-bar h-3 w-[72%] rounded-md" />
  </div>
</template>

<style scoped>
.skeleton-bar {
  background: linear-gradient(
    90deg,
    var(--color-skeleton) 0,
    var(--color-skeleton-hi) 50%,
    var(--color-skeleton) 100%
  );
  background-size: 200% 100%;
  animation: var(--animate-shimmer);
}
</style>
