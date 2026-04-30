<script setup lang="ts">
import { markRaw } from 'vue'
import IconBrandGithub from './icons/IconBrandGithub.vue'
import IconBrandLinkedin from './icons/IconBrandLinkedin.vue'
import IconBrandWow from './icons/IconBrandWow.vue'

const links = [
  {
    label: 'GitHub',
    href: 'https://github.com/krealalejo',
    icon: markRaw(IconBrandGithub),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/kevinrealalejo/',
    icon: markRaw(IconBrandLinkedin),
  },
  {
    label: 'World of Warcraft',
    href: 'https://worldofwarcraft.blizzard.com/es-es/character/eu/sanguino/Tfundoakames',
    icon: markRaw(IconBrandWow),
  },
]
</script>

<template>
  <nav aria-label="Social links">
    <ul class="flex items-center gap-4 list-none p-0 m-0">
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
          class="kra-social-btn p-2 -m-2"
        >
          <component
            :is="link.icon"
            class="h-6 w-6"
          />
        </a>
      </li>
    </ul>
  </nav>
</template>
