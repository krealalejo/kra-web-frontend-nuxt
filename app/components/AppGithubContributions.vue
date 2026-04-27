<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import gsap from 'gsap'

interface GitHubContributionResponse {
  totalContributions: number
  weeks: {
    contributionDays: {
      contributionCount: number
      date: string
    }[]
  }[]
}

const config = useRuntimeConfig()

const { data, pending, error } = await useAsyncData<GitHubContributionResponse>(
  'github-contributions',
  async () => {
    const raw = config.public.apiBase
    const apiBase = typeof raw === 'string' ? raw.replace(/\/$/, '') : ''
    if (!apiBase) throw new Error('MISSING_API_BASE')
    return await $fetch<GitHubContributionResponse>(`${apiBase}/portfolio/contributions`)
  }
)

const isMobile = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined') {
    const check = () => { isMobile.value = window.innerWidth < 640 }
    check()
    window.addEventListener('resize', check)
    onUnmounted(() => window.removeEventListener('resize', check))
  }
})

const displayWeeks = computed(() => {
  if (!data.value?.weeks) return []
  const currentYear = new Date().getFullYear()

  return data.value.weeks
    .map(week => {
      const days = week.contributionDays.map(day => {
        const d = parseISO(day.date)
        return d.getFullYear() === currentYear ? day : null
      })
      return { days }
    })
    .filter(week => week.days.some(d => d !== null))
})

const monthLabels = computed(() => {
  const labels: { label: string, index: number }[] = []
  let lastMonth = -1

  displayWeeks.value.forEach((week, i) => {
    const firstValidDay = week.days.find(d => d !== null)
    if (!firstValidDay) return

    const date = parseISO(firstValidDay.date)
    const currentMonth = date.getMonth()

    if (currentMonth !== lastMonth) {
      labels.push({
        label: format(date, 'MMM'),
        index: i
      })
      lastMonth = currentMonth
    }
  })
  return labels
})

const totalContributions = computed(() =>
  displayWeeks.value.reduce((t, w) => t + w.days.reduce((d, c) => d + (c?.contributionCount || 0), 0), 0)
)

function level(count: number): string {
  if (count === 0) return '0'
  if (count < 3) return '1'
  if (count < 6) return '2'
  if (count < 10) return '3'
  return '4'
}

watch(displayWeeks, () => {
  if (!import.meta.client) return
  nextTick(() => {
    gsap.fromTo('.gh-graph .cell:not(.is-empty)',
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.4, stagger: { amount: 0.8, from: 'start' }, ease: 'power2.out' }
    )
  })
}, { immediate: true })
</script>

<template>
  <div class="gh-card">
    <div class="gh-head">
      <div class="label">
        <span class="gh-pulse" />
        GitHub Activity
      </div>
      <div v-if="data" class="gh-count">
        {{ totalContributions }}
        <small>contributions · {{ new Date().getFullYear() }}</small>
      </div>
    </div>

    <div v-if="error" style="flex:1;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);">
      API unavailable
    </div>

    <div v-else-if="pending" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;">
      <span v-for="i in 3" :key="i" style="width:6px;height:6px;border-radius:50%;background:var(--fg-faint);animation:bounce 1s ease infinite" :style="`animation-delay:${i * 0.12}s`" />
    </div>

    <template v-else>
      <div class="gh-months" :style="`grid-template-columns: repeat(${displayWeeks.length}, 1fr)`">
        <div v-for="m in monthLabels" :key="m.index" :style="`grid-column: ${m.index + 1}`" class="month">
          {{ m.label }}
        </div>
      </div>

      <div class="gh-graph" :style="`grid-template-columns: repeat(${displayWeeks.length}, 1fr)`">
        <div v-for="(week, wi) in displayWeeks" :key="wi" class="col">
          <div
            v-for="(day, di) in week.days"
            :key="di"
            class="cell"
            :class="{ 'is-empty': !day }"
            :data-l="day ? level(day.contributionCount) : '0'"
            :title="day ? `${day.contributionCount} on ${day.date}` : ''"
          />
        </div>
      </div>

      <div class="gh-legend">
        <span>{{ new Date().getFullYear() }}</span>
        <div class="scale">
          <span style="margin-right:4px;">Less</span>
          <div v-for="l in ['0','1','2','3','4']" :key="l" class="cell" :data-l="l" />
          <span style="margin-left:4px;">More</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
</style>
