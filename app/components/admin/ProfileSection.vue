<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

const runtimeConfig = useRuntimeConfig()

const homePortraitKey = ref<string | null>(null)
const homePortraitUploading = ref(false)
const homeThumbReady = ref(false)
const isHomeThumbPolling = ref(false)
const homePortraitError = ref<string | null>(null)

const cvPortraitKey = ref<string | null>(null)
const cvPortraitUploading = ref(false)
const cvThumbReady = ref(false)
const isCvThumbPolling = ref(false)
const cvPortraitError = ref<string | null>(null)
const cvPdfKey = ref<string | null>(null)

const { getThumbUrl } = useS3()
const homeThumbUrl = computed(() => getThumbUrl(homePortraitKey.value))
const cvThumbUrl = computed(() => getThumbUrl(cvPortraitKey.value))

let homePoll: ReturnType<typeof setInterval> | null = null
let cvPoll: ReturnType<typeof setInterval> | null = null

onUnmounted(() => {
  if (homePoll) clearInterval(homePoll)
  if (cvPoll) clearInterval(cvPoll)
})

onMounted(async () => {
  try {
    const profile = await $fetch<{ homePortraitUrl: string | null; cvPortraitUrl: string | null; cvPdfUrl: string | null }>(
      `${runtimeConfig.public.apiBase}/config/profile`
    )
    homePortraitKey.value = profile.homePortraitUrl ?? null
    homeThumbReady.value = !!profile.homePortraitUrl
    cvPortraitKey.value = profile.cvPortraitUrl ?? null
    cvThumbReady.value = !!profile.cvPortraitUrl
    cvPdfKey.value = profile.cvPdfUrl ?? null
  } catch (e: unknown) {
    const error = e as { response?: { status?: number }; statusCode?: number }
    const status = error.response?.status ?? error.statusCode
    if (status !== 404) {
      homePortraitError.value = 'Failed to load current portraits'
    }
  }
})

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 20 * 1024 * 1024

async function uploadPortrait(
  file: File,
  portraitType: 'home' | 'cv',
  uploadingRef: Ref<boolean>,
  errorRef: Ref<string | null>,
  keyRef: Ref<string | null>,
  readyRef: Ref<boolean>,
  pollingRef: Ref<boolean>
) {
  if (!ALLOWED_TYPES.has(file.type)) {
    errorRef.value = 'Only JPEG, PNG, or WebP images are allowed'
    return
  }
  if (file.size > MAX_BYTES) {
    errorRef.value = 'Image must be smaller than 20 MB'
    return
  }

  uploadingRef.value = true
  errorRef.value = null

  try {
    const { uploadUrl, s3Key } = await $fetch<{ uploadUrl: string; s3Key: string }>('/api/admin/upload', {
      method: 'POST',
      body: { filename: file.name, contentType: file.type, uploadType: 'portrait' },
    })

    await $fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    const payload = {
      homePortraitUrl: portraitType === 'home' ? s3Key : homePortraitKey.value,
      cvPortraitUrl: portraitType === 'cv' ? s3Key : cvPortraitKey.value,
      cvPdfUrl: cvPdfKey.value
    }

    await $fetch('/api/admin/profile', {
      method: 'PUT',
      body: payload,
    })

    keyRef.value = s3Key

    let attempts = 0
    pollingRef.value = true
    const currentPoll = setInterval(async () => {
      attempts++
      try {
        const { ready } = await $fetch<{ ready: boolean }>(
          `/api/admin/image-status?key=${encodeURIComponent(s3Key)}`
        )
        if (ready) {
          readyRef.value = true
          pollingRef.value = false
          clearInterval(currentPoll)
        } else if (attempts >= 15) {
          clearInterval(currentPoll)
          pollingRef.value = false
          errorRef.value = 'Image uploaded but thumbnail is still generating.'
        }
      } catch {
        if (attempts >= 15) {
          pollingRef.value = false
          clearInterval(currentPoll)
        }
      }
    }, 2000)

    if (portraitType === 'home') homePoll = currentPoll
    else cvPoll = currentPoll
  } catch (e: unknown) {
    errorRef.value = e instanceof Error ? e.message : 'Upload failed'
  } finally {
    uploadingRef.value = false
  }
}

function handleHomeUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  homeThumbReady.value = false
  uploadPortrait(file, 'home', homePortraitUploading, homePortraitError, homePortraitKey, homeThumbReady, isHomeThumbPolling)
}

function handleCvUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  cvThumbReady.value = false
  uploadPortrait(file, 'cv', cvPortraitUploading, cvPortraitError, cvPortraitKey, cvThumbReady, isCvThumbPolling)
}

async function removePortrait(
  portraitType: 'home' | 'cv',
  keyRef: Ref<string | null>,
  errorRef: Ref<string | null>,
  readyRef: Ref<boolean>
) {
  errorRef.value = null
  try {
    const payload = {
      homePortraitUrl: portraitType === 'home' ? null : homePortraitKey.value,
      cvPortraitUrl: portraitType === 'cv' ? null : cvPortraitKey.value,
      cvPdfUrl: cvPdfKey.value
    }

    await $fetch('/api/admin/profile', {
      method: 'PUT',
      body: payload,
    })

    keyRef.value = null
    readyRef.value = false
  } catch (e: unknown) {
    errorRef.value = e instanceof Error ? e.message : 'Removal failed'
  }
}

function handleRemoveHome() {
  removePortrait('home', homePortraitKey, homePortraitError, homeThumbReady)
}

function handleRemoveCv() {
  removePortrait('cv', cvPortraitKey, cvPortraitError, cvThumbReady)
}
</script>

<template>
  <div class="mb-12">
    <div class="mb-8 flex items-center justify-between pb-6" style="border-bottom: 1px solid var(--hairline)">
      <div>
        <h2 class="t-h2">Profile Portraits</h2>
        <p class="t-label" style="font-size: 10px; margin-top: 4px">Upload portrait images shown on Home and CV pages</p>
      </div>
    </div>

    <div class="grid gap-8 grid-cols-1 sm:grid-cols-2">
      <div class="rounded-2xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline)">
        <div class="t-overline mb-4">Home Portrait</div>
        <div class="mb-4 relative group" style="aspect-ratio: 3/4; max-width: 180px; overflow: hidden; border-radius: 8px; background: var(--overlay);">
          <img v-if="homeThumbUrl && homeThumbReady" :src="homeThumbUrl" alt="Home portrait" style="width:100%;height:100%;object-fit:cover;" />
          <div v-else-if="(homePortraitKey && !homeThumbReady) || isHomeThumbPolling" class="flex flex-col items-center justify-center h-full gap-2" style="background: var(--bg-sunken); border: 1px dashed var(--hairline)">
            <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin" style="color: var(--accent)" />
            <span class="text-[8px] uppercase tracking-tighter opacity-50">Processing</span>
          </div>
          <div v-else class="flex items-center justify-center h-full" style="color: var(--fg-faint); font-size: 12px; font-family: var(--font-mono);">No portrait</div>

          <button
            v-if="homePortraitKey && homeThumbReady"
            type="button"
            title="Remove portrait"
            class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
            @click="handleRemoveHome"
          >
            <Icon name="lucide:trash-2" class="w-6 h-6 text-red-400" />
          </button>
        </div>
        <label class="btn btn-primary" style="cursor: pointer;">
          <span v-if="homePortraitUploading">Uploading…</span>
          <span v-else>Upload Home Portrait</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="homePortraitUploading || isHomeThumbPolling" @change="handleHomeUpload" />
        </label>
        <p v-if="homePortraitError" class="mt-2 text-sm" style="color: #ff4d4d">{{ homePortraitError }}</p>
      </div>

      <div class="rounded-2xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline)">
        <div class="t-overline mb-4">CV Portrait</div>
        <div class="mb-4 relative group" style="aspect-ratio: 3/4; max-width: 180px; overflow: hidden; border-radius: 8px; background: var(--overlay);">
          <img v-if="cvThumbUrl && cvThumbReady" :src="cvThumbUrl" alt="CV portrait" style="width:100%;height:100%;object-fit:cover;" />
          <div v-else-if="(cvPortraitKey && !cvThumbReady) || isCvThumbPolling" class="flex flex-col items-center justify-center h-full gap-2" style="background: var(--bg-sunken); border: 1px dashed var(--hairline)">
            <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin" style="color: var(--accent)" />
            <span class="text-[8px] uppercase tracking-tighter opacity-50">Processing</span>
          </div>
          <div v-else class="flex items-center justify-center h-full" style="color: var(--fg-faint); font-size: 12px; font-family: var(--font-mono);">No portrait</div>

          <button
            v-if="cvPortraitKey && cvThumbReady"
            type="button"
            title="Remove portrait"
            class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
            @click="handleRemoveCv"
          >
            <Icon name="lucide:trash-2" class="w-6 h-6 text-red-400" />
          </button>
        </div>
        <label class="btn btn-primary" style="cursor: pointer;">
          <span v-if="cvPortraitUploading">Uploading…</span>
          <span v-else>Upload CV Portrait</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="cvPortraitUploading || isCvThumbPolling" @change="handleCvUpload" />
        </label>
        <p v-if="cvPortraitError" class="mt-2 text-sm" style="color: #ff4d4d">{{ cvPortraitError }}</p>
      </div>
    </div>
  </div>
</template>
