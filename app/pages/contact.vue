<script setup lang="ts">
const config = useRuntimeConfig()

const email = ref('')
const message = ref('')
const sending = ref(false)
const success = ref(false)
const submitError = ref<string | null>(null)
const emailFocused = ref(false)
const messageFocused = ref(false)

const messageLength = computed(() => message.value.length)
const messageValid = computed(() => messageLength.value >= 10)

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
  <div class="flex min-h-[calc(100vh-12rem)] items-start justify-center py-6 sm:py-12">
    <div class="w-full max-w-4xl">

      <!-- Card wrapper -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/60">
        <div class="grid grid-cols-1 lg:grid-cols-5">

          <!-- Left panel — decorative sidebar -->
          <div class="bg-slate-100 px-8 py-10 dark:bg-slate-950 lg:col-span-2 lg:py-14">
            <div>
              <!-- Icon badge -->
              <div class="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800">
                <svg class="h-6 w-6 text-slate-600 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>

              <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Get in touch
              </h1>
              <p class="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Have a question, idea, or just want to say hi? Your message is stored securely and I'll get back to you soon!
              </p>

              <!-- Divider -->
              <div class="my-8 h-px bg-slate-300/70 dark:bg-slate-700/60" />

              <!-- Contact details -->
              <ul class="space-y-4">
                <li class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800">
                    <svg class="h-4 w-4 text-slate-500 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </span>
                  Replies within 24–48 h
                </li>
                <li class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800">
                    <svg class="h-4 w-4 text-slate-500 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                  </span>
                  Stored securely in DynamoDB
                </li>
                <li class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800">
                    <svg class="h-4 w-4 text-slate-500 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                    </svg>
                  </span>
                  Project KRA
                </li>
              </ul>
            </div>
          </div>

          <!-- Right panel — form -->
          <div class="px-6 py-10 sm:px-10 lg:col-span-3 lg:py-14">

            <!-- Success state -->
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
            >
              <div
                v-if="success"
                class="flex flex-col items-center justify-center gap-4 py-8 text-center"
              >
                <div class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <svg class="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">Message sent!</p>
                  <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Thanks for reaching out. I'll be in touch soon.</p>
                </div>
                <button
                  class="mt-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  @click="success = false"
                >
                  Send another
                </button>
              </div>
            </Transition>

            <form
              v-if="!success"
              class="space-y-6"
              novalidate
              @submit.prevent="onSubmit"
            >
              <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  New message
                </p>
                <h2 class="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                  Send us a note
                </h2>
              </div>

              <!-- Email field -->
              <div class="space-y-1.5">
                <label
                  for="email"
                  class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Email address
                </label>
                <div
                  class="relative flex items-center overflow-hidden rounded-xl border transition-all duration-200"
                  :class="emailFocused
                    ? 'border-slate-900 ring-2 ring-slate-900/10 dark:border-slate-400 dark:ring-slate-400/10'
                    : 'border-slate-200 dark:border-slate-700'"
                >
                  <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                    <svg
                      class="h-4 w-4 transition-colors duration-200"
                      :class="emailFocused ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'"
                      fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    v-model="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    class="w-full bg-transparent py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                    @focus="emailFocused = true"
                    @blur="emailFocused = false"
                  >
                </div>
              </div>

              <!-- Message field -->
              <div class="space-y-1.5">
                <label
                  for="message"
                  class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Message
                </label>
                <div
                  class="relative overflow-hidden rounded-xl border transition-all duration-200"
                  :class="messageFocused
                    ? 'border-slate-900 ring-2 ring-slate-900/10 dark:border-slate-400 dark:ring-slate-400/10'
                    : 'border-slate-200 dark:border-slate-700'"
                >
                  <span class="pointer-events-none absolute left-3.5 top-3.5">
                    <svg
                      class="h-4 w-4 transition-colors duration-200"
                      :class="messageFocused ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'"
                      fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                    </svg>
                  </span>
                  <textarea
                    id="message"
                    v-model="message"
                    required
                    minlength="10"
                    maxlength="4000"
                    rows="5"
                    placeholder="Your message here…"
                    class="w-full resize-none bg-transparent py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                    @focus="messageFocused = true"
                    @blur="messageFocused = false"
                  />
                  <!-- char counter bar -->
                  <div class="flex items-center justify-between border-t border-slate-100 px-3 py-2 dark:border-slate-800">
                    <span
                      class="text-xs transition-colors"
                      :class="messageValid ? 'text-slate-400 dark:text-slate-500' : 'text-amber-500 dark:text-amber-400'"
                    >
                      {{ messageValid ? '' : `${10 - messageLength} more character${10 - messageLength === 1 ? '' : 's'} needed` }}
                    </span>
                    <span class="text-xs tabular-nums text-slate-400 dark:text-slate-500">
                      {{ messageLength }}<span class="text-slate-300 dark:text-slate-600">/4000</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Error banner -->
              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
              >
                <div
                  v-if="submitError"
                  class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/50 dark:bg-red-950/40"
                  role="alert"
                >
                  <svg class="mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  <p class="text-sm text-red-800 dark:text-red-300">{{ submitError }}</p>
                </div>
              </Transition>

              <!-- Submit -->
              <button
                type="submit"
                :disabled="sending"
                class="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
              >
                <!-- Shimmer on hover -->
                <span class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full dark:via-slate-900/10" />

                <template v-if="sending">
                  <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending…
                </template>
                <template v-else>
                  Send message
                  <svg class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </template>
              </button>

              <p class="text-center text-xs text-slate-400 dark:text-slate-500">
                No spam pls. Your message goes straight to me
              </p>
            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
