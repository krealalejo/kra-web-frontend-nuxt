<script setup lang="ts">
import IconBrandGithub from '~/components/icons/IconBrandGithub.vue'

interface Props {
  role?: string | null
  year?: string | null
  kind?: string | null
  mainBranch?: string | null
  stack?: string[] | null
  stars?: number | null
  headings?: { title: string; id: string }[] | null
  htmlUrl?: string | null
}
const props = defineProps<Props>()
</script>

<template>
  <aside class="pd-sidebar">
    <a
      v-if="props.htmlUrl"
      :href="props.htmlUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="sidebar-github-btn"
    >
      <IconBrandGithub style="width: 14px; height: 14px; flex-shrink: 0" />
      View on GitHub ↗
    </a>

    <h2 class="sidebar-label">ON THIS PAGE</h2>
    <ul class="toc">
      <li v-for="h in props.headings" :key="h.id">
        <a :href="`#${h.id}`">{{ h.title }}</a>
      </li>
    </ul>

    <h2 class="sidebar-label">PROJECT FACTS</h2>
    <ul class="facts">
      <li v-if="props.role" class="kv">
        <span class="k">ROLE</span>
        <span class="v">{{ props.role }}</span>
      </li>
      <li v-if="props.year" class="kv">
        <span class="k">YEAR</span>
        <span class="v">{{ props.year }}</span>
      </li>
      <li v-if="props.kind" class="kv">
        <span class="k">KIND</span>
        <span class="v">{{ props.kind }}</span>
      </li>
      <li v-if="props.stars !== undefined && props.stars !== null" class="kv">
        <span class="k">STARS</span>
        <span class="v">{{ props.stars }}</span>
      </li>
      <li v-if="props.mainBranch" class="kv">
        <span class="k">BRANCH</span>
        <span class="v">{{ props.mainBranch }}</span>
      </li>
    </ul>

    <template v-if="props.stack?.length">
      <h2 class="sidebar-label">STACK</h2>
      <div class="stack">
        <span v-for="s in props.stack" :key="s" class="stack-chip">{{ s }}</span>
      </div>
    </template>
  </aside>
</template>

<style scoped>
.sidebar-github-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 10px 14px;
  margin-bottom: 32px;
  border: 1px solid var(--hairline-strong);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--fg-dim);
  text-decoration: none;
  transition: color 0.2s var(--ease-out), border-color 0.2s var(--ease-out);
}
.sidebar-github-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}
</style>
