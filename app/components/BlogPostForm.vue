<script setup lang="ts">
import { useFieldArray } from 'vee-validate'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import type { BlogPost } from '~/stores/blog'
import { useNotificationStore } from '~/stores/notifications'

const props = defineProps<{
  open: boolean
  post?: BlogPost | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const store = useBlogStore()
const notifications = useNotificationStore()
const { sanitizeMarkdown } = useMarkdown()
const { slug, title, content, slugError, titleError, contentError, isSubmitting, handleSubmit, resetForm, setValues } = useBlogPostForm()
const { fields: references, push: addReference, remove: removeReference } = useFieldArray<{ label: string; url: string }>('references')

const formError = ref<string | null>(null)
const isEditMode = computed(() => !!props.post)

const imageFile = ref<File | null>(null)
const imageUploading = ref(false)
const imageKey = ref<string | null>(props.post?.imageUrl ?? null)
const thumbReady = ref(false)
const isThumbnailPolling = ref(false)

const runtimeConfig = useRuntimeConfig()

const thumbUrl = computed(() => {
  if (!imageKey.value) return null
  const thumbKey = imageKey.value
    .replace(/^images\//, 'thumbnails/')
    .replace(/\.[^.]+$/, '-thumb.webp')
  return `${runtimeConfig.public.s3PublicBucketUrl}/${thumbKey}`
})

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  imageFile.value = file
  imageUploading.value = true
  thumbReady.value = false
  formError.value = null

  try {
    // Step 1: Get presigned URL from Nuxt proxy route (per D-12)
    const { uploadUrl, s3Key } = await $fetch<{ uploadUrl: string; s3Key: string }>('/api/admin/upload', {
      method: 'POST',
      body: { filename: file.name, contentType: file.type },
    })

    // Step 2: PUT file directly to S3 presigned URL from browser (per D-12)
    await $fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    imageKey.value = s3Key

    // Step 3: Poll for thumbnail readiness (per D-16: 1s interval, max 10 attempts)
    let attempts = 0
    isThumbnailPolling.value = true
    const poll = setInterval(async () => {
      attempts++
      try {
        const { ready } = await $fetch<{ ready: boolean }>(
          `/api/admin/image-status?key=${encodeURIComponent(s3Key)}`
        )
        if (ready) {
          thumbReady.value = true
          isThumbnailPolling.value = false
          clearInterval(poll)
        } else if (attempts >= 15) {
          clearInterval(poll)
          isThumbnailPolling.value = false
          // Timeout — show no preview; user sees warning via toast
          notifications.add({
            type: 'info',
            title: 'Thumbnail status',
            message: 'Image uploaded but thumbnail is still generating — it will appear in the list soon.'
          })
        }
      } catch {
        if (attempts >= 15) {
          isThumbnailPolling.value = false
          clearInterval(poll)
        }
      }
    }, 2000)
  } catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : 'Image upload failed'
    notifications.add({ type: 'error', title: 'Upload failed', message: formError.value })
  } finally {
    imageUploading.value = false
  }
}

function removeImage() {
  imageKey.value = null
  imageFile.value = null
  thumbReady.value = false
  notifications.add({ type: 'info', message: 'Image removed from post (unsaved).' })
}

const previewHtml = ref('')
watch(content, async (val) => {
  if (val) {
    previewHtml.value = await sanitizeMarkdown(val)
  } else {
    previewHtml.value = ''
  }
}, { immediate: true })

watch(() => props.post, (newPost) => {
  if (newPost) {
    setValues({
      slug: newPost.slug,
      title: newPost.title,
      content: newPost.content,
      references: newPost.references ? [...newPost.references] : []
    })
    imageKey.value = newPost.imageUrl ?? null
    thumbReady.value = !!newPost.imageUrl
  }
}, { immediate: true })

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
      await store.updatePost(props.post.slug, {
        title: values.title, content: values.content,
        references: values.references ?? [],
        imageUrl: imageKey.value
      })
    } else {
      await store.createPost({
        slug: values.slug, title: values.title, content: values.content,
        references: values.references ?? [],
        imageUrl: imageKey.value
      })
    }
    notifications.add({
      type: 'success',
      title: isEditMode.value ? 'Post updated' : 'Post created',
      message: `"${values.title}" has been saved successfully.`
    })
    emit('saved')
    emit('close')
  } catch (e: unknown) {
    formError.value = store.error ?? (e instanceof Error ? e.message : 'An unexpected error occurred')
  }
})
</script>

<template>
  <Dialog :open="open" class="relative z-50" @close="emit('close')">
    <div class="fixed inset-0 bg-black/30 dark:bg-black/50" aria-hidden="true" />

    <div class="fixed inset-0 flex items-start justify-center p-4 overflow-y-auto">
      <DialogPanel class="w-full max-w-6xl rounded border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900 my-8">
        <DialogTitle class="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          {{ isEditMode ? 'Edit Post' : 'Create Post' }}
        </DialogTitle>

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

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-slate-900 dark:text-slate-100">Cover Image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              :disabled="imageUploading"
              class="rounded border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 disabled:opacity-50"
              @change="handleImageUpload"
            />
            <span v-if="imageUploading" class="text-sm text-slate-500 dark:text-slate-400">Uploading…</span>
            <div v-if="thumbReady && thumbUrl" class="relative mt-2 w-fit">
              <img
                :src="thumbUrl"
                class="h-32 rounded object-cover border border-slate-200 dark:border-slate-600"
                alt="Thumbnail preview"
              />
              <button
                type="button"
                class="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Remove image"
                @click="removeImage"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="imageKey && !thumbReady && !imageUploading" class="mt-2 flex items-center gap-2">
              <span class="text-xs text-slate-400 dark:text-slate-500">
                Image key: {{ imageKey }} (thumbnail generating…)
              </span>
              <button
                type="button"
                class="text-xs text-red-600 hover:text-red-800 dark:text-red-400"
                @click="removeImage"
              >
                Cancel
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-semibold text-slate-900 dark:text-slate-100">References</label>
              <button
                type="button"
                class="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                @click="addReference({ label: '', url: '' })"
              >
                + Add reference
              </button>
            </div>
            <div
              v-for="(ref, i) in references"
              :key="ref.key"
              class="flex gap-2 items-center"
            >
              <input
                v-model="ref.value.label"
                type="text"
                placeholder="Label"
                class="flex-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                v-model="ref.value.url"
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
              :disabled="isSubmitting || imageUploading || isThumbnailPolling"
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
