import { computed } from 'vue'
import type { Ref } from 'vue'

export function useApiError(error: Ref<unknown>) {
  const isMissingApiBase = computed(() => {
    const msg = error.value && typeof error.value === 'object' && 'message' in error.value
      ? String((error.value as Error).message)
      : error.value ? String(error.value) : ''
    return msg.includes('MISSING_API_BASE')
  })

  return { isMissingApiBase }
}
