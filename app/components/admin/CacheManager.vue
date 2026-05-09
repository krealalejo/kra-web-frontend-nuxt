<script setup lang="ts">
const flushing = ref(false)
const flushResult = ref<{ ok: boolean; message: string } | null>(null)

async function flushCache() {
  flushing.value = true
  flushResult.value = null
  try {
    await $fetch('/api/admin/cache/flush', { method: 'POST' })
    flushResult.value = { ok: true, message: 'Cache flushed successfully.' }
  } catch {
    flushResult.value = { ok: false, message: 'Failed to flush cache.' }
  } finally {
    flushing.value = false
  }
}
</script>

<template>
  <div class="rounded-xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline)">
    <div class="flex items-start justify-between gap-6 flex-wrap">
      <div class="flex flex-col gap-1">
        <h2 class="t-label" style="font-size: 12px; color: var(--fg)">API Cache</h2>
        <p class="t-label" style="font-size: 11px; color: var(--fg-muted)">
          Flush all Memcached entries. Useful after manual data corrections.
        </p>
        <p
          v-if="flushResult"
          class="t-label"
          style="font-size: 11px; margin-top: 4px"
          :style="{ color: flushResult.ok ? 'var(--success, #22c55e)' : 'var(--error, #ef4444)' }"
        >
          {{ flushResult.message }}
        </p>
      </div>
      <button
        :disabled="flushing"
        class="t-label rounded-lg px-4 py-2 transition-opacity"
        style="font-size: 11px; background: var(--accent); color: #fff; border: none; cursor: pointer; white-space: nowrap"
        :style="{ opacity: flushing ? '0.6' : '1' }"
        @click="flushCache"
      >
        {{ flushing ? 'Flushing…' : 'Flush Cache' }}
      </button>
    </div>
  </div>
</template>
