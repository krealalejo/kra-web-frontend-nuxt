import { computed } from 'vue'
import type { Ref } from 'vue'

export function useApiError(error: Ref<unknown>) {
  const isMissingApiBase = computed(() => {
    let msg: string
    if (error.value && typeof error.value === 'object' && 'message' in error.value) {
      msg = (error.value as Error).message
    } else if (error.value) {
      msg = error.value instanceof Error ? error.value.message : String(error.value)
    } else {
      msg = ''
    }
    return msg.includes('MISSING_API_BASE')
  })

  return { isMissingApiBase }
}
