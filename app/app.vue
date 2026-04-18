<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.page-enter-from {
  opacity: 0;
}

.page-leave-to {
  opacity: 0;
}
</style>
