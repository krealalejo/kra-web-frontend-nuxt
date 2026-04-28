<script setup lang="ts">
import { useFieldArray } from 'vee-validate'
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
const { sanitizeMarkdown } = useMarkdown()
const { slug, title, content, imageUrl, slugError, titleError, contentError, isSubmitting, handleSubmit, resetForm, setValues } = useBlogPostForm()
const { fields: references, push: addReference, remove: removeReference } = useFieldArray<{ label: string; url: string }>('references')

const formError = ref<string | null>(null)
const isEditMode = computed(() => !!props.post)

const imageFile = ref<File | null>(null)
const imageUploading = ref(false)
const thumbReady = ref(false)
const isThumbnailPolling = ref(false)

const runtimeConfig = useRuntimeConfig()

const thumbUrl = computed(() => {
  if (!imageUrl.value) return null
  const thumbKey = imageUrl.value
    .replace(/^images\
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
    const { uploadUrl, s3Key } = await $fetch<{ uploadUrl: string; s3Key: string }>('/api/admin/upload', {
      method: 'POST',
      body: { filename: file.name, contentType: file.type },
    })

    await $fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    imageUrl.value = s3Key

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
          formError.value = 'Image uploaded but thumbnail is still generating.'
        }
      } catch {
        if (attempts >= 15) {
          isThumbnailPolling.value = false
          clearInterval(poll)
        }
      }
    }, 2000)

    onUnmounted(() => clearInterval(poll))
  } catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : 'Image upload failed'
  } finally {
    imageUploading.value = false
  }
}

function removeImage() {
  imageUrl.value = null
  imageFile.value = null
  thumbReady.value = false
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
      references: newPost.references ? [...newPost.references] : [],
      imageUrl: newPost.imageUrl ?? null
    })
    thumbReady.value = !!newPost.imageUrl
  }
}, { immediate: true })

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    resetForm()
    formError.value = null
    thumbReady.value = false
  }
})

const onSubmit = handleSubmit(async (values) => {
  formError.value = null
  try {
    if (isEditMode.value && props.post) {
      await store.updatePost(props.post.slug, {
        title: values.title,
        content: values.content,
        references: values.references ?? [],
        imageUrl: values.imageUrl
      })
    } else {
      await store.createPost({
        slug: values.slug,
        title: values.title,
        content: values.content,
        references: values.references ?? [],
        imageUrl: values.imageUrl
      })
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
    <div class="fixed inset-0 backdrop-blur-md" style="background:color-mix(in srgb, var(--bg) 60%, transparent)" aria-hidden="true" />

    <div class="fixed inset-0 flex items-start justify-center p-4 overflow-y-auto">
      <DialogPanel
        class="w-full max-w-6xl rounded-2xl p-8 my-8 transition-all"
        style="background:var(--bg-elev); border: 1px solid var(--hairline); box-shadow: 0 40px 100px rgba(0,0,0,0.4)"
      >
        <DialogTitle class="mb-6 t-h3" style="font-size: 28px">
          {{ isEditMode ? 'Edit Post' : 'Create Post' }}
        </DialogTitle>

        <div
          v-if="formError"
          class="mb-6 rounded-xl p-4 text-sm"
          style="background: rgba(255, 77, 77, 0.05); border: 1px solid rgba(255, 77, 77, 0.1); color: #ff4d4d"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon name="lucide:alert-circle" class="w-5 h-5" />
              <span>{{ formError }}</span>
            </div>
            <button
              type="button"
              class="t-label hover:underline"
              style="font-size: 10px"
              @click="formError = null"
            >
              Dismiss
            </button>
          </div>
        </div>

        <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
          <div class="grid grid-cols-2 gap-6">
            <div class="flex flex-col gap-2">
              <label for="post-slug" class="t-label" style="font-size: 10px">Slug</label>
              <input
                id="post-slug"
                v-model="slug"
                type="text"
                maxlength="128"
                :disabled="isEditMode"
                class="rounded-lg px-4 py-2.5 text-sm transition-all"
                style="background: var(--bg-sunken); border: 1px solid var(--hairline); color: var(--fg); font-family: var(--font-mono)"
                :style="isEditMode ? { opacity: 0.5, cursor: 'not-allowed' } : {}"
              />
              <span v-if="slugError" class="text-[10px] text-red-400 font-mono">{{ slugError }}</span>
            </div>

            <div class="flex flex-col gap-2">
              <label for="post-title" class="t-label" style="font-size: 10px">Title</label>
              <input
                id="post-title"
                v-model="title"
                type="text"
                maxlength="256"
                class="rounded-lg px-4 py-2.5 text-sm transition-all focus:border-[var(--accent)] outline-none"
                style="background: var(--bg-sunken); border: 1px solid var(--hairline); color: var(--fg)"
              />
              <span v-if="titleError" class="text-[10px] text-red-400 font-mono">{{ titleError }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label class="t-label" style="font-size: 10px">Content (Markdown)</label>
              <span class="t-label" style="font-size: 9px; opacity: 0.5">Preview (HTML)</span>
            </div>
            <div class="grid grid-cols-2 gap-4 h-[50vh]">
              <textarea
                id="post-content"
                v-model="content"
                maxlength="200000"
                class="rounded-xl px-4 py-4 text-sm font-mono transition-all focus:border-[var(--accent)] outline-none resize-none"
                style="background: var(--bg-sunken); border: 1px solid var(--hairline); color: var(--fg)"
                placeholder="Write Markdown here..."
              />
              <div
                class="overflow-auto rounded-xl px-6 py-6 prose prose-slate max-w-none dark:prose-invert prose-sm"
                style="background: var(--bg-sunken); border: 1px solid var(--hairline); color: var(--fg-dim)"
                v-html="previewHtml"
              />
            </div>
            <span v-if="contentError" class="text-[10px] text-red-400 font-mono">{{ contentError }}</span>
          </div>

          <div class="flex flex-col gap-3 p-6 rounded-xl" style="background: var(--overlay); border: 1px solid var(--hairline)">
            <label class="t-label" style="font-size: 10px">Cover Image</label>
            <div class="flex items-center gap-6">
              <div
                v-if="thumbReady && thumbUrl"
                class="relative h-24 w-24 rounded-lg overflow-hidden group"
                style="border: 1px solid var(--hairline)"
              >
                <img :src="thumbUrl" class="w-full h-full object-cover" alt="Cover" />
                <button
                  type="button"
                  title="Remove image"
                  class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="removeImage"
                >
                  <Icon name="lucide:trash-2" class="w-5 h-5 text-red-400" />
                </button>
              </div>
              <div
                v-else-if="imageUrl && !thumbReady"
                class="h-24 w-24 rounded-lg flex flex-col items-center justify-center gap-2"
                style="background: var(--bg-sunken); border: 1px dashed var(--hairline)"
              >
                <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin" style="color: var(--accent)" />
                <span class="text-[8px] uppercase tracking-tighter opacity-50">Processing</span>
              </div>

              <div class="flex-1">
                <input
                  type="file"
                  id="image-upload"
                  class="hidden"
                  accept="image/*"
                  @change="handleImageUpload"
                />
                <label
                  for="image-upload"
                  class="btn btn-ghost inline-flex items-center gap-2 cursor-pointer"
                  :class="{ 'opacity-50 pointer-events-none': imageUploading || isThumbnailPolling }"
                >
                  <Icon v-if="imageUploading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                  <Icon v-else name="lucide:image" class="w-4 h-4" />
                  {{ imageUrl ? 'Change Image' : 'Upload Cover' }}
                </label>
                <p v-if="imageUrl" class="mt-2 text-[10px] font-mono opacity-40 truncate max-w-xs">
                  {{ imageUrl }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3 p-6 rounded-xl" style="background: var(--overlay); border: 1px solid var(--hairline)">
            <div class="flex items-center justify-between">
              <label class="t-label" style="font-size: 10px">References & Links</label>
              <button
                type="button"
                class="t-label hover:text-[var(--accent)] transition-colors"
                style="font-size: 10px; text-decoration: underline; text-underline-offset: 4px"
                @click="addReference({ label: '', url: '' })"
              >
                + Add reference
              </button>
            </div>
            <div class="space-y-3">
              <div
                v-for="(ref, i) in references"
                :key="ref.key"
                class="flex gap-3 items-center"
              >
                <input
                  v-model="ref.value.label"
                  type="text"
                  placeholder="Label (e.g. Source)"
                  class="flex-1 rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--accent)]"
                  style="background: var(--bg-sunken); border: 1px solid var(--hairline); color: var(--fg)"
                />
                <input
                  v-model="ref.value.url"
                  type="url"
                  placeholder="https://..."
                  class="flex-[2] rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--accent)]"
                  style="background: var(--bg-sunken); border: 1px solid var(--hairline); color: var(--fg)"
                />
                <button
                  type="button"
                  class="p-2 text-red-400 hover:text-red-300 transition-colors"
                  @click="removeReference(i)"
                >
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </button>
              </div>
            </div>
            <p v-if="references.length === 0" class="text-[10px] text-[var(--fg-faint)] font-mono uppercase tracking-widest text-center py-4">
              No references added
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-4" style="border-top: 1px solid var(--hairline)">
            <button
              type="button"
              class="btn btn-ghost"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || imageUploading || isThumbnailPolling"
              class="btn btn-primary"
            >
              <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              {{ isSubmitting ? 'Saving…' : 'Save Post' }}
            </button>
          </div>
        </form>
      </DialogPanel>
    </div>
  </Dialog>
</template>
