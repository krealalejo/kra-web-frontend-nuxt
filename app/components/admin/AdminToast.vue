<script setup lang="ts">
const { toast, dismiss } = useToast()
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div
      v-if="toast"
      class="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-xl"
      :style="toast.type === 'success'
        ? 'background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; backdrop-filter: blur(8px)'
        : 'background: rgba(220, 38, 38, 0.15); border: 1px solid rgba(220, 38, 38, 0.3); color: #dc2626; backdrop-filter: blur(8px)'"
    >
      <Icon
        :name="toast.type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'"
        class="w-4 h-4 flex-shrink-0"
      />
      <span>{{ toast.message }}</span>
      <button
        type="button"
        class="ml-2 opacity-60 hover:opacity-100 transition-opacity"
        @click="dismiss"
      >
        <Icon name="lucide:x" class="w-3.5 h-3.5" />
      </button>
    </div>
  </Transition>
</template>
