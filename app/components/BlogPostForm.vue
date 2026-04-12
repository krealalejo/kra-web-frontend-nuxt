<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import type { BlogPost } from '~/stores/blog'

const props = defineProps<{
  open: boolean
  post?: BlogPost | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const store = useBlogStore()
const { slug, title, content, slugError, titleError, contentError, isSubmitting, handleSubmit, resetForm, setValues } = useBlogPostForm()

const formError = ref<string | null>(null)
const isEditMode = computed(() => !!props.post)

// Pre-fill form when editing an existing post
watch(() => props.post, (newPost) => {
  if (newPost) {
    setValues({ slug: newPost.slug, title: newPost.title, content: newPost.content })
  }
}, { immediate: true })

// Reset form when modal closes
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    resetForm()
    formError.value = null
  }
})

const onSubmit = handleSubmit(async (values) => {
  formError.value = null
  try {
    if (isEditMode.value && props.post) {
      await store.updatePost(props.post.slug, { title: values.title, content: values.content })
    } else {
      await store.createPost({ slug: values.slug, title: values.title, content: values.content })
    }
    emit('saved')
    emit('close')
  } catch (e: unknown) {
    formError.value = store.error ?? (e instanceof Error ? e.message : 'An unexpected error occurred')
  }
})
</script>

<template>
  <Dialog :open="open" class="relative z-50" @close="emit('close')">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

    <!-- Modal panel -->
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-lg rounded border border-slate-200 bg-white p-6 shadow-lg">
        <DialogTitle class="mb-4 text-base font-semibold text-slate-900">
          {{ isEditMode ? 'Edit Post' : 'Create Post' }}
        </DialogTitle>

        <!-- Error alert -->
        <div
          v-if="formError"
          class="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
        >
          {{ formError }}
          <button
            type="button"
            class="ml-2 font-semibold underline"
            @click="formError = null"
          >
            Dismiss
          </button>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <!-- Slug -->
          <div class="flex flex-col gap-1">
            <label for="post-slug" class="text-sm font-semibold text-slate-900">Slug</label>
            <input
              id="post-slug"
              v-model="slug"
              type="text"
              maxlength="128"
              :disabled="isEditMode"
              :aria-describedby="slugError ? 'slug-error' : undefined"
              class="rounded border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100 disabled:text-slate-600"
            />
            <span v-if="slugError" id="slug-error" class="text-sm text-red-600">{{ slugError }}</span>
          </div>

          <!-- Title -->
          <div class="flex flex-col gap-1">
            <label for="post-title" class="text-sm font-semibold text-slate-900">Title</label>
            <input
              id="post-title"
              v-model="title"
              type="text"
              maxlength="256"
              :aria-describedby="titleError ? 'title-error' : undefined"
              class="rounded border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <span v-if="titleError" id="title-error" class="text-sm text-red-600">{{ titleError }}</span>
          </div>

          <!-- Content -->
          <div class="flex flex-col gap-1">
            <label for="post-content" class="text-sm font-semibold text-slate-900">Content</label>
            <textarea
              id="post-content"
              v-model="content"
              rows="12"
              maxlength="200000"
              :aria-describedby="contentError ? 'content-error' : undefined"
              class="rounded border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <span v-if="contentError" id="content-error" class="text-sm text-red-600">{{ contentError }}</span>
          </div>

          <!-- Footer buttons -->
          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
            >
              {{ isSubmitting ? 'Saving…' : 'Save Post' }}
            </button>
          </div>
        </form>
      </DialogPanel>
    </div>
  </Dialog>
</template>
