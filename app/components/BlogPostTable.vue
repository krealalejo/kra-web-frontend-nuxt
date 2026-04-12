<script setup lang="ts">
import type { BlogPost } from '~/stores/blog'

defineProps<{
  posts: BlogPost[]
}>()

const emit = defineEmits<{
  edit: [post: BlogPost]
  delete: [post: BlogPost]
}>()

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="overflow-x-auto rounded border border-slate-200 bg-white">
    <table class="w-full text-sm text-slate-900">
      <thead class="border-b border-slate-200 bg-slate-50">
        <tr>
          <th scope="col" class="w-[30%] px-4 py-2 text-left font-semibold text-slate-900">Title</th>
          <th scope="col" class="w-[25%] px-4 py-2 text-left font-semibold text-slate-900">Slug</th>
          <th scope="col" class="w-[20%] px-4 py-2 text-left font-semibold text-slate-900">Last Updated</th>
          <th scope="col" class="w-[15%] px-4 py-2 text-left font-semibold text-slate-900">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="post in posts"
          :key="post.slug"
          class="border-b border-slate-200 bg-white hover:bg-slate-50"
        >
          <td class="px-4 py-2 text-sm text-slate-900">{{ post.title }}</td>
          <td class="px-4 py-2 text-sm text-slate-700">{{ post.slug }}</td>
          <td class="px-4 py-2 text-sm text-slate-700">{{ formatDate(post.updatedAt) }}</td>
          <td class="px-4 py-2">
            <div class="flex gap-2">
              <button
                type="button"
                class="rounded px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                @click="emit('edit', post)"
              >
                Edit Post
              </button>
              <button
                type="button"
                class="rounded px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                @click="emit('delete', post)"
              >
                Delete Post
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
