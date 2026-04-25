<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import type { BlogPost } from '~/stores/blog'
import { useNotificationStore } from '~/stores/notifications'

const props = defineProps<{
  open: boolean
  post?: BlogPost | null
}>()

const emit = defineEmits<{
  close: []
  deleted: []
}>()

const store = useBlogStore()
const notifications = useNotificationStore()
const deleteError = ref<string | null>(null)

watch(() => props.open, (isOpen) => {
  if (!isOpen) deleteError.value = null
})

async function confirmDelete() {
  if (!props.post) return
  deleteError.value = null
  try {
    await store.deletePost(props.post.slug)
    notifications.add({
      type: 'success',
      title: 'Post deleted',
      message: `"${props.post.title}" has been removed.`
    })
    emit('deleted')
    emit('close')
  } catch (e: unknown) {
    deleteError.value = store.error ?? (e instanceof Error ? e.message : 'Failed to delete post. Please try again.')
  }
}
</script>

<template>
  <Dialog :open="open" class="relative z-50" @close="emit('close')">
    <div class="fixed inset-0 bg-black/30 dark:bg-black/50" aria-hidden="true" />
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-md rounded border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <DialogTitle class="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">Delete post?</DialogTitle>

        <p class="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ post?.title }}</p>
        <p class="mb-4 text-sm text-slate-700 dark:text-slate-300">Are you sure? This cannot be undone.</p>

        <div
          v-if="deleteError"
          class="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {{ deleteError }}
        </div>

        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="rounded px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="store.loading"
            class="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-60"
            @click="confirmDelete"
          >
            Delete
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
