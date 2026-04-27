<script setup lang="ts">
import { useActivityStore } from '~/stores/activity'

const store = useActivityStore()
const saving = ref(false)
const error = ref<string | null>(null)

// Per-card local state
const shippingTitle = ref('')
const shippingDescription = ref('')

const readingTitle = ref('')
const readingDescription = ref('')

const playingTags = ref<string[]>([])
const newTag = ref('')

// Fetch current values on mount via store
onMounted(async () => {
  try {
    await store.fetchCards()
    for (const card of store.cards) {
      if (card.type === 'SHIPPING') {
        shippingTitle.value = card.title ?? ''
        shippingDescription.value = card.description ?? ''
      } else if (card.type === 'READING') {
        readingTitle.value = card.title ?? ''
        readingDescription.value = card.description ?? ''
      } else if (card.type === 'PLAYING') {
        playingTags.value = card.tags ?? []
      }
    }
  } catch {
    error.value = store.error ?? 'Failed to load activity cards'
  }
})

interface ShippingReadingPayload { title: string; description: string }
interface PlayingPayload { tags: string[] }
type ActivityPayload = ShippingReadingPayload | PlayingPayload

async function saveCard(type: string, payload: ActivityPayload) {
  saving.value = true
  error.value = null
  try {
    await store.updateCard(type, payload)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Save failed'
  } finally {
    saving.value = false
  }
}

function addTag() {
  const trimmed = newTag.value.trim()
  if (trimmed && !playingTags.value.includes(trimmed)) {
    playingTags.value.push(trimmed)
    newTag.value = ''
  }
}

function removeTag(index: number) {
  playingTags.value.splice(index, 1)
}
</script>

<template>
  <div class="mb-12">
    <!-- Section header -->
    <div class="mb-8 flex items-center justify-between pb-6" style="border-bottom: 1px solid var(--hairline)">
      <div>
        <h2 class="t-h2">Activity Cards</h2>
        <p class="t-label mt-1" style="color: var(--fg-dim)">Manage the activity cards shown on the home page</p>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="error" class="mb-6 rounded-lg px-4 py-3 text-sm" style="background: rgba(255,77,77,0.1); color: #ff4d4d; border: 1px solid rgba(255,77,77,0.3)">
      {{ error }}
    </div>

    <!-- Three card panels -->
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px;">

      <!-- SHIPPING -->
      <div class="rounded-2xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline)">
        <div class="t-overline mb-4" style="color: var(--fg-dim)">SHIPPING</div>
        <div class="mb-4 space-y-3">
          <div>
            <label class="t-label mb-1 block" style="color: var(--fg-dim); font-size: 11px">Title</label>
            <input
              v-model="shippingTitle"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background: var(--bg); border: 1px solid var(--hairline); color: var(--fg); outline: none"
              placeholder="e.g. kra-api v1.2"
            />
          </div>
          <div>
            <label class="t-label mb-1 block" style="color: var(--fg-dim); font-size: 11px">Description</label>
            <textarea
              v-model="shippingDescription"
              rows="3"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background: var(--bg); border: 1px solid var(--hairline); color: var(--fg); outline: none; resize: vertical"
              placeholder="Short description…"
            />
          </div>
        </div>
        <button
          :disabled="saving"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-opacity"
          style="background: var(--accent); color: var(--bg)"
          :style="saving ? 'opacity: 0.5' : ''"
          @click="saveCard('SHIPPING', { title: shippingTitle, description: shippingDescription })"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>

      <!-- READING -->
      <div class="rounded-2xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline)">
        <div class="t-overline mb-4" style="color: var(--fg-dim)">READING</div>
        <div class="mb-4 space-y-3">
          <div>
            <label class="t-label mb-1 block" style="color: var(--fg-dim); font-size: 11px">Title</label>
            <input
              v-model="readingTitle"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background: var(--bg); border: 1px solid var(--hairline); color: var(--fg); outline: none"
              placeholder="e.g. Team Topologies"
            />
          </div>
          <div>
            <label class="t-label mb-1 block" style="color: var(--fg-dim); font-size: 11px">Description</label>
            <textarea
              v-model="readingDescription"
              rows="3"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background: var(--bg); border: 1px solid var(--hairline); color: var(--fg); outline: none; resize: vertical"
              placeholder="Author · short note…"
            />
          </div>
        </div>
        <button
          :disabled="saving"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-opacity"
          style="background: var(--accent); color: var(--bg)"
          :style="saving ? 'opacity: 0.5' : ''"
          @click="saveCard('READING', { title: readingTitle, description: readingDescription })"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>

      <!-- PLAYING (chip tag editor) -->
      <div class="rounded-2xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline)">
        <div class="t-overline mb-4" style="color: var(--fg-dim)">PLAYING</div>
        <div class="mb-4">
          <label class="t-label mb-2 block" style="color: var(--fg-dim); font-size: 11px">Chip tags</label>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
            <span
              v-for="(tag, i) in playingTags"
              :key="tag"
              class="chip"
              style="display: inline-flex; align-items: center; gap: 4px;"
            >
              {{ tag }}
              <button
                style="background: none; border: none; cursor: pointer; color: inherit; padding: 0; line-height: 1;"
                @click="removeTag(i)"
              >✕</button>
            </span>
          </div>
          <input
            v-model="newTag"
            class="w-full rounded-lg px-3 py-2 text-sm"
            style="background: var(--bg); border: 1px solid var(--hairline); color: var(--fg); outline: none"
            placeholder="Add tag… (Enter to add)"
            @keydown.enter.prevent="addTag"
          />
        </div>
        <button
          :disabled="saving"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-opacity"
          style="background: var(--accent); color: var(--bg)"
          :style="saving ? 'opacity: 0.5' : ''"
          @click="saveCard('PLAYING', { tags: playingTags })"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>

    </div>
  </div>
</template>
