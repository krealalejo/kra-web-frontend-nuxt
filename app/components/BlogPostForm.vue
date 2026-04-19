<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { BlogPost } from '~/stores/blog'
import type { Reference } from '~/types/blog'

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

const references = ref<Reference[]>([])

const previewHtml = computed<string>(() => {
  if (import.meta.server || !content.value) return ''
  const html = marked.parse(content.value) as string
  return DOMPurify.sanitize(html)
})

function addReference() {
  references.value.push({ label: '', url: '' })
}

function removeReference(index: number) {
  references.value.splice(index, 1)
}

watch(() => props.post, (newPost) => {
  if (newPost) {
    setValues({
      slug: newPost.slug,
      title: newPost.title,
      content: newPost.content,
      references: newPost.references ? [...newPost.references] : []
    })
    references.value = newPost.references ? [...newPost.references] : []
  }
}, { immediate: true })

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    resetForm()
    references.value = []
    formError.value = null
  }
})

const onSubmit = handleSubmit(async (values) => {
  formError.value = null
  try {
    if (isEditMode.value && props.post) {
      await store.updatePost(props.post.slug, { title: values.title, content: values.content, references: references.value })
    } else {
      await store.createPost({ slug: values.slug, title: values.title, content: values.content, references: references.value })
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
    <div class="fixed inset-0 bg-black/30 dark:bg-black/50" aria-hidden="true" />

    <!-- Modal panel -->
    <div class="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
      <DialogPanel class="w-full max-w-4xl rounded border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900 my-8">
        <DialogTitle class="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          {{ isEditMode ? 'Edit Post' : 'Create Post' }}
        </DialogTitle>

        <!-- Error alert -->
        <div
          v-if="formError"
          class="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
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
            <label for="post-slug" class="text-sm font-semibold text-slate-900 dark:text-slate-100">Slug</label>
            <input
              id="post-slug"
              v-model="slug"
              type="text"
              maxlength="128"
              :disabled="isEditMode"
              :aria-describedby="slugError ? 'slug-error' : undefined"
              class="rounded border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100 disabled:text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
            />
            <span v-if="slugError" id="slug-error" class="text-sm text-red-600 dark:text-red-400">{{ slugError }}</span>
          </div>

          <!-- Title -->
          <div class="flex flex-col gap-1">
            <label for="post-title" class="text-sm font-semibold text-slate-900 dark:text-slate-100">Title</label>
            <input
              id="post-title"
              v-model="title"
              type="text"
              maxlength="256"
              :aria-describedby="titleError ? 'title-error' : undefined"
              class="rounded border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <span v-if="titleError" id="title-error" class="text-sm text-red-600 dark:text-red-400">{{ titleError }}</span>
          </div>

          <!-- Content split-pane -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-slate-900 dark:text-slate-100">Content</label>
            <div class="grid grid-cols-2 gap-2">
              <textarea
                id="post-content"
                v-model="content"
                rows="16"
                maxlength="200000"
                :aria-describedby="contentError ? 'content-error' : undefined"
                class="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="Write Markdown here..."
              />
              <div
                class="overflow-auto rounded border border-slate-200 bg-slate-50 px-4 py-2 prose prose-slate max-w-none dark:border-slate-600 dark:bg-slate-800 dark:prose-invert"
                v-html="previewHtml"
              />
            </div>
            <span v-if="contentError" id="content-error" class="text-sm text-red-600 dark:text-red-400">{{ contentError }}</span>
          </div>

          <!-- References -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-semibold text-slate-900 dark:text-slate-100">References</label>
              <button
                type="button"
                class="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                @click="addReference"
              >
                + Add reference
              </button>
            </div>
            <div
              v-for="(ref, i) in references"
              :key="i"
              class="flex gap-2 items-center"
            >
              <input
                v-model="ref.label"
                type="text"
                placeholder="Label"
                class="flex-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                v-model="ref.url"
                type="url"
                placeholder="https://..."
                class="flex-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                class="text-xs text-red-600 hover:text-red-800 dark:text-red-400 shrink-0"
                @click="removeReference(i)"
              >
                Remove
              </button>
            </div>
            <p v-if="references.length === 0" class="text-xs text-slate-400 dark:text-slate-500">
              No references added yet.
            </p>
          </div>

          <!-- Footer buttons -->
          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
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
