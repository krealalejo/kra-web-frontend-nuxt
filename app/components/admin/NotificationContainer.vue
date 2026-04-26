<script setup lang="ts">
import { TransitionRoot, TransitionChild } from '@headlessui/vue'
import { useNotificationStore } from '~/stores/notifications'

const store = useNotificationStore()
</script>

<template>
  <div
    aria-live="assertive"
    class="pointer-events-none fixed inset-0 z-[100] flex items-end px-4 py-6 sm:items-start sm:p-6"
  >
    <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
      <div v-for="notification in store.notifications" :key="notification.id" class="w-full max-w-sm">
        <TransitionRoot
          appear
          :show="true"
          as="template"
          enter="transform ease-out duration-300 transition"
          enter-from="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enter-to="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-slate-800 dark:ring-slate-700">
            <div class="p-4">
              <div class="flex items-start">
                <div class="shrink-0">
                  <!-- Success Icon -->
                  <svg v-if="notification.type === 'success'" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <!-- Error Icon -->
                  <svg v-else-if="notification.type === 'error'" class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <!-- Info Icon -->
                  <svg v-else class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div class="ml-3 w-0 flex-1 pt-0.5">
                  <p v-if="notification.title" class="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {{ notification.title }}
                  </p>
                  <p :class="[notification.title ? 'mt-1' : '', 'text-sm text-slate-500 dark:text-slate-400']">
                    {{ notification.message }}
                  </p>
                </div>
                <div class="ml-4 flex shrink-0">
                  <button
                    type="button"
                    class="inline-flex rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-slate-800 dark:text-slate-500 dark:hover:text-slate-400"
                    @click="store.remove(notification.id)"
                  >
                    <span class="sr-only">Close</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TransitionRoot>
      </div>
    </div>
  </div>
</template>
