import { ref, readonly } from 'vue'

interface Toast {
  message: string
  type: 'success' | 'error'
}

const toast = ref<Toast | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function show(message: string, type: 'success' | 'error' = 'success') {
    if (timer) clearTimeout(timer)
    toast.value = { message, type }
    timer = setTimeout(() => { toast.value = null }, 3500)
  }

  function dismiss() {
    if (timer) clearTimeout(timer)
    toast.value = null
  }

  return { toast: readonly(toast), show, dismiss }
}
