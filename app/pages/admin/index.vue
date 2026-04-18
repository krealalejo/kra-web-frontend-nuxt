<script setup lang="ts">
import type { BlogPost } from '~/stores/blog'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const store = useBlogStore()

onMounted(() => {
  store.fetchPosts()
})

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
      <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Blog Posts</h1>
      <button
        type="button"
        class="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        @click="openCreateModal"
      >
        Create Post
      </button>
    </div>

    <!-- Code quality badges (D-07) -->
    <div class="mb-4 flex items-center gap-3">
      <span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Code Quality</span>
      <a href="https://sonarcloud.io/summary/new_code?id=krealalejo_kra-api" target="_blank" rel="noopener">
        <img
          src="https://sonarcloud.io/api/project_badges/measure?project=krealalejo_kra-api&metric=alert_status"
          alt="kra-api quality gate"
          class="h-5"
        />
      </a>
      <a href="https://sonarcloud.io/summary/new_code?id=krealalejo_kra-web-frontend-nuxt" target="_blank" rel="noopener">
        <img
          src="https://sonarcloud.io/api/project_badges/measure?project=krealalejo_kra-web-frontend-nuxt&metric=alert_status"
          alt="kra-web-frontend-nuxt quality gate"
          class="h-5"
        />
      </a>
      <a href="https://sonarcloud.io/summary/new_code?id=krealalejo_kra-lambdas" target="_blank" rel="noopener">
        <img
          src="https://sonarcloud.io/api/project_badges/measure?project=krealalejo_kra-lambdas&metric=alert_status"
          alt="kra-lambdas quality gate"
          class="h-5"
        />
      </a>
    </div>

    <!-- Loading state -->
    <p v-if="store.loading" class="text-sm text-slate-600 dark:text-slate-400">Loading posts…</p>

    <!-- Error state -->
    <div
      v-else-if="store.error && !store.loading"
      class="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
    >
      {{ store.error }}
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!store.loading && store.posts.length === 0"
      class="rounded border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900"
    >
      <p class="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">No blog posts yet</p>
      <p class="mb-4 text-sm text-slate-700 dark:text-slate-300">
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
