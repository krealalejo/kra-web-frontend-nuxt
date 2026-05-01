<script setup lang="ts">

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
  const { $gsap: gsap } = useNuxtApp()
  gsap.fromTo('.page-head .overline', { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.6 })
  gsap.fromTo('.page-head h1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.1, ease: 'power3.out' })
  gsap.fromTo('.page-head .kicker', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.25 })
  gsap.fromTo('.contact-form', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.4 })
  gsap.fromTo('.contact-facts', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.5 })
})
</script>

<template>
  <div>
    <header class="page-head">
      <div class="shell">
        <div class="overline"><span class="bar" /> §04 — Contact</div>
        <h1>Let's <em>talk</em>.</h1>
        <p class="kicker">
          Questions, collaborations, or just a hello — all welcome.<br>
          I read every message personally and reply within a<br>
          working day or two. No auto-responders, no intake<br>
          forms, no nonsense.
        </p>
      </div>
    </header>

    <section class="shell contact-section">
      <div class="contact-grid">


        <div class="contact-form">
          <div class="form-num">Nº01</div>

          <div v-if="success" class="form-success-state">
            <div class="success-title">Message <br>sent.</div>
            <p>Thanks for reaching out — I'll be in touch soon.</p>
            <button class="btn btn-ghost" @click="success = false">Send another</button>
          </div>

          <div v-else>
            <div class="form-header">
              <span class="label">New message</span>
              <h2>Send me a note</h2>
            </div>

            <form novalidate @submit.prevent="onSubmit">
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
                  rows="4"
                  placeholder="Tell me a little about what you're working on…"
                />
                <div class="form-help">
                  <span :class="{ warn: !messageValid }">
                    {{ messageValid ? '' : `${10 - messageLength} more character${10 - messageLength === 1 ? '' : 's'} needed` }}
                  </span>
                  <span>{{ messageLength }}/4000</span>
                </div>
              </div>

              <div v-if="submitError" role="alert" class="submit-error">
                {{ submitError }}
              </div>

              <div class="form-submit">
                <span class="note">No spam pls. Your message goes straight to me.</span>
                <button type="submit" class="btn" :disabled="sending">
                  <template v-if="sending">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon">
                      <circle cx="12" cy="12" r="10" stroke-opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/>
                    </svg>
                    Sending…
                  </template>
                  <template v-else>
                    Send message
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="transform: rotate(-45deg)">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                    </svg>
                  </template>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="contact-facts">
          <div class="row">
            <span class="k">Location</span>
            <span class="v">Barcelona, Spain</span>
            <span class="m">CEST · UTC+1</span>
          </div>
          <div class="row">
            <span class="k">Response</span>
            <span class="v">24 — 48 hours</span>
            <span class="m">MON — FRI</span>
          </div>
          <div class="row">
            <span class="k">Languages</span>
            <span class="v">English · Español</span>
            <span class="m">EN / ES</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contact-section {
  padding-top: 0;
  padding-bottom: 120px;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 80px;
  align-items: flex-start;
}


.contact-facts {
  grid-column: 1;
  border-top: 1px solid var(--hairline);
  max-width: 520px;
}

.contact-facts .row {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 20px;
  padding: 24px 0;
  border-bottom: 1px solid var(--hairline);
  align-items: baseline;
}

.contact-facts .k {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-muted);
}

.contact-facts .v {
  font-size: 15px;
  color: var(--fg);
}

.contact-facts .m {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--fg-muted);
  text-align: right;
}

.contact-form {
  grid-column: 2;
  grid-row: 1 / span 2;
  background: var(--bg-elev);
  border: 1px solid var(--hairline);
  padding: 48px;
  border-radius: 4px;
  position: relative;
}

.form-header {
  margin-bottom: 48px;
}

.form-header .label {
  display: block;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-muted);
  margin-bottom: 12px;
}

.form-header h2 {
  font-family: var(--font-display);
  font-size: 36px;
  letter-spacing: -0.02em;
  font-weight: 500;
  color: var(--fg);
}

.contact-form .form-num {
  position: absolute;
  top: 32px;
  right: 40px;
  font-family: var(--font-display);
  font-size: 72px;
  color: var(--hairline-strong);
  line-height: 1;
  pointer-events: none;
  font-weight: 500;
  opacity: 0.5;
}

.form-field {
  margin-bottom: 40px;
}

.form-field label {
  display: block;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-muted);
  margin-bottom: 16px;
}

.form-field input, .form-field textarea {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--hairline-strong);
  padding: 12px 0;
  font-family: var(--font-sans);
  font-size: 20px;
  color: var(--fg);
  outline: none;
  transition: border-color 0.3s var(--ease-out);
}

.form-field textarea {
  min-height: 140px;
  font-size: 16px;
  line-height: 1.6;
}

.form-field input:focus, .form-field textarea:focus {
  border-color: var(--accent);
}

.form-submit {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
}

.form-submit .note {
  font-size: 13px;
  color: var(--fg-muted);
  max-width: 22ch;
  line-height: 1.4;
}

.form-submit .btn {
  background: var(--bg-sunken);
  border: 1px solid var(--hairline-strong);
  color: var(--fg-dim);
  padding: 14px 28px;
}

.form-submit .btn:hover {
  background: var(--overlay);
  color: var(--fg);
  border-color: var(--fg-muted);
}

.form-success-state {
  padding: 40px 0;
}

.success-title {
  font-family: var(--font-display);
  font-size: 48px;
  line-height: 1;
  letter-spacing: -0.02em;
  font-weight: 500;
  margin-bottom: 16px;
}

.submit-error {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #E86D6D;
  margin-bottom: 24px;
  padding: 12px 16px;
  border: 1px solid rgba(232,109,109,0.3);
  border-radius: 4px;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@media (max-width: 1024px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 64px;
  }
  .contact-facts {
    grid-column: auto;
    max-width: 100%;
    margin-top: 0;
    order: 3;
  }
  .contact-form {
    grid-column: auto;
    grid-row: auto;
    order: 2;
  }
}

@media (max-width: 640px) {
  .contact-section {
    padding-top: 40px;
  }
  .contact-form {
    padding: 32px 24px;
  }
  .form-header h2 {
    font-size: 28px;
  }
  .contact-form .form-num {
    font-size: 48px;
    top: 24px;
    right: 24px;
  }
}
</style>
