<script setup lang="ts">
interface Props {
  role?: string | null
  year?: string | null
  kind?: string | null
  mainBranch?: string | null
  stack?: string[] | null
  stars?: number | null
  headings?: { title: string; id: string }[] | null
}
const props = defineProps<Props>()
</script>

<template>
  <aside class="pd-sidebar">
    <h5>ON THIS PAGE</h5>
    <ul class="toc">
      <li><a href="#readme">README</a></li>
      <li v-for="h in props.headings" :key="h.id">
        <a :href="`#${h.id}`">{{ h.title }}</a>
      </li>
    </ul>

    <h5>PROJECT FACTS</h5>
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
      <h5>STACK</h5>
      <div class="stack">
        <span v-for="s in props.stack" :key="s" class="stack-chip">{{ s }}</span>
      </div>
    </template>
  </aside>
</template>
