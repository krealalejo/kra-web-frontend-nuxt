<script setup lang="ts">
import type { PortfolioRepoDto } from '~/types/portfolio'

interface ProjectMetadataResponse {
  role: string | null
  year: string | null
  kind: string | null
  mainBranch: string | null
  stack: string[] | null
}

const repos = ref<PortfolioRepoDto[]>([])
const loading = ref(false)
const pageError = ref<string | null>(null)

const metadataMap = ref<Record<string, ProjectMetadataResponse | null>>({})

const modal = reactive({
  open: false,
  mode: 'add' as 'add' | 'edit',
  owner: '',
  repo: '',
  data: { role: '', year: '', kind: '', mainBranch: '', stack: [] as string[] },
  saving: false,
  error: null as string | null,
})

const newStackItem = ref('')

function addStackItem() {
  const val = newStackItem.value.trim().toLowerCase()
  if (val && !modal.data.stack.includes(val)) {
    modal.data.stack.push(val)
  }
  newStackItem.value = ''
}

onMounted(async () => {
  loading.value = true
  pageError.value = null
  try {
    const config = useRuntimeConfig()
    const apiBase = typeof config.public.apiBase === 'string' ? config.public.apiBase.replace(/\/$/, '') : ''
    repos.value = await $fetch<PortfolioRepoDto[]>(`${apiBase}/portfolio/repos`)
    await Promise.all(
      repos.value.map(async (r) => {
        try {
          const meta = await $fetch<ProjectMetadataResponse>(`${apiBase}/projects/metadata/${encodeURIComponent(r.owner)}/${encodeURIComponent(r.name)}`)
          metadataMap.value[`${r.owner}/${r.name}`] = meta
        } catch {
          metadataMap.value[`${r.owner}/${r.name}`] = null
        }
      })
    )
  } catch {
    pageError.value = 'Could not load repositories. Please refresh.'
  } finally {
    loading.value = false
  }
})

function openAddModal(repo: PortfolioRepoDto) {
  modal.owner = repo.owner
  modal.repo = repo.name
  modal.mode = 'add'
  modal.data = { role: '', year: '', kind: '', mainBranch: '', stack: [] }
  modal.error = null
  modal.saving = false
  newStackItem.value = ''
  modal.open = true
}

function openEditModal(repo: PortfolioRepoDto) {
  const existing = metadataMap.value[`${repo.owner}/${repo.name}`]
  modal.owner = repo.owner
  modal.repo = repo.name
  modal.mode = 'edit'
  modal.data = {
    role: existing?.role ?? '',
    year: existing?.year ?? '',
    kind: existing?.kind ?? '',
    mainBranch: existing?.mainBranch ?? '',
    stack: existing?.stack ? [...existing.stack] : [],
  }
  modal.error = null
  modal.saving = false
  newStackItem.value = ''
  modal.open = true
}

async function saveModal() {
  modal.saving = true
  modal.error = null
  try {
    const result = await $fetch<ProjectMetadataResponse>(
      `/api/admin/projects/${encodeURIComponent(modal.owner)}/${encodeURIComponent(modal.repo)}`,
      {
        method: 'PUT',
        body: {
          role: modal.data.role || null,
          year: modal.data.year || null,
          kind: modal.data.kind || null,
          mainBranch: modal.data.mainBranch || null,
          stack: modal.data.stack,
        },
      }
    )
    metadataMap.value[`${modal.owner}/${modal.repo}`] = result
    modal.open = false
  } catch {
    modal.error = 'Failed to save. Please try again.'
  } finally {
    modal.saving = false
  }
}

const KIND_OPTIONS = ['Backend', 'Frontend', 'Fullstack', 'Infrastructure', 'Library', 'CLI', 'Serverless']
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between pb-6" style="border-bottom: 1px solid var(--hairline)">
      <div>
        <h2 class="t-h2">Projects</h2>
        <p class="t-label mt-1" style="color: var(--fg-dim)">Attach metadata to GitHub repositories</p>
      </div>
    </div>

    <div v-if="loading" class="mb-6 text-sm" style="color: var(--fg-dim); font-family: var(--font-mono); font-size: 11px">
      Loading repositories…
    </div>

    <div v-if="pageError" class="mb-6 rounded px-3 py-2 text-xs" style="background:rgba(220,38,38,0.1);color:#f87171;border:1px solid rgba(220,38,38,0.25);font-weight:500">
      {{ pageError }}
    </div>

    <div v-if="!loading && !pageError && repos.length === 0" class="text-sm" style="color: var(--fg-dim)">
      No repositories found.
    </div>

    <div
      v-for="repo in repos"
      :key="`${repo.owner}/${repo.name}`"
      style="display:grid;grid-template-columns:1fr auto;align-items:center;padding:16px 0;border-bottom:1px solid var(--hairline)"
    >
      <div>
        <div class="text-sm font-medium" style="color: var(--fg)">{{ repo.fullName }}</div>
        <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.06em;color:var(--fg-muted);margin-top:4px;">
          {{ repo.description || '—' }}
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <span
          v-if="metadataMap[`${repo.owner}/${repo.name}`]?.role || metadataMap[`${repo.owner}/${repo.name}`]?.year"
          style="font-family:var(--font-mono);font-size:11px;color:var(--accent)"
        >Metadata</span>
        <button
          v-if="metadataMap[`${repo.owner}/${repo.name}`]?.role || metadataMap[`${repo.owner}/${repo.name}`]?.year"
          class="btn btn-ghost"
          style="padding:8px;font-size:14px"
          :aria-label="`Edit metadata for ${repo.fullName}`"
          @click="openEditModal(repo)"
        >
          <Icon name="heroicons:pencil-square-20-solid" style="width:20px;height:20px;color:var(--fg-muted)" />
        </button>
        <button
          v-else
          class="btn btn-ghost"
          style="padding:8px 16px;font-size:14px"
          @click="openAddModal(repo)"
        >
          Add metadata
        </button>
      </div>
    </div>

    <div
      v-if="modal.open"
      style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6)"
      @click.self="modal.open = false"
    >
      <div
        class="rounded-2xl"
        style="background:var(--bg-elev);border:1px solid var(--hairline);width:100%;max-width:480px;max-height:90vh;overflow-y:auto;padding:32px"
      >
        <h3 style="font-family:var(--font-display);font-size:20px;font-weight:500;letter-spacing:-0.01em;color:var(--fg);margin-bottom:24px">
          {{ modal.mode === 'add' ? 'Add project metadata' : 'Edit project metadata' }}
        </h3>

        <div style="margin-bottom:16px">
          <label for="modal-role" style="display:block;font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--fg-muted);margin-bottom:8px">ROLE</label>
          <input
            id="modal-role"
            v-model="modal.data.role"
            type="text"
            style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--hairline-strong);padding:10px 0;font-size:16px;color:var(--fg);outline:none"
          />
        </div>

        <div style="margin-bottom:16px">
          <label for="modal-year" style="display:block;font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--fg-muted);margin-bottom:8px">YEAR</label>
          <input
            id="modal-year"
            v-model="modal.data.year"
            type="text"
            style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--hairline-strong);padding:10px 0;font-size:16px;color:var(--fg);outline:none"
          />
        </div>

        <div style="margin-bottom:16px">
          <label for="modal-kind" style="display:block;font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--fg-muted);margin-bottom:8px">KIND</label>
          <select
            id="modal-kind"
            v-model="modal.data.kind"
            style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--hairline-strong);padding:10px 0;font-size:16px;color:var(--fg);outline:none;appearance:none"
          >
            <option value="">— select —</option>
            <option v-for="k in KIND_OPTIONS" :key="k" :value="k">{{ k }}</option>
          </select>
        </div>

        <div style="margin-bottom:16px">
          <label for="modal-branch" style="display:block;font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--fg-muted);margin-bottom:8px">MAIN BRANCH</label>
          <input
            id="modal-branch"
            v-model="modal.data.mainBranch"
            type="text"
            style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--hairline-strong);padding:10px 0;font-size:16px;color:var(--fg);outline:none"
          />
        </div>

        <div style="margin-bottom:16px">
          <label for="modal-stack" style="display:block;font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--fg-muted);margin-bottom:8px">STACK</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;min-height:32px">
            <span
              v-for="(item, i) in modal.data.stack"
              :key="item"
              class="chip"
              style="display:inline-flex;align-items:center;gap:4px"
            >
              {{ item }}
              <button
                style="background:none;border:none;cursor:pointer;color:inherit;padding:0;line-height:1"
                aria-label="Remove tag"
                @click="modal.data.stack.splice(i, 1)"
              >&#x2715;</button>
            </span>
          </div>
          <input
            id="modal-stack"
            v-model="newStackItem"
            type="text"
            placeholder="Add technology…"
            style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--hairline-strong);padding:10px 0;font-size:16px;color:var(--fg);outline:none"
            @keydown.enter.prevent="addStackItem"
          />
        </div>

        <div
          v-if="modal.error"
          class="mt-4 rounded px-3 py-2 text-xs"
          style="background:rgba(220,38,38,0.1);color:#f87171;border:1px solid rgba(220,38,38,0.25)"
        >
          {{ modal.error }}
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:28px;padding-top:20px;border-top:1px solid var(--hairline)">
          <button class="btn btn-ghost" @click="modal.open = false">Discard changes</button>
          <button
            class="btn btn-primary"
            :disabled="modal.saving"
            :style="modal.saving ? 'opacity:0.6' : ''"
            @click="saveModal"
          >{{ modal.saving ? 'Saving…' : 'Save metadata' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
