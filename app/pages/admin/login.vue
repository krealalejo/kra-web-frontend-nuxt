<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const config = useRuntimeConfig()
const route = useRoute()

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
    <div class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div
        v-if="errorMsg"
        role="alert"
        class="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
      >
        {{ errorMsg }}
      </div>

      <button
        type="button"
        class="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 active:opacity-80"
        @click="signIn"
      >
        Sign In with Cognito
      </button>
    </div>
  </div>
</template>
