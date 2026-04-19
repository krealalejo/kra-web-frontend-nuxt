<script setup lang="ts">
import { markRaw } from 'vue'
import IconBrandGithub from './icons/IconBrandGithub.vue'
import IconBrandLinkedin from './icons/IconBrandLinkedin.vue'
import IconBrandWow from './icons/IconBrandWow.vue'

const links = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/kevinrealalejo/',
    icon: markRaw(IconBrandLinkedin),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/krealalejo',
    icon: markRaw(IconBrandGithub),
  },
  {
    label: 'World of Warcraft',
    href: 'https://worldofwarcraft.blizzard.com/es-es/character/eu/sanguino/Tfundoakames',
    icon: markRaw(IconBrandWow),
  },
]
</script>

<template>
  <nav
    aria-label="Social links"
    class="flex flex-col items-center gap-3"
  >
    <p class="text-xs font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
      Kevin Real Alejo
    </p>
    <ul class="flex items-center justify-center gap-4">
      <li
        v-for="link in links"
        :key="link.label"
      >
        <a
          :href="link.href"
          :aria-label="link.label"
          :title="link.label"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center rounded-full border border-slate-200 p-2.5 text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <component
            :is="link.icon"
            class="h-5 w-5"
          />
        </a>
      </li>
    </ul>
  </nav>
</template>
