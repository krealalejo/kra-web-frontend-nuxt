<script setup lang="ts">
import type { BlogPost } from '~/stores/blog'

defineProps<{
  posts: BlogPost[]
}>()

const emit = defineEmits<{
  edit: [post: BlogPost]
  delete: [post: BlogPost]
}>()

const runtimeConfig = useRuntimeConfig()

function getThumbUrl(key: string): string {
  const thumbKey = key
    .replace(/^images\//, 'thumbnails/')
    .replace(/\.[^.]+$/, '-thumb.webp')
  return `${runtimeConfig.public.s3PublicBucketUrl}/${thumbKey}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="overflow-x-auto rounded-xl" style="background:var(--bg-elev); border: 1px solid var(--hairline)">
    <table class="w-full text-sm">
      <thead style="border-bottom: 1px solid var(--hairline); background: var(--overlay)">
        <tr>
          <th scope="col" class="w-[80px] px-6 py-4 text-left t-label" style="font-size: 10px; color: var(--fg)">Cover</th>
          <th scope="col" class="w-[30%] px-6 py-4 text-left t-label" style="font-size: 10px; color: var(--fg)">Title</th>
          <th scope="col" class="w-[20%] px-6 py-4 text-left t-label" style="font-size: 10px; color: var(--fg)">Slug</th>
          <th scope="col" class="w-[20%] px-6 py-4 text-left t-label" style="font-size: 10px; color: var(--fg)">Last Updated</th>
          <th scope="col" class="w-[25%] px-6 py-4 text-left t-label" style="font-size: 10px; color: var(--fg)">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="post in posts"
          :key="post.slug"
          class="group transition-colors hover:bg-[var(--overlay)]"
          style="border-bottom: 1px solid var(--hairline)"
        >
          <td class="px-6 py-4">
            <div 
              class="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center"
              style="background: var(--bg-sunken); border: 1px solid var(--hairline)"
            >
              <img 
                v-if="post.imageUrl" 
                :src="getThumbUrl(post.imageUrl)" 
                class="w-full h-full object-cover" 
                alt="Thumb" 
              />
              <Icon v-else name="lucide:image" class="w-4 h-4 opacity-20" />
            </div>
          </td>
          <td class="px-6 py-4">
            <span class="font-medium" style="color: var(--fg)">{{ post.title }}</span>
          </td>
          <td class="px-6 py-4">
            <span style="color: var(--fg-muted); font-family: var(--font-mono); font-size: 11px">{{ post.slug }}</span>
          </td>
          <td class="px-6 py-4">
            <span style="color: var(--fg-muted); font-family: var(--font-mono); font-size: 11px">{{ formatDate(post.updatedAt) }}</span>
          </td>
          <td class="px-6 py-4">
            <div class="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                class="btn btn-ghost"
                style="padding: 6px 12px; font-size: 11px"
                @click="emit('edit', post)"
              >
                Edit
              </button>
              <button
                type="button"
                class="btn btn-ghost"
                style="padding: 6px 12px; font-size: 11px; color: #ff4d4d; border-color: rgba(255, 77, 77, 0.1)"
                @click="emit('delete', post)"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
