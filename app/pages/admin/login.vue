<script setup lang="ts">
definePageMeta({ layout: 'admin' })
import { useNotificationStore } from '~/stores/notifications'

const config = useRuntimeConfig()
const route = useRoute()
const notifications = useNotificationStore()

const errorMsg = computed(() => {
  const err = route.query.error as string | undefined
  if (!err) return null
  const messages: Record<string, string> = {
    access_denied: 'Login was cancelled or access was denied.',
    token_exchange_failed: 'Unable to complete login. Please try again.',
    token_fetch_failed: 'Unable to connect to authentication service. Please try again later.',
    missing_code: 'Invalid login response. Please try again.',
  }
  return messages[err] || 'Login failed. Please check your credentials and try again.'
})

watch(errorMsg, (msg) => {
  if (msg) {
    notifications.add({ type: 'error', title: 'Login Error', message: msg })
  }
}, { immediate: true })

function signIn() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.public.cognitoClientId,
    redirect_uri: config.public.cognitoRedirectUri || `${window.location.origin}/api/auth/callback`,
    scope: 'openid email profile',
  })
  window.location.href = `${config.public.cognitoDomain}/oauth2/authorize?${params.toString()}`
}
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <div 
      class="w-full max-w-sm rounded-xl p-8" 
      style="background:var(--bg-elev); border: 1px solid var(--hairline); box-shadow: 0 20px 40px rgba(0,0,0,0.2)"
    >
      <div class="mb-8 text-center">
        <div class="kra-nav-logo justify-center mb-4" style="cursor: default">
          <div class="dot"></div>
          <span>KRA <span style="color:var(--accent)">Admin</span></span>
        </div>
        <p class="t-label" style="font-size: 10px">Authentication Required</p>
      </div>

      <div
        v-if="errorMsg"
        role="alert"
        class="mb-6 rounded-lg p-4 text-sm"
        style="background: rgba(255, 77, 77, 0.1); border: 1px solid rgba(255, 77, 77, 0.2); color: #ff4d4d"
      >
        {{ errorMsg }}
      </div>

      <button
        type="button"
        class="btn btn-primary w-full justify-center py-4"
        @click="signIn"
      >
        Sign In with Cognito
      </button>
      
      <div class="mt-8 text-center">
        <NuxtLink to="/" class="t-label hover:text-[var(--accent)] transition-colors" style="font-size: 10px; cursor: pointer">
          ← Back to Portfolio
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
