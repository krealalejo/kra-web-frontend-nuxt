<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900">
    <header class="border-b border-slate-200 bg-white px-4 py-4">
      <div class="mx-auto max-w-5xl">
        <span class="text-lg font-semibold tracking-tight">KRA</span>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-8">
      <slot />
    </main>
    <footer class="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
      Phase 9 — frontend setup
    </footer>
  </div>
</template>
