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
    <div class="mb-12 flex items-center justify-between pb-6" style="border-bottom: 1px solid var(--hairline)">
      <div>
        <h1 class="t-h2">Blog Posts</h1>
        <p class="t-label" style="font-size: 10px; margin-top: 4px">Manage your articles and updates</p>
      </div>
      <button
        type="button"
        class="btn btn-primary"
        @click="openCreateModal"
      >
        <Icon name="lucide:plus" class="w-4 h-4" />
        Create Post
      </button>
    </div>

    <div v-if="store.loading" class="flex flex-col items-center justify-center py-20 gap-4">
      <div class="w-8 h-8 rounded-full border-2 border-[var(--hairline)] border-t-[var(--accent)] animate-spin"></div>
      <p class="t-label" style="font-size: 11px">Loading posts…</p>
    </div>

    <div
      v-else-if="store.error && !store.loading"
      class="mb-8 rounded-xl p-6 text-sm"
      style="background: rgba(255, 77, 77, 0.05); border: 1px solid rgba(255, 77, 77, 0.1); color: #ff4d4d"
    >
      <div class="flex items-center gap-3">
        <Icon name="lucide:alert-circle" class="w-5 h-5" />
        <span>{{ store.error }}</span>
      </div>
    </div>

    <div
      v-else-if="!store.loading && store.posts.length === 0"
      class="rounded-2xl px-6 py-20 text-center"
      style="background:var(--bg-elev); border: 1px solid var(--hairline)"
    >
      <div class="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style="background:var(--overlay)">
        <Icon name="lucide:file-text" class="w-8 h-8" style="color:var(--fg-faint)" />
      </div>
      <h3 class="t-h3" style="font-size: 24px; margin-bottom: 12px">No blog posts yet</h3>
      <p class="t-body mx-auto mb-8" style="max-width: 32ch">
        Create your first post to get started. Your articles will appear here once published.
      </p>
      <button
        type="button"
        class="btn btn-primary"
        @click="openCreateModal"
      >
        Create Post
      </button>
    </div>

    <BlogPostTable
      v-else
      :posts="store.posts"
      @edit="openEditModal"
      @delete="openDeleteModal"
    />

    <ClientOnly>
      <BlogPostForm
        :open="showFormModal"
        :post="editingPost"
        @close="closeFormModal"
        @saved="closeFormModal"
      />
    </ClientOnly>

    <ClientOnly>
      <BlogPostDeleteModal
        :open="showDeleteModal"
        :post="deletingPost"
        @close="closeDeleteModal"
        @deleted="closeDeleteModal"
      />
    </ClientOnly>
  </div>
</template>
