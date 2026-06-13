<script setup lang="ts">
definePageMeta({ layout: false })

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref<string | null>(null)

async function submit() {
  if (!email.value || !password.value) return
  loading.value = true
  errorMsg.value = null

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await navigateTo('/admin/quality')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; statusCode?: number }
    if (e?.statusCode === 401) {
      errorMsg.value = 'Incorrect email or password.'
    } else if (e?.statusCode === 403) {
      errorMsg.value = 'Password reset required — use AWS console to set a new password.'
    } else if (e?.statusCode === 503) {
      errorMsg.value = 'Authentication service unavailable. Try again later.'
    } else {
      errorMsg.value = e?.data?.message ?? 'Login failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-root">
    <div class="login-bg">
      <div class="login-grid" />
      <div class="login-glow" />
    </div>

    <header class="login-top-bar">
      <span class="t-overline">krealalejo.dev</span>
      <a href="/" class="login-back-link t-overline">← Portfolio</a>
    </header>

    <main class="login-center">
      <div class="login-eyebrow">
        <span class="login-eyebrow-dot" />
        <span class="t-overline">Admin Access</span>
      </div>

      <h1 class="login-heading">Sign <em>In</em></h1>

      <form class="login-card" @submit.prevent="submit">
        <div class="login-card-glow-line" />

        <div class="login-card-logo">
          <div class="kra-nav-logo" style="cursor:default; font-size:18px">
            <div class="dot" />
            <span>KRA <span style="color:var(--accent)">Admin</span></span>
          </div>
        </div>

        <div class="login-card-divider" />

        <div v-if="errorMsg" role="alert" class="login-card-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ errorMsg }}
        </div>

        <div class="login-field">
          <label class="login-label t-overline" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="login-input"
            placeholder="you@example.com"
            autocomplete="email"
            required
            :disabled="loading"
          />
        </div>

        <div class="login-field">
          <label class="login-label t-overline" for="password">Password</label>
          <div class="login-input-wrap">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="login-input"
              placeholder="••••••••"
              autocomplete="current-password"
              required
              :disabled="loading"
            />
            <button
              type="button"
              class="login-eye"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          <svg v-if="loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
      </form>
    </main>

    <footer class="login-footer">
      <span class="t-overline">© {{ new Date().getFullYear() }} Kevin Realalejo</span>
    </footer>
  </div>
</template>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }

.login-root {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.login-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--hairline) 1px, transparent 1px),
    linear-gradient(90deg, var(--hairline) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%);
}

.login-glow {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 700px;
  height: 500px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 7%, transparent);
  filter: blur(100px);
}

.login-top-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 40px;
  border-bottom: 1px solid var(--hairline);
}

.login-back-link {
  color: var(--fg-muted);
  text-decoration: none;
  transition: color 0.2s var(--ease-out);
}
.login-back-link:hover { color: var(--accent); }

.login-center {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 28px;
}

.login-eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
}

.login-eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 70%, transparent);
  animation: pulse-dot 2.4s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 70%, transparent); }
  50% { opacity: 0.6; box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent); }
}

.login-heading {
  font-family: var(--font-display);
  font-size: clamp(56px, 10vw, 120px);
  line-height: 0.93;
  letter-spacing: -0.04em;
  font-weight: 500;
  font-variation-settings: "wdth" 90, "opsz" 144;
  text-align: center;
}

.login-heading em {
  font-style: normal;
  color: var(--accent);
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 360px;
  padding: 36px;
  background: var(--bg-elev);
  border: 1px solid var(--hairline-strong);
  border-radius: 8px;
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.35),
    0 0 0 1px color-mix(in srgb, var(--accent) 5%, transparent);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.login-card-glow-line {
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.6;
  border-radius: 0 0 2px 2px;
}

.login-card-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.login-card-divider {
  height: 1px;
  background: var(--hairline);
  margin-bottom: 24px;
}

.login-card-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: #f87171;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.18);
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.login-label {
  font-size: 10px;
}

.login-input-wrap {
  position: relative;
}

.login-input {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  font-size: 14px;
  font-family: var(--font-sans);
  color: var(--fg);
  background: var(--bg-sunken);
  border: 1px solid var(--hairline-strong);
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
  box-sizing: border-box;
}

.login-input-wrap .login-input {
  padding-right: 40px;
}

.login-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 15%, transparent);
}

.login-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-input::placeholder {
  color: var(--fg-faint);
}

.login-eye {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--fg-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: none;
  border: none;
  transition: color 0.2s var(--ease-out);
}
.login-eye:hover { color: var(--fg); }

.login-btn {
  width: 100%;
  justify-content: center;
  padding: 13px;
  font-size: 15px;
  gap: 10px;
  margin-top: 8px;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 40px;
  border-top: 1px solid var(--hairline);
}

@media (max-width: 560px) {
  .login-top-bar { padding: 18px 20px; }
  .login-center { padding: 32px 20px; gap: 20px; }
  .login-card { padding: 28px 24px; }
  .login-footer { padding: 16px 20px; }
}
</style>
