<script setup lang="ts">
const config = useRuntimeConfig()

const email = ref('')
const message = ref('')
const sending = ref(false)
const success = ref(false)
const submitError = ref<string | null>(null)

async function onSubmit() {
  submitError.value = null
  success.value = false
  sending.value = true
  const raw = config.public.apiBase
  const apiBase = typeof raw === 'string' ? raw.replace(/\/$/, '') : ''
  if (!apiBase) {
    submitError.value = 'NUXT_PUBLIC_API_BASE_URL is not set.'
    sending.value = false
    return
  }
  try {
    await $fetch(`${apiBase}/contact`, {
      method: 'POST',
      body: { email: email.value, message: message.value }
    })
    success.value = true
    email.value = ''
    message.value = ''
  } catch {
    submitError.value = 'Could not send your message. Please try again later.'
  } finally {
    sending.value = false
  }
}

useSeoMeta({
  title: 'Contact · Project KRA',
  description: 'Send a message to the KRA team.',
  ogTitle: 'Contact · Project KRA',
  ogDescription: 'Contact form.'
})
</script>

<template>
  <div class="mx-auto max-w-lg px-4 py-10">
    <h1 class="text-2xl font-semibold text-slate-900">
      Contact
    </h1>
    <p class="mt-2 text-sm text-slate-600">
      Send a message; we store it in the backend (DynamoDB) for review.
    </p>

    <form
      class="mt-8 space-y-4"
      @submit.prevent="onSubmit"
    >
      <div>
        <label
          for="email"
          class="block text-sm font-medium text-slate-700"
        >Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
      </div>
      <div>
        <label
          for="message"
          class="block text-sm font-medium text-slate-700"
        >Message</label>
        <textarea
          id="message"
          v-model="message"
          required
          minlength="10"
          maxlength="4000"
          rows="6"
          class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
        <p class="mt-1 text-xs text-slate-500">
          Minimum 10 characters.
        </p>
      </div>
      <button
        type="submit"
        class="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="sending"
      >
        {{ sending ? 'Sending…' : 'Send' }}
      </button>
    </form>

    <div
      v-if="success"
      class="mt-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900"
      role="status"
    >
      Message sent. Thank you.
    </div>
    <div
      v-if="submitError"
      class="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900"
      role="alert"
    >
      {{ submitError }}
    </div>
  </div>
</template>
