<script setup lang="ts">
import { useActivityStore } from '~/stores/activity'

const store = useActivityStore()
const saving = reactive<Record<string, boolean>>({
  SHIPPING: false,
  READING: false,
  PLAYING: false
})
const errors = reactive<Record<string, string | null>>({
  SHIPPING: null,
  READING: null,
  PLAYING: null
})

const shippingTitle = ref('')
const shippingDescription = ref('')

const readingTitle = ref('')
const readingDescription = ref('')

const playingTags = ref<string[]>([])
const newTag = ref('')

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
    errors.SHIPPING = store.error ?? 'Failed to load activity cards'
  }
})

interface ShippingReadingPayload { title: string; description: string }
interface PlayingPayload { tags: string[] }
type ActivityPayload = ShippingReadingPayload | PlayingPayload

async function saveCard(type: string, payload: ActivityPayload) {
  saving[type] = true
  errors[type] = null
  try {
    await store.updateCard(type, payload)
  } catch (e: unknown) {
    errors[type] = e instanceof Error ? e.message : 'Save failed'
  } finally {
    saving[type] = false
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
    <div class="mb-8 flex items-center justify-between pb-6" style="border-bottom: 1px solid var(--hairline)">
      <div>
        <h2 class="t-h2">Activity Cards</h2>
        <p class="t-label mt-1" style="color: var(--fg-dim)">Manage the activity cards shown on the home page</p>
      </div>
    </div>


    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px;">

      <div class="rounded-2xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline); display: flex; flex-direction: column;">
        <div class="t-overline mb-4" style="color: var(--fg-dim)">SHIPPING</div>
        <div class="mb-4 space-y-3">
          <div>
            <label for="shipping-title" class="t-label mb-1 block" style="color: var(--fg-dim); font-size: 11px">Title</label>
            <input
              id="shipping-title"
              v-model="shippingTitle"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background: var(--bg); border: 1px solid var(--hairline); color: var(--fg); outline: none"
              placeholder="e.g. kra-api v1.2"
            />
          </div>
          <div>
            <label for="shipping-description" class="t-label mb-1 block" style="color: var(--fg-dim); font-size: 11px">Description</label>
            <textarea
              id="shipping-description"
              v-model="shippingDescription"
              rows="3"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background: var(--bg); border: 1px solid var(--hairline); color: var(--fg); outline: none; resize: vertical"
              placeholder="Short description…"
            />
          </div>
        </div>
        <div v-if="errors.SHIPPING" class="mb-4 rounded px-3 py-2 text-xs" style="background: rgba(220, 38, 38, 0.1); color: #f87171; border: 1px solid rgba(220, 38, 38, 0.25)">
          {{ errors.SHIPPING }}
        </div>

        <button
          :disabled="saving.SHIPPING"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-opacity"
          style="background: var(--accent); color: var(--bg); margin-top: auto"
          :style="saving.SHIPPING ? 'opacity: 0.5' : ''"
          @click="saveCard('SHIPPING', { title: shippingTitle, description: shippingDescription })"
        >
          {{ saving.SHIPPING ? 'Saving…' : 'Save' }}
        </button>
      </div>

      <div class="rounded-2xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline); display: flex; flex-direction: column;">
        <div class="t-overline mb-4" style="color: var(--fg-dim)">READING</div>
        <div class="mb-4 space-y-3">
          <div>
            <label for="reading-title" class="t-label mb-1 block" style="color: var(--fg-dim); font-size: 11px">Title</label>
            <input
              id="reading-title"
              v-model="readingTitle"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background: var(--bg); border: 1px solid var(--hairline); color: var(--fg); outline: none"
              placeholder="e.g. Team Topologies"
            />
          </div>
          <div>
            <label for="reading-description" class="t-label mb-1 block" style="color: var(--fg-dim); font-size: 11px">Description</label>
            <textarea
              id="reading-description"
              v-model="readingDescription"
              rows="3"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background: var(--bg); border: 1px solid var(--hairline); color: var(--fg); outline: none; resize: vertical"
              placeholder="Author · short note…"
            />
          </div>
        </div>
        <div v-if="errors.READING" class="mb-4 rounded px-3 py-2 text-xs" style="background: rgba(220, 38, 38, 0.1); color: #f87171; border: 1px solid rgba(220, 38, 38, 0.25)">
          {{ errors.READING }}
        </div>

        <button
          :disabled="saving.READING"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-opacity"
          style="background: var(--accent); color: var(--bg); margin-top: auto"
          :style="saving.READING ? 'opacity: 0.5' : ''"
          @click="saveCard('READING', { title: readingTitle, description: readingDescription })"
        >
          {{ saving.READING ? 'Saving…' : 'Save' }}
        </button>
      </div>

      <div class="rounded-2xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline); display: flex; flex-direction: column;">
        <div class="t-overline mb-4" style="color: var(--fg-dim)">PLAYING</div>
        <div class="mb-4">
          <label for="playing-tag-input" class="t-label mb-2 block" style="color: var(--fg-dim); font-size: 11px">Chip tags</label>
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
            id="playing-tag-input"
            v-model="newTag"
            class="w-full rounded-lg px-3 py-2 text-sm"
            style="background: var(--bg); border: 1px solid var(--hairline); color: var(--fg); outline: none"
            placeholder="Add tag… (Enter to add)"
            @keydown.enter.prevent="addTag"
          />
        </div>
        <div v-if="errors.PLAYING" class="mb-4 rounded px-3 py-2 text-xs" style="background: rgba(220, 38, 38, 0.1); color: #f87171; border: 1px solid rgba(220, 38, 38, 0.25)">
          {{ errors.PLAYING }}
        </div>

        <button
          :disabled="saving.PLAYING"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-opacity"
          style="background: var(--accent); color: var(--bg); margin-top: auto"
          :style="saving.PLAYING ? 'opacity: 0.5' : ''"
          @click="saveCard('PLAYING', { tags: playingTags })"
        >
          {{ saving.PLAYING ? 'Saving…' : 'Save' }}
        </button>
      </div>

    </div>
  </div>
</template>
