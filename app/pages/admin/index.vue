<script setup lang="ts">
import type { BlogPost } from '~/stores/blog'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const store = useBlogStore()

// Fetch posts on mount (SPA: no server-side fetch needed)
onMounted(() => {
  store.fetchPosts()
})

// Modal state
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const editingPost = ref<BlogPost | null>(null)
const deletingPost = ref<BlogPost | null>(null)

function openCreateModal() {
  editingPost.value = null
  showFormModal.value = true
}

function openEditModal(post: BlogPost) {
  editingPost.value = post
  showFormModal.value = true
}

function openDeleteModal(post: BlogPost) {
  deletingPost.value = post
  showDeleteModal.value = true
}

function closeFormModal() {
  showFormModal.value = false
  editingPost.value = null
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deletingPost.value = null
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-semibold text-slate-900">Blog Posts</h1>
      <button
        type="button"
        class="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        @click="openCreateModal"
      >
        Create Post
      </button>
    </div>

    <!-- Loading state -->
    <p v-if="store.loading" class="text-sm text-slate-600">Loading posts…</p>

    <!-- Error state -->
    <div
      v-else-if="store.error && !store.loading"
      class="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
    >
      {{ store.error }}
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!store.loading && store.posts.length === 0"
      class="rounded border border-slate-200 bg-white px-6 py-12 text-center"
    >
      <p class="mb-1 text-base font-semibold text-slate-900">No blog posts yet</p>
      <p class="mb-4 text-sm text-slate-700">
        Create your first post to get started. Click the 'Create Post' button to begin.
      </p>
      <button
        type="button"
        class="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        @click="openCreateModal"
      >
        Create Post
      </button>
    </div>

    <!-- Posts table -->
    <BlogPostTable
      v-else
      :posts="store.posts"
      @edit="openEditModal"
      @delete="openDeleteModal"
    />

    <!-- Create/Edit form modal -->
    <BlogPostForm
      :open="showFormModal"
      :post="editingPost"
      @close="closeFormModal"
      @saved="closeFormModal"
    />

    <!-- Delete confirmation modal -->
    <BlogPostDeleteModal
      :open="showDeleteModal"
      :post="deletingPost"
      @close="closeDeleteModal"
      @deleted="closeDeleteModal"
    />
  </div>
</template>
