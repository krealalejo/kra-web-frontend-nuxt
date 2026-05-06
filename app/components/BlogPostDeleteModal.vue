<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import type { BlogPost } from '~/stores/blog'

const props = defineProps<{
  open: boolean
  post?: BlogPost | null
}>()

const emit = defineEmits<{
  close: []
  deleted: []
}>()

const store = useBlogStore()
const deleteError = ref<string | null>(null)

watch(() => props.open, (isOpen) => {
  if (!isOpen) deleteError.value = null
})

async function confirmDelete() {
  if (!props.post) return
  deleteError.value = null
  try {
    await store.deletePost(props.post.slug)
    emit('deleted')
    emit('close')
  } catch (e: unknown) {
    deleteError.value = store.error ?? (e instanceof Error ? e.message : 'Failed to delete post. Please try again.')
  }
}
</script>

<template>
  <Dialog :open="open" class="relative z-50" @close="emit('close')">
    <div class="fixed inset-0 backdrop-blur-md" style="background:color-mix(in srgb, var(--bg) 60%, transparent)" aria-hidden="true" />
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel
        class="w-full max-w-md rounded-2xl p-8 transition-all"
        style="background:var(--bg-elev); border: 1px solid var(--hairline); box-shadow: 0 40px 100px rgba(0,0,0,0.4)"
      >
        <DialogTitle class="mb-2 t-h3" style="font-size: 24px">Delete post?</DialogTitle>

        <p class="mb-4 t-body" style="font-size: 14px">
          Are you sure you want to delete <em style="color:var(--fg); font-style:normal; font-weight:600">"{{ post?.title }}"</em>? This action cannot be undone.
        </p>

        <div
          v-if="deleteError"
          class="mb-6 rounded-xl p-4 text-sm"
          role="alert"
          style="background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.25); color: #dc2626"
        >
          {{ deleteError }}
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="btn btn-ghost"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="store.loading"
            class="btn btn-ghost"
            style="color: #f87171; border-color: rgba(220, 38, 38, 0.3)"
            @click="confirmDelete"
          >
            {{ store.loading ? 'Deleting...' : 'Delete Permanently' }}
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
