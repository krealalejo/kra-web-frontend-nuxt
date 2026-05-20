<script setup lang="ts">
import type { Reference } from '~/types/blog'

interface TocItem { id: string; text: string; level: number }

interface Props {
  tocItems?: TocItem[]
  activeTocId?: string
  readingTime?: number | null
  publishedAt?: string | null
  updatedAt?: string | null
  references?: Reference[] | null
}

const props = defineProps<Props>()
</script>

<template>
  <aside class="pd-sidebar">
    <template v-if="props.tocItems?.length">
      <h5>ON THIS PAGE</h5>
      <ul class="toc">
        <li
          v-for="item in props.tocItems"
          :key="item.id"
          :class="{ 'toc-h3': item.level === 3 }"
        >
          <a :href="`#${item.id}`" :class="{ active: props.activeTocId === item.id }">
            {{ item.text }}
          </a>
        </li>
      </ul>
    </template>

    <h5>POST INFO</h5>
    <ul class="facts">
      <li v-if="props.readingTime" class="kv">
        <span class="k">READ TIME</span>
        <span class="v">{{ props.readingTime }} min</span>
      </li>
      <li v-if="props.publishedAt" class="kv">
        <span class="k">PUBLISHED</span>
        <span class="v">{{ props.publishedAt }}</span>
      </li>
      <li v-if="props.updatedAt && props.updatedAt !== props.publishedAt" class="kv">
        <span class="k">UPDATED</span>
        <span class="v">{{ props.updatedAt }}</span>
      </li>
    </ul>

    <template v-if="props.references?.length">
      <h5>REFERENCES</h5>
      <ul class="toc">
        <li v-for="(ref, i) in props.references" :key="i">
          <a :href="ref.url" target="_blank" rel="noopener noreferrer">{{ ref.label }}</a>
        </li>
      </ul>
    </template>
  </aside>
</template>
