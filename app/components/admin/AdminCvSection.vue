<script setup lang="ts">

interface ExperienceEntry {
  id: string; title: string; company: string; location: string
  years: string; description: string; sortOrder: number
}
interface EducationEntry {
  id: string; title: string; institution: string; location: string
  years: string; description: string; sortOrder: number
}
interface SkillCategory {
  id: string; name: string; skills: string[]; sortOrder: number
}

const activeTab = ref<'experience' | 'education' | 'skills' | 'pdf'>('experience')

const experience = ref<ExperienceEntry[]>([])
const education = ref<EducationEntry[]>([])
const skillCategories = ref<SkillCategory[]>([])

const loading = ref(false)
const error = ref<string | null>(null)

const deletingId = ref<string | null>(null)
const deletingCategoryId = ref<string | null>(null)

const categorySaving = reactive<Record<string, boolean>>({})
const categoryError = reactive<Record<string, string | null>>({})

const expModal = reactive({
  open: false,
  mode: 'add' as 'add' | 'edit',
  data: { id: '', title: '', company: '', location: '', years: '', description: '' },
  saving: false,
  error: null as string | null,
})

const eduModal = reactive({
  open: false,
  mode: 'add' as 'add' | 'edit',
  data: { id: '', title: '', institution: '', location: '', years: '', description: '' },
  saving: false,
  error: null as string | null,
})

const categorySkills = reactive<Record<string, string[]>>({})
const categoryNewSkill = reactive<Record<string, string>>({})

const addCategoryOpen = ref(false)
const newCategoryName = ref('')
const addCategorySaving = ref(false)
const addCategoryError = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const [exp, edu, skills] = await Promise.all([
      $fetch<ExperienceEntry[]>('/api/admin/cv/experience'),
      $fetch<EducationEntry[]>('/api/admin/cv/education'),
      $fetch<SkillCategory[]>('/api/admin/cv/skills/categories'),
    ])
    experience.value = exp
    education.value = edu
    skillCategories.value = skills
    for (const cat of skills) {
      categorySkills[cat.id] = [...cat.skills]
      categoryNewSkill[cat.id] = ''
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load CV data'
  } finally {
    loading.value = false
  }
})


function openAddExpModal() {
  expModal.mode = 'add'
  expModal.data = { id: '', title: '', company: '', location: '', years: '', description: '' }
  expModal.open = true
  expModal.error = null
}

function openEditExpModal(item: ExperienceEntry) {
  expModal.mode = 'edit'
  expModal.data = { ...item }
  expModal.open = true
  expModal.error = null
}

async function saveExpModal() {
  expModal.saving = true
  expModal.error = null
  try {
    if (expModal.mode === 'add') {
      const nextSortOrder = Math.max(0, ...experience.value.map(i => i.sortOrder)) + 1
      const created = await $fetch<ExperienceEntry>('/api/admin/cv/experience', {
        method: 'POST',
        body: { ...expModal.data, sortOrder: nextSortOrder },
      })
      experience.value.push(created)
    } else {
      const updated = await $fetch<ExperienceEntry>(`/api/admin/cv/experience/${expModal.data.id}`, {
        method: 'PUT',
        body: {
          title: expModal.data.title,
          company: expModal.data.company,
          location: expModal.data.location,
          years: expModal.data.years,
          description: expModal.data.description,
        },
      })
      const idx = experience.value.findIndex(e => e.id === expModal.data.id)
      /* v8 ignore next 1 */
      if (idx !== -1) experience.value[idx] = updated
    }
    expModal.open = false
  } catch (e: unknown) {
    expModal.error = e instanceof Error ? e.message : 'Save failed'
  } finally {
    expModal.saving = false
  }
}

async function deleteExp(id: string) {
  /* v8 ignore next 1 */
  if (import.meta.client && !globalThis.confirm('Delete this experience entry?')) return
  deletingId.value = id
  try {
    await $fetch(`/api/admin/cv/experience/${id}`, { method: 'DELETE' })
    const idx = experience.value.findIndex(e => e.id === id)
    /* v8 ignore next 1 */
    if (idx !== -1) experience.value.splice(idx, 1)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Delete failed'
  } finally {
    deletingId.value = null
  }
}


function openAddEduModal() {
  eduModal.mode = 'add'
  eduModal.data = { id: '', title: '', institution: '', location: '', years: '', description: '' }
  eduModal.open = true
  eduModal.error = null
}

function openEditEduModal(item: EducationEntry) {
  eduModal.mode = 'edit'
  eduModal.data = { ...item }
  eduModal.open = true
  eduModal.error = null
}

async function saveEduModal() {
  eduModal.saving = true
  eduModal.error = null
  try {
    if (eduModal.mode === 'add') {
      const nextSortOrder = Math.max(0, ...education.value.map(i => i.sortOrder)) + 1
      const created = await $fetch<EducationEntry>('/api/admin/cv/education', {
        method: 'POST',
        body: { ...eduModal.data, sortOrder: nextSortOrder },
      })
      education.value.push(created)
    } else {
      const updated = await $fetch<EducationEntry>(`/api/admin/cv/education/${eduModal.data.id}`, {
        method: 'PUT',
        body: {
          title: eduModal.data.title,
          institution: eduModal.data.institution,
          location: eduModal.data.location,
          years: eduModal.data.years,
          description: eduModal.data.description,
        },
      })
      const idx = education.value.findIndex(e => e.id === eduModal.data.id)
      /* v8 ignore next 1 */
      if (idx !== -1) education.value[idx] = updated
    }
    eduModal.open = false
  } catch (e: unknown) {
    eduModal.error = e instanceof Error ? e.message : 'Save failed'
  } finally {
    eduModal.saving = false
  }
}

async function deleteEdu(id: string) {
  /* v8 ignore next 1 */
  if (import.meta.client && !globalThis.confirm('Delete this education entry?')) return
  deletingId.value = id
  try {
    await $fetch(`/api/admin/cv/education/${id}`, { method: 'DELETE' })
    const idx = education.value.findIndex(e => e.id === id)
    /* v8 ignore next 1 */
    if (idx !== -1) education.value.splice(idx, 1)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Delete failed'
  } finally {
    deletingId.value = null
  }
}


function addSkill(catId: string) {
  const trimmed = (categoryNewSkill[catId] ?? '').trim()
  if (!trimmed) return
  if (!categorySkills[catId]) categorySkills[catId] = []
  if (!categorySkills[catId].includes(trimmed)) {
    categorySkills[catId].push(trimmed)
    categoryNewSkill[catId] = ''
  }
}

function removeSkill(catId: string, index: number) {
  categorySkills[catId].splice(index, 1)
}

async function saveCategory(catId: string) {
  categorySaving[catId] = true
  categoryError[catId] = null
  try {
    await $fetch(`/api/admin/cv/skills/categories/${catId}`, {
      method: 'PUT',
      body: { skills: categorySkills[catId] },
    })
    const idx = skillCategories.value.findIndex(c => c.id === catId)
    /* v8 ignore next 1 */
    if (idx !== -1) skillCategories.value[idx].skills = [...categorySkills[catId]]
  } catch (e: unknown) {
    categoryError[catId] = e instanceof Error ? e.message : 'Save failed'
  } finally {
    categorySaving[catId] = false
  }
}

async function deleteCategory(id: string) {
  /* v8 ignore next 1 */
  if (import.meta.client && !globalThis.confirm('Delete this skill category?')) return
  deletingCategoryId.value = id
  try {
    await $fetch(`/api/admin/cv/skills/categories/${id}`, { method: 'DELETE' })
    const idx = skillCategories.value.findIndex(c => c.id === id)
    /* v8 ignore next 5 */
    if (idx !== -1) {
      skillCategories.value.splice(idx, 1)
      delete categorySkills[id]
      delete categoryNewSkill[id]
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Delete failed'
  } finally {
    deletingCategoryId.value = null
  }
}


const runtimeConfig = useRuntimeConfig()
const cvPdfKey = ref<string | null>(null)
const homePortraitKey = ref<string | null>(null)
const cvPortraitKey = ref<string | null>(null)
const cvPdfUploading = ref(false)
const cvPdfError = ref<string | null>(null)
const cvPdfSuccess = ref(false)

const cvPdfUrl = computed(() => {
  if (!cvPdfKey.value) return null
  return `${(runtimeConfig.public.s3PublicBucketUrl as string).replace(/\/$/, '')}/${cvPdfKey.value}`
})

onMounted(async () => {
  try {
    const profile = await $fetch<{ homePortraitUrl: string | null; cvPortraitUrl: string | null; cvPdfUrl: string | null }>(
      `${runtimeConfig.public.apiBase}/config/profile`
    )
    cvPdfKey.value = profile.cvPdfUrl ?? null
    homePortraitKey.value = profile.homePortraitUrl ?? null
    cvPortraitKey.value = profile.cvPortraitUrl ?? null
  } catch {
  }
})

async function handlePdfUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.type !== 'application/pdf') {
    cvPdfError.value = 'Only PDF files are allowed'
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    cvPdfError.value = 'PDF must be smaller than 10 MB'
    return
  }
  cvPdfUploading.value = true
  cvPdfError.value = null
  cvPdfSuccess.value = false
  try {
    const { uploadUrl, s3Key } = await $fetch<{ uploadUrl: string; s3Key: string }>('/api/admin/upload', {
      method: 'POST',
      body: { filename: file.name, contentType: 'application/pdf' },
    })
    await $fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      body: file,
    })
    await $fetch('/api/admin/profile', {
      method: 'PUT',
      body: {
        cvPdfUrl: s3Key,
        homePortraitUrl: homePortraitKey.value,
        cvPortraitUrl: cvPortraitKey.value
      },
    })
    cvPdfKey.value = s3Key
    cvPdfSuccess.value = true
  } catch (e: unknown) {
    cvPdfError.value = e instanceof Error ? e.message : 'Upload failed'
  } finally {
    cvPdfUploading.value = false
  }
}

async function removePdf() {
  cvPdfError.value = null
  cvPdfSuccess.value = false
  try {
    await $fetch('/api/admin/profile', {
      method: 'PUT',
      body: {
        cvPdfUrl: null,
        homePortraitUrl: homePortraitKey.value,
        cvPortraitUrl: cvPortraitKey.value
      },
    })
    cvPdfKey.value = null
  } catch (e: unknown) {
    cvPdfError.value = e instanceof Error ? e.message : 'Removal failed'
  }
}

async function submitAddCategory() {
  const name = newCategoryName.value.trim()
  if (!name) return
  addCategorySaving.value = true
  addCategoryError.value = null
  try {
    const nextSortOrder = Math.max(0, ...skillCategories.value.map(c => c.sortOrder)) + 1
    const created = await $fetch<SkillCategory>('/api/admin/cv/skills/categories', {
      method: 'POST',
      body: { name, skills: [], sortOrder: nextSortOrder },
    })
    skillCategories.value.push(created)
    categorySkills[created.id] = []
    categoryNewSkill[created.id] = ''
    newCategoryName.value = ''
    addCategoryOpen.value = false
  } catch (e: unknown) {
    addCategoryError.value = e instanceof Error ? e.message : 'Create failed'
  } finally {
    addCategorySaving.value = false
  }
}
</script>

<template>
  <div class="mb-12">
    <div class="mb-8 flex items-center justify-between pb-6" style="border-bottom: 1px solid var(--hairline)">
      <div>
        <h2 class="t-h2">CV Manager</h2>
        <p class="t-label mt-1" style="color: var(--fg-dim)">Manage Experience, Education, and Skills sections</p>
      </div>
    </div>

    <div v-if="loading" class="mb-6 text-sm" style="color: var(--fg-dim)">Loading CV data…</div>

    <div v-if="error" class="mb-6 rounded px-3 py-2 text-xs" style="background: rgba(220, 38, 38, 0.1); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.25)">
      {{ error }}
    </div>

    <div style="display:flex;gap:8px;margin-bottom:24px;border-bottom:1px solid var(--hairline);padding-bottom:16px">
      <button
        v-for="tab in (['experience','education','skills','pdf'] as const)"
        :key="tab"
        @click="activeTab = tab"
        class="rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all"
        :style="activeTab === tab
          ? 'background:var(--overlay);color:var(--fg);border:1px solid var(--hairline)'
          : 'color:var(--fg-dim);border:1px solid transparent'"
      >{{ tab === 'skills' ? 'Skills' : tab === 'pdf' ? 'CV PDF' : tab.charAt(0).toUpperCase() + tab.slice(1) }}</button>
    </div>

    <div v-show="activeTab === 'experience'">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="t-h3" style="color: var(--fg)">Experience</h3>
        <button
          class="rounded-lg px-4 py-2 text-sm font-medium"
          style="background: var(--accent); color: var(--bg)"
          @click="openAddExpModal"
        >+ Add Experience</button>
      </div>

      <div v-if="experience.length === 0 && !loading" class="text-sm" style="color: var(--fg-dim)">
        No experience entries yet. Click Add to create one.
      </div>
      <div
        v-for="item in experience"
        :key="item.id"
        class="mb-3 flex items-center justify-between rounded-xl px-4 py-3"
        style="background: var(--bg-elev); border: 1px solid var(--hairline)"
      >
        <div>
          <div class="text-sm font-medium" style="color: var(--fg)">{{ item.title }} · {{ item.company }}</div>
          <div class="text-xs mt-1" style="color: var(--fg-dim)">{{ item.location }} · {{ item.years }}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button
            class="text-sm px-2 py-1 rounded"
            style="color: var(--fg-dim); border: 1px solid var(--hairline); background: none; cursor: pointer"
            @click="openEditExpModal(item)"
            title="Edit"
          >✎</button>
          <button
            class="text-sm px-2 py-1 rounded"
            style="color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); background: none; cursor: pointer"
            :disabled="deletingId === item.id"
            @click="deleteExp(item.id)"
            title="Delete"
          >✕</button>
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'education'">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="t-h3" style="color: var(--fg)">Education</h3>
        <button
          class="rounded-lg px-4 py-2 text-sm font-medium"
          style="background: var(--accent); color: var(--bg)"
          @click="openAddEduModal"
        >+ Add Education</button>
      </div>

      <div v-if="education.length === 0 && !loading" class="text-sm" style="color: var(--fg-dim)">
        No education entries yet. Click Add to create one.
      </div>
      <div
        v-for="item in education"
        :key="item.id"
        class="mb-3 flex items-center justify-between rounded-xl px-4 py-3"
        style="background: var(--bg-elev); border: 1px solid var(--hairline)"
      >
        <div>
          <div class="text-sm font-medium" style="color: var(--fg)">{{ item.title }} · {{ item.institution }}</div>
          <div class="text-xs mt-1" style="color: var(--fg-dim)">{{ item.location }} · {{ item.years }}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button
            class="text-sm px-2 py-1 rounded"
            style="color: var(--fg-dim); border: 1px solid var(--hairline); background: none; cursor: pointer"
            @click="openEditEduModal(item)"
            title="Edit"
          >✎</button>
          <button
            class="text-sm px-2 py-1 rounded"
            style="color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); background: none; cursor: pointer"
            :disabled="deletingId === item.id"
            @click="deleteEdu(item.id)"
            title="Delete"
          >✕</button>
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'skills'">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="t-h3" style="color: var(--fg)">Skills</h3>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; margin-bottom: 32px;">
        <div
          v-for="cat in skillCategories"
          :key="cat.id"
          class="rounded-2xl p-6"
          style="background: var(--bg-elev); border: 1px solid var(--hairline); display: flex; flex-direction: column;"
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="t-overline" style="color: var(--fg-dim)">{{ cat.name }}</div>
            <button
              style="background: none; border: none; cursor: pointer; color: #dc2626; font-size: 14px; padding: 0;"
              :disabled="deletingCategoryId === cat.id"
              @click="deleteCategory(cat.id)"
              title="Delete category"
            >✕</button>
          </div>

          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; min-height: 32px;">
            <span
              v-for="(skill, i) in categorySkills[cat.id]"
              :key="skill"
              class="chip"
              style="display: inline-flex; align-items: center; gap: 4px;"
            >
              {{ skill }}
              <button
                style="background: none; border: none; cursor: pointer; color: inherit; padding: 0; line-height: 1;"
                @click="removeSkill(cat.id, i)"
              >✕</button>
            </span>
          </div>

          <div class="mb-4">
            <input
              v-model="categoryNewSkill[cat.id]"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background: var(--bg); border: 1px solid var(--hairline); color: var(--fg); outline: none"
              placeholder="Add skill… (Enter to add)"
              @keydown.enter.prevent="addSkill(cat.id)"
            />
          </div>

          <div v-if="categoryError[cat.id]" class="mb-4 rounded px-3 py-2 text-xs" style="background: rgba(220, 38, 38, 0.1); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.25)">
            {{ categoryError[cat.id] }}
          </div>

          <button
            :disabled="categorySaving[cat.id]"
            class="rounded-lg px-4 py-2 text-sm font-medium transition-opacity"
            style="background: var(--accent); color: var(--bg); margin-top: auto"
            :style="categorySaving[cat.id] ? 'opacity: 0.5' : ''"
            @click="saveCategory(cat.id)"
          >
            {{ categorySaving[cat.id] ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>

      <div v-if="!addCategoryOpen">
        <button
          class="rounded-lg px-4 py-2 text-sm font-medium"
          style="border: 1px solid var(--hairline); color: var(--fg-dim); background: none; cursor: pointer"
          @click="addCategoryOpen = true"
        >+ Add Category</button>
      </div>
      <div v-else class="rounded-xl p-4" style="background: var(--bg-elev); border: 1px solid var(--hairline); max-width: 400px;">
        <div class="mb-3">
          <label for="new-category-name" class="t-label mb-1 block text-xs" style="color: var(--fg-dim)">Category Name</label>
          <input
            id="new-category-name"
            v-model="newCategoryName"
            class="w-full rounded-lg px-3 py-2 text-sm"
            style="background: var(--bg); border: 1px solid var(--hairline); color: var(--fg); outline: none"
            placeholder="e.g. Backend"
            @keydown.enter.prevent="submitAddCategory"
          />
        </div>
        <div v-if="addCategoryError" class="mb-3 rounded px-3 py-2 text-xs" style="background: rgba(220, 38, 38, 0.1); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.25)">
          {{ addCategoryError }}
        </div>
        <div style="display:flex;gap:8px">
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium"
            style="color: var(--fg-dim); border: 1px solid var(--hairline); background: none; cursor: pointer"
            @click="addCategoryOpen = false; newCategoryName = ''; addCategoryError = null"
          >Cancel</button>
          <button
            :disabled="addCategorySaving"
            class="rounded-lg px-4 py-2 text-sm font-medium transition-opacity"
            style="background: var(--accent); color: var(--bg)"
            :style="addCategorySaving ? 'opacity: 0.5' : ''"
            @click="submitAddCategory"
          >{{ addCategorySaving ? 'Creating…' : 'Create' }}</button>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'pdf'">
      <div class="mb-4">
        <h3 class="t-h3" style="color: var(--fg)">CV PDF</h3>
        <p class="text-xs mt-1" style="color: var(--fg-dim)">Upload a PDF version of your CV. Visitors can download it from the CV page.</p>
      </div>

      <div class="rounded-2xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline); max-width: 480px;">
        <div class="mb-4">
          <div class="t-overline mb-2" style="color: var(--fg-dim)">Current file</div>
          <div v-if="cvPdfKey" class="flex items-center justify-between rounded-lg px-3 py-2" style="background: var(--bg); border: 1px solid var(--hairline)">
            <div style="display:flex;align-items:center;gap:8px;">
              <Icon name="lucide:file-text" class="w-4 h-4" style="color: var(--accent)" />
              <span class="text-xs" style="color: var(--fg); font-family: var(--font-mono)">{{ cvPdfKey.split('/').pop() }}</span>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <a :href="cvPdfUrl!" target="_blank" rel="noopener" class="text-xs px-2 py-1 rounded" style="color: var(--accent); border: 1px solid var(--hairline); background: none; text-decoration: none">Preview ↗</a>
              <button class="text-xs px-2 py-1 rounded" style="color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); background: none; cursor: pointer" @click="removePdf">Remove</button>
            </div>
          </div>
          <div v-else class="text-xs" style="color: var(--fg-faint)">No PDF uploaded yet.</div>
        </div>

        <label class="btn btn-primary" style="cursor: pointer; display: inline-block;">
          <span v-if="cvPdfUploading">Uploading…</span>
          <span v-else>{{ cvPdfKey ? 'Replace PDF' : 'Upload PDF' }}</span>
          <input type="file" accept="application/pdf" class="sr-only" :disabled="cvPdfUploading" @change="handlePdfUpload" />
        </label>

        <p v-if="cvPdfSuccess" class="mt-3 text-xs" style="color: #4caf50">PDF uploaded successfully.</p>
        <p v-if="cvPdfError" class="mt-3 text-xs" style="color: #dc2626">{{ cvPdfError }}</p>
      </div>
    </div>

    <div
      v-if="expModal.open"
      style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6)"
      @click.self="expModal.open = false"
    >
      <div class="rounded-2xl p-6" style="background:var(--bg-elev);border:1px solid var(--hairline);width:100%;max-width:520px;max-height:90vh;overflow-y:auto">
        <h3 class="t-h3 mb-6" style="color:var(--fg)">{{ expModal.mode === 'add' ? 'Add Experience' : 'Edit Experience' }}</h3>

        <div class="space-y-4">
          <div>
            <label for="exp-title" class="t-label mb-1 block text-xs" style="color:var(--fg-dim)">title</label>
            <input
              id="exp-title"
              v-model="expModal.data.title"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background:var(--bg);border:1px solid var(--hairline);color:var(--fg);outline:none"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>
          <div>
            <label for="exp-company" class="t-label mb-1 block text-xs" style="color:var(--fg-dim)">company</label>
            <input
              id="exp-company"
              v-model="expModal.data.company"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background:var(--bg);border:1px solid var(--hairline);color:var(--fg);outline:none"
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div>
            <label for="exp-location" class="t-label mb-1 block text-xs" style="color:var(--fg-dim)">Location</label>
            <input
              id="exp-location"
              v-model="expModal.data.location"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background:var(--bg);border:1px solid var(--hairline);color:var(--fg);outline:none"
              placeholder="e.g. Barcelona, ES"
            />
          </div>
          <div>
            <label for="exp-years" class="t-label mb-1 block text-xs" style="color:var(--fg-dim)">Years</label>
            <input
              id="exp-years"
              v-model="expModal.data.years"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background:var(--bg);border:1px solid var(--hairline);color:var(--fg);outline:none"
              placeholder="e.g. 2022 — Present"
            />
          </div>
          <div>
            <label for="exp-description" class="t-label mb-1 block text-xs" style="color:var(--fg-dim)">Description</label>
            <textarea
              id="exp-description"
              v-model="expModal.data.description"
              rows="4"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background:var(--bg);border:1px solid var(--hairline);color:var(--fg);outline:none;resize:vertical"
              placeholder="Brief description of responsibilities…"
            />
          </div>
        </div>

        <div v-if="expModal.error" class="mt-4 rounded px-3 py-2 text-xs" style="background:rgba(220,38,38,0.1);color:#dc2626;border:1px solid rgba(220,38,38,0.25)">
          {{ expModal.error }}
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium"
            style="color:var(--fg-dim);border:1px solid var(--hairline);background:none;cursor:pointer"
            @click="expModal.open = false"
          >Cancel</button>
          <button
            :disabled="expModal.saving"
            class="rounded-lg px-4 py-2 text-sm font-medium transition-opacity"
            style="background:var(--accent);color:var(--bg)"
            :style="expModal.saving ? 'opacity:0.5' : ''"
            @click="saveExpModal"
          >{{ expModal.saving ? 'Saving…' : 'Save' }}</button>
        </div>
      </div>
    </div>

    <div
      v-if="eduModal.open"
      style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6)"
      @click.self="eduModal.open = false"
    >
      <div class="rounded-2xl p-6" style="background:var(--bg-elev);border:1px solid var(--hairline);width:100%;max-width:520px;max-height:90vh;overflow-y:auto">
        <h3 class="t-h3 mb-6" style="color:var(--fg)">{{ eduModal.mode === 'add' ? 'Add Education' : 'Edit Education' }}</h3>

        <div class="space-y-4">
          <div>
            <label for="edu-title" class="t-label mb-1 block text-xs" style="color:var(--fg-dim)">Title</label>
            <input
              id="edu-title"
              v-model="eduModal.data.title"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background:var(--bg);border:1px solid var(--hairline);color:var(--fg);outline:none"
              placeholder="e.g. Bachelor's in Computer Science"
            />
          </div>
          <div>
            <label for="edu-institution" class="t-label mb-1 block text-xs" style="color:var(--fg-dim)">Institution</label>
            <input
              id="edu-institution"
              v-model="eduModal.data.institution"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background:var(--bg);border:1px solid var(--hairline);color:var(--fg);outline:none"
              placeholder="e.g. Universitat Politècnica de Catalunya"
            />
          </div>
          <div>
            <label for="edu-location" class="t-label mb-1 block text-xs" style="color:var(--fg-dim)">Location</label>
            <input
              id="edu-location"
              v-model="eduModal.data.location"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background:var(--bg);border:1px solid var(--hairline);color:var(--fg);outline:none"
              placeholder="e.g. Barcelona, ES"
            />
          </div>
          <div>
            <label for="edu-years" class="t-label mb-1 block text-xs" style="color:var(--fg-dim)">Years</label>
            <input
              id="edu-years"
              v-model="eduModal.data.years"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background:var(--bg);border:1px solid var(--hairline);color:var(--fg);outline:none"
              placeholder="e.g. 2018 — 2022"
            />
          </div>
          <div>
            <label for="edu-description" class="t-label mb-1 block text-xs" style="color:var(--fg-dim)">Description</label>
            <textarea
              id="edu-description"
              v-model="eduModal.data.description"
              rows="4"
              class="w-full rounded-lg px-3 py-2 text-sm"
              style="background:var(--bg);border:1px solid var(--hairline);color:var(--fg);outline:none;resize:vertical"
              placeholder="Specialisation or relevant details…"
            />
          </div>
        </div>

        <div v-if="eduModal.error" class="mt-4 rounded px-3 py-2 text-xs" style="background:rgba(220,38,38,0.1);color:#dc2626;border:1px solid rgba(220,38,38,0.25)">
          {{ eduModal.error }}
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium"
            style="color:var(--fg-dim);border:1px solid var(--hairline);background:none;cursor:pointer"
            @click="eduModal.open = false"
          >Cancel</button>
          <button
            :disabled="eduModal.saving"
            class="rounded-lg px-4 py-2 text-sm font-medium transition-opacity"
            style="background:var(--accent);color:var(--bg)"
            :style="eduModal.saving ? 'opacity:0.5' : ''"
            @click="saveEduModal"
          >{{ eduModal.saving ? 'Saving…' : 'Save' }}</button>
        </div>
      </div>
    </div>

  </div>
</template>
