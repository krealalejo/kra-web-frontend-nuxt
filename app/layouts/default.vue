<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900">
    <header class="border-b border-slate-200 bg-white px-4 py-4">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <NuxtLink
          to="/"
          class="text-lg font-semibold tracking-tight text-slate-900 hover:text-slate-700"
        >
          KRA
        </NuxtLink>
        <nav class="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700">
          <NuxtLink
            to="/"
            class="hover:text-slate-900"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/blog"
            class="hover:text-slate-900"
          >
            Blog
          </NuxtLink>
          <NuxtLink
            to="/contact"
            class="hover:text-slate-900"
          >
            Contact
          </NuxtLink>
          <NuxtLink
            to="/cv"
            class="hover:text-slate-900"
          >
            CV
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-8">
      <slot />
    </main>
    <footer class="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
      Project KRA — Phase 12
    </footer>
  </div>
</template>
