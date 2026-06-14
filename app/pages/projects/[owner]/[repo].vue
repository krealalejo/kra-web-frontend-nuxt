<script setup lang="ts">
import type { PortfolioRepoDto } from "~/types/portfolio";
import { useMarkdown } from "~/composables/useMarkdown";
import IconBrandGithub from "~/components/icons/IconBrandGithub.vue";
import { useApiError } from "~/composables/useApiError";

const route = useRoute();
const config = useRuntimeConfig();

const owner = computed(() => {
  const p = route.params.owner;
  /* v8 ignore next 1 */
  return String(Array.isArray(p) ? (p[0] ?? "") : (p ?? ""));
});
const repo = computed(() => {
  const p = route.params.repo;
  /* v8 ignore next 1 */
  return String(Array.isArray(p) ? (p[0] ?? "") : (p ?? ""));
});

const { sanitizeMarkdown, extractHeadings } = useMarkdown();

interface ProjectDetail extends PortfolioRepoDto {
  sanitizedReadme: string;
  headings: { title: string; id: string }[];
  isReadmeTruncated: boolean;
}

const {
  data: detail,
  pending,
  error,
} = useAsyncData<ProjectDetail>(
  () => `portfolio-detail-${owner.value}-${repo.value}`,
  async () => {
    const o = owner.value;
    const r = repo.value;
    if (!o || !r)
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid repository path",
      });
    const raw = config.public.apiBase;
    const apiBase = typeof raw === "string" ? raw.replace(/\/$/, "") : "";
    if (!apiBase) throw new Error("MISSING_API_BASE");
    let repoDto: PortfolioRepoDto;
    try {
      repoDto = await $fetch<PortfolioRepoDto>(
        `${apiBase}/portfolio/repos/${encodeURIComponent(o)}/${encodeURIComponent(r)}`,
      );
    } catch (e: unknown) {
      const err = e as {
        statusCode?: number;
        status?: number;
        response?: { status?: number };
      };
      const code = err?.statusCode ?? err?.status ?? err?.response?.status;
      if (code === 404)
        throw createError({ statusCode: 404, statusMessage: "NOT_FOUND" });
      throw e;
    }

    const branch = repoDto.defaultBranch ?? "main";
    const imageBaseUrl = `https://raw.githubusercontent.com/${o}/${r}/${branch}`;
    const excerpt = repoDto.readmeExcerpt;
    let sanitizedReadme = "";
    let headings: { title: string; id: string }[] = [];
    let isReadmeTruncated = false;
    if (excerpt) {
      isReadmeTruncated = excerpt.trimEnd().endsWith("…");
      const clean = isReadmeTruncated
        ? excerpt.trimEnd().slice(0, -1).trimEnd()
        : excerpt;
      sanitizedReadme = await sanitizeMarkdown(clean, imageBaseUrl);
      headings = extractHeadings(clean);
    }
    return { ...repoDto, sanitizedReadme, headings, isReadmeTruncated };
  },
  { watch: [owner, repo] },
);

interface ProjectMetadataResponse {
  role: string | null;
  year: string | null;
  kind: string | null;
  mainBranch: string | null;
  stack: string[] | null;
}

const { data: metadata } = useAsyncData<ProjectMetadataResponse | null>(
  () => `project-metadata-${owner.value}-${repo.value}`,
  async () => {
    const raw = config.public.apiBase;
    const apiBase = typeof raw === "string" ? raw.replace(/\/$/, "") : "";
    return await $fetch<ProjectMetadataResponse>(
      `${apiBase}/projects/metadata/${encodeURIComponent(owner.value)}/${encodeURIComponent(repo.value)}`,
    ).catch(() => null);
  },
  { watch: [owner, repo] },
);

const { isMissingApiBase } = useApiError(error);

const isNotFound = computed(() => {
  const e = error.value as {
    statusCode?: number;
    statusMessage?: string;
  } | null;
  return e?.statusCode === 404 || e?.statusMessage === "NOT_FOUND";
});

const { renderWhenVisible, reRender } = useMermaid();
const { isDark } = useTheme();
const readmeRef = ref<HTMLElement | null>(null);

const sanitizedReadme = computed(() => detail.value?.sanitizedReadme ?? "");
const headings = computed(() => detail.value?.headings ?? []);
const isReadmeTruncated = computed(
  () => detail.value?.isReadmeTruncated ?? false,
);

watch(isDark, async () => {
  if (readmeRef.value) {
    await nextTick();
    reRender(readmeRef.value);
  }
});

watch(sanitizedReadme, async (val) => {
  if (import.meta.client && val && readmeRef.value) {
    await nextTick();
    renderWhenVisible(readmeRef.value);
  }
});

useSeoMeta({
  title: computed(() => {
    if (pending.value) return "Project · Kevin Real Alejo";
    if (error.value) return "Project · Kevin Real Alejo";
    return detail.value
      ? `${detail.value.fullName} · Kevin Real Alejo`
      : "Project · Kevin Real Alejo";
  }),
  description: computed(() => {
    if (pending.value) return "Loading repository…";
    if (error.value)
      return isNotFound.value
        ? "Repository not found."
        : "Could not load the repository.";
    return (
      detail.value?.description ?? "Portfolio project by Kevin Real Alejo."
    );
  }),
});

function projectKind(d: PortfolioRepoDto) {
  if (d.topics?.includes("backend")) return "Backend";
  if (d.topics?.includes("frontend")) return "Frontend";
  if (d.topics?.includes("serverless")) return "Serverless";
  return "Code";
}

function animateIn() {
  /* v8 ignore next 1 */
  if (
    globalThis.window !== undefined &&
    globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  nextTick(async () => {
    const els = document.querySelectorAll<HTMLElement>(".pd-head, .pd-body");
    if (els.length === 0) return;
    els.forEach((el) => {
      el.style.opacity = "0";
    });
    const { gsap } = await useGsapBase();
    const head = document.querySelector(".pd-head");
    const body = document.querySelector(".pd-body");
    if (head)
      gsap.fromTo(
        head,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      );
    if (body)
      gsap.fromTo(
        body,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.15 },
      );
  });
}

watch(pending, async (isPending) => {
  if (!import.meta.client) return;
  if (!isPending && detail.value && !error.value) {
    animateIn();
  }
});

const hasSidebar = computed(() =>
  !!(
    metadata.value &&
    (metadata.value.role ||
      metadata.value.year ||
      metadata.value.kind ||
      metadata.value.mainBranch ||
      metadata.value.stack?.length)
  ),
)

const scrollProgress = ref(0);
function onScroll() {
  const doc = document.documentElement;
  const total = doc.scrollHeight - doc.clientHeight;
  scrollProgress.value = total > 0 ? (doc.scrollTop / total) * 100 : 0;
}

onMounted(async () => {
  window.addEventListener("scroll", onScroll, { passive: true });

  if (!pending.value && detail.value && !error.value) {
    /* v8 ignore next 3 */
    if (readmeRef.value && sanitizedReadme.value) {
      await nextTick();
      renderWhenVisible(readmeRef.value);
    }
  }
});

onUnmounted(() => {
  if (import.meta.client) window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div>
    <div
      v-if="detail"
      class="post-progress"
      :style="{ width: scrollProgress + '%' }"
    />

    <output
      v-if="pending"
      aria-label="Loading repository"
      style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 40vh;
      "
    >
      <span
        style="
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--fg-muted);
          letter-spacing: 0.14em;
          text-transform: uppercase;
        "
        >Loading repository…</span
      >
    </output>

    <div v-else-if="error" role="alert" class="shell" style="padding: 64px 0">
      <div
        style="
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--fg-muted);
          padding: 32px 0;
        "
      >
        <div v-if="isNotFound">Repository not found.</div>
        <div v-else-if="isMissingApiBase">
          API unavailable — Missing NUXT_PUBLIC_API_BASE_URL.
        </div>
        <div v-else>Could not load the repository.</div>
        <NuxtLink
          to="/"
          style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 24px;
            color: var(--accent);
          "
        >
          ← Back to home
        </NuxtLink>
      </div>
    </div>

    <template v-else-if="detail">
      <section class="shell">
        <div class="pd-head">
          <NuxtLink to="/projects" class="pd-breadcrumb">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M10 6H2M2 6L6 2M2 6L6 10" />
            </svg>
            All projects
          </NuxtLink>

          <div class="pd-meta-row">
            <span>{{ metadata?.kind || projectKind(detail) }}</span>
            <span class="dot" />
            <span class="star">★ {{ detail.stargazersCount }}</span>
            <span class="dot" />
            <span>{{ new Date(detail.updatedAt).getFullYear() }}</span>
            <span v-if="detail.defaultBranch">
              <span class="dot" />
              ⎇ {{ detail.defaultBranch }}
            </span>
            <a
              v-if="detail.htmlUrl && !hasSidebar"
              :href="detail.htmlUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="pd-meta-github"
            >
              <IconBrandGithub style="width: 14px; height: 14px" />
              GitHub ↗
            </a>
          </div>

          <h1 class="t-h1" style="margin-bottom: 16px">
            {{ detail.fullName }}
          </h1>

          <p class="t-body-lg" style="margin-bottom: 20px">
            {{ detail.description || "—" }}
          </p>

          <div
            v-if="detail.topics?.length"
            style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px"
          >
            <span
              v-for="t in detail.topics"
              :key="t"
              class="chip"
              style="font-size: 10px"
              >{{ t }}</span
            >
          </div>
        </div>

        <div class="pd-body">
          <div v-if="detail.readmeExcerpt" class="pd-content">
            <div
              ref="readmeRef"
              class="markdown-content prose dark:prose-invert"
              v-html="sanitizedReadme"
            />
            <a
              v-if="isReadmeTruncated && detail.htmlUrl"
              :href="`${detail.htmlUrl}#readme`"
              target="_blank"
              rel="noopener noreferrer"
              style="
                display: inline-flex;
                align-items: center;
                gap: 6px;
                margin-top: 24px;
                font-family: var(--font-mono);
                font-size: 11px;
                color: var(--accent);
                letter-spacing: 0.06em;
              "
            >
              View full README on GitHub ↗
            </a>
          </div>
          <div v-else class="pd-content">
            <p
              style="
                color: var(--fg-muted);
                font-family: var(--font-mono);
                font-size: 12px;
              "
            >
              No README available.
            </p>
          </div>

          <ProjectSidebar
            v-if="hasSidebar"
            :role="metadata!.role"
            :year="metadata!.year"
            :kind="metadata!.kind"
            :main-branch="metadata!.mainBranch"
            :stack="metadata!.stack"
            :stars="detail.stargazersCount"
            :headings="headings"
            :html-url="detail.htmlUrl"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.pd-meta-github {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent);
  margin-left: auto;
}

@media (max-width: 900px) {
  .pd-meta-github {
    margin-left: 0;
  }

  :deep(.pd-head) {
    padding-top: 32px;
  }
}
</style>
