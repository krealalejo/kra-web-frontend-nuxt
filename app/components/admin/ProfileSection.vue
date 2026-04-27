<script setup lang="ts">
import type { Ref } from 'vue'

const runtimeConfig = useRuntimeConfig()

// Home portrait state
const homePortraitKey = ref<string | null>(null)
const homePortraitUploading = ref(false)
const homePortraitError = ref<string | null>(null)

// CV portrait state
const cvPortraitKey = ref<string | null>(null)
const cvPortraitUploading = ref(false)
const cvPortraitError = ref<string | null>(null)

// Computed thumbnail URLs (derive from S3 key — same pattern as BlogPostForm)
const homeThumbUrl = computed(() => {
  if (!homePortraitKey.value) return null
  const thumbKey = homePortraitKey.value
    .replace(/^images\//, 'thumbnails/')
    .replace(/\.[^.]+$/, '-thumb.webp')
  return `${runtimeConfig.public.s3PublicBucketUrl}/${thumbKey}`
})

const cvThumbUrl = computed(() => {
  if (!cvPortraitKey.value) return null
  const thumbKey = cvPortraitKey.value
    .replace(/^images\//, 'thumbnails/')
    .replace(/\.[^.]+$/, '-thumb.webp')
  return `${runtimeConfig.public.s3PublicBucketUrl}/${thumbKey}`
})

// Fetch existing portrait keys on mount
onMounted(async () => {
  try {
    const profile = await $fetch<{ homePortraitUrl: string | null; cvPortraitUrl: string | null }>(
      `${runtimeConfig.public.apiBase}/config/profile`
    )
    homePortraitKey.value = profile.homePortraitUrl ?? null
    cvPortraitKey.value = profile.cvPortraitUrl ?? null
  } catch {
    // Silently ignore — no portraits configured yet
  }
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

// Upload handler (shared logic for both portrait types)
async function uploadPortrait(
  file: File,
  portraitType: 'home' | 'cv',
  uploadingRef: Ref<boolean>,
  errorRef: Ref<string | null>,
  keyRef: Ref<string | null>
) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    errorRef.value = 'Only JPEG, PNG, or WebP images are allowed'
    return
  }
  if (file.size > MAX_BYTES) {
    errorRef.value = 'Image must be smaller than 5 MB'
    return
  }

  uploadingRef.value = true
  errorRef.value = null

  try {
    // Step 1: Get presigned URL (reuse existing /api/admin/upload proxy)
    const { uploadUrl, s3Key } = await $fetch<{ uploadUrl: string; s3Key: string }>('/api/admin/upload', {
      method: 'POST',
      body: { filename: file.name, contentType: file.type },
    })

    // Step 2: PUT file directly to S3 via presigned URL
    await $fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    // Step 3: Persist the S3 key in AppConfig
    const payload = portraitType === 'home'
      ? { homePortraitUrl: s3Key }
      : { cvPortraitUrl: s3Key }

    await $fetch('/api/admin/profile', {
      method: 'PUT',
      body: payload,
    })

    keyRef.value = s3Key
  } catch (e: unknown) {
    errorRef.value = e instanceof Error ? e.message : 'Upload failed'
  } finally {
    uploadingRef.value = false
  }
}

function handleHomeUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadPortrait(file, 'home', homePortraitUploading, homePortraitError, homePortraitKey)
}

function handleCvUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadPortrait(file, 'cv', cvPortraitUploading, cvPortraitError, cvPortraitKey)
}
</script>

<template>
  <div class="mb-12">
    <!-- Section header -->
    <div class="mb-8 flex items-center justify-between pb-6" style="border-bottom: 1px solid var(--hairline)">
      <div>
        <h2 class="t-h2">Profile Portraits</h2>
        <p class="t-label" style="font-size: 10px; margin-top: 4px">Upload portrait images shown on Home and CV pages</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
      <!-- Home portrait -->
      <div class="rounded-2xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline)">
        <div class="t-overline mb-4">Home Portrait</div>
        <!-- Preview -->
        <div class="mb-4" style="aspect-ratio: 3/4; max-width: 180px; overflow: hidden; border-radius: 8px; background: var(--overlay);">
          <img v-if="homeThumbUrl" :src="homeThumbUrl" alt="Home portrait" style="width:100%;height:100%;object-fit:cover;" />
          <div v-else class="flex items-center justify-center h-full" style="color: var(--fg-faint); font-size: 12px; font-family: var(--font-mono);">No portrait</div>
        </div>
        <!-- Upload button -->
        <label class="btn btn-primary" style="cursor: pointer;">
          <span v-if="homePortraitUploading">Uploading…</span>
          <span v-else>Upload Home Portrait</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="homePortraitUploading" @change="handleHomeUpload" />
        </label>
        <p v-if="homePortraitError" class="mt-2 text-sm" style="color: #ff4d4d">{{ homePortraitError }}</p>
      </div>

      <!-- CV portrait -->
      <div class="rounded-2xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline)">
        <div class="t-overline mb-4">CV Portrait</div>
        <!-- Preview -->
        <div class="mb-4" style="aspect-ratio: 3/4; max-width: 180px; overflow: hidden; border-radius: 8px; background: var(--overlay);">
          <img v-if="cvThumbUrl" :src="cvThumbUrl" alt="CV portrait" style="width:100%;height:100%;object-fit:cover;" />
          <div v-else class="flex items-center justify-center h-full" style="color: var(--fg-faint); font-size: 12px; font-family: var(--font-mono);">No portrait</div>
        </div>
        <!-- Upload button -->
        <label class="btn btn-primary" style="cursor: pointer;">
          <span v-if="cvPortraitUploading">Uploading…</span>
          <span v-else>Upload CV Portrait</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="cvPortraitUploading" @change="handleCvUpload" />
        </label>
        <p v-if="cvPortraitError" class="mt-2 text-sm" style="color: #ff4d4d">{{ cvPortraitError }}</p>
      </div>
    </div>
  </div>
</template>
