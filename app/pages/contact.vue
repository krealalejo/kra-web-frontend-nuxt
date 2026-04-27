<script setup lang="ts">
import gsap from 'gsap'

const config = useRuntimeConfig()

const email = ref('')
const message = ref('')
const sending = ref(false)
const success = ref(false)
const submitError = ref<string | null>(null)

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
  title: 'Contact · Kevin Real Alejo',
  description: 'Get in touch with Kevin Real Alejo — full-stack engineer.',
  ogTitle: 'Contact · Kevin Real Alejo',
  ogDescription: 'Send a message directly to Kevin.'
})

onMounted(() => {
  gsap.fromTo('.page-head .overline', { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.6 })
  gsap.fromTo('.page-head h1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.1, ease: 'power3.out' })
  gsap.fromTo('.contact-left', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.25 })
  gsap.fromTo('.contact-form', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.35 })
})
</script>

<template>
  <div>
    <header class="page-head">
      <div class="shell">
        <div class="overline"><span class="bar" /> §06 — Contact</div>
        <h1>Let's <em>talk</em>.</h1>
      </div>
    </header>

    <section class="shell">
      <div class="contact-grid">
        <div class="contact-left">
          <h2>Say<br><em>hello</em>.</h2>
          <p>Have a project in mind, a question about the stack, or just want to connect? Drop me a line — I reply within 24–48 hours.</p>

          <div class="contact-facts">
            <div class="row">
              <span class="k">Location</span>
              <span class="v">Madrid, Spain · UTC+1</span>
            </div>
            <div class="row">
              <span class="k">Email</span>
              <span class="v">hi@krealejo.dev</span>
            </div>
            <div class="row">
              <span class="k">GitHub</span>
              <a href="https://github.com/krealalejo" target="_blank" rel="noopener" class="v" style="color:var(--accent)">@krealalejo ↗</a>
            </div>
            <div class="row">
              <span class="k">LinkedIn</span>
              <a href="https://www.linkedin.com/in/kevinrealalejo/" target="_blank" rel="noopener" class="v" style="color:var(--accent)">kevinrealalejo ↗</a>
            </div>
            <div class="row">
              <span class="k">Response</span>
              <span class="v">Within 24–48 h</span>
            </div>
          </div>
        </div>

        <div class="contact-form">
          <div class="form-num">01</div>

          <div v-if="success" style="display:flex;flex-direction:column;align-items:flex-start;gap:16px;padding:40px 0;">
            <div style="font-family:var(--font-display);font-size:42px;line-height:1;letter-spacing:-0.02em;font-weight:500;">Message<br>sent.</div>
            <p style="font-size:14px;color:var(--fg-muted);">Thanks for reaching out — I'll be in touch soon.</p>
            <button class="btn btn-ghost" @click="success = false">Send another</button>
          </div>

          <form v-else novalidate @submit.prevent="onSubmit">
            <div class="form-field">
              <label for="email">Email address</label>
              <input id="email" v-model="email" type="email" required placeholder="you@example.com" />
            </div>

            <div class="form-field">
              <label for="message">Message</label>
              <textarea
                id="message"
                v-model="message"
                required
                minlength="10"
                maxlength="4000"
                rows="5"
                placeholder="Your message here…"
              />
              <div class="form-help">
                <span :class="{ warn: !messageValid }">
                  {{ messageValid ? '' : `${10 - messageLength} more character${10 - messageLength === 1 ? '' : 's'} needed` }}
                </span>
                <span>{{ messageLength }}/4000</span>
              </div>
            </div>

            <div v-if="submitError" style="font-family:var(--font-mono);font-size:12px;color:#E86D6D;margin-bottom:20px;padding:12px 16px;border:1px solid rgba(232,109,109,0.3);border-radius:3px;">
              {{ submitError }}
            </div>

            <div class="form-submit">
              <span class="note">Stored securely · Replied personally</span>
              <button type="submit" class="btn" :disabled="sending" style="min-width:140px;">
                <template v-if="sending">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/>
                  </svg>
                  Sending…
                </template>
                <template v-else>
                  Send message
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M2 10L10 2M10 2H4M10 2v6"/>
                  </svg>
                </template>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; padding-top: 32px !important; }
}
</style>
