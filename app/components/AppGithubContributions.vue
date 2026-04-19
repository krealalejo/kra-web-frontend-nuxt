<script setup lang="ts">
import { computed, nextTick, watch, ref } from 'vue'
import gsap from 'gsap'

interface GitHubContributionResponse {
  totalContributions: number
  weeks: {
    contributionDays: {
      contributionCount: number
      date: string
      color: string
    }[]
  }[]
}

const config = useRuntimeConfig()

const { data, pending, error } = await useAsyncData<GitHubContributionResponse>(
  'github-contributions',
  async () => {
    const raw = config.public.apiBase
    const apiBase = typeof raw === 'string' ? raw.replace(/\/$/, '') : ''
    if (!apiBase) {
      throw new Error('MISSING_API_BASE')
    }
    return await $fetch<GitHubContributionResponse>(`${apiBase}/portfolio/contributions`)
  }
)

const weeks = computed(() => data.value?.weeks || [])
const contributionContainer = ref(null)

watch(pending, (isPending) => {
  if (!isPending && data.value) {
    nextTick(() => {
      if (contributionContainer.value) {
        gsap.from(contributionContainer.value, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power3.out'
        })
      }
    })
  }
}, { immediate: true })

function getDayColorClass(count: number) {
  if (count === 0) return 'text-slate-100 dark:text-white/[0.05]'
  if (count < 3) return 'text-emerald-200/60 dark:text-emerald-500/20'
  if (count < 6) return 'text-emerald-300 dark:text-emerald-500/40'
  if (count < 10) return 'text-emerald-500 dark:text-emerald-500/70'
  return 'text-emerald-600 dark:text-emerald-400'
}
</script>

<template>
  <div class="group relative mt-10 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 p-6 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-xl transition-all duration-300 hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/50 dark:ring-white/5">
    <div class="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl transition-opacity group-hover:opacity-100 dark:bg-emerald-500/20" />
    
    <div class="relative flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="h-2 w-2 rounded-full bg-emerald-500" />
        <h3 class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          GitHub Activity
        </h3>
      </div>
      <div v-if="data" class="flex items-center gap-3">
        <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {{ data.totalContributions }}
        </span>
        <span class="text-xs text-slate-500 dark:text-slate-400">
          contributions in the last year
        </span>
      </div>
    </div>

    <div v-if="error" class="mt-6 flex h-24 items-center justify-center rounded-lg border border-red-100 bg-red-50/50 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
      Unable to load activity data.
    </div>
    
    <div v-else-if="pending" class="mt-6 flex h-[100px] items-center justify-center">
       <div class="flex gap-1">
         <div v-for="i in 3" :key="i" class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 dark:bg-slate-700" :style="{ animationDelay: `${i * 0.1}s` }" />
       </div>
    </div>

    <div v-else ref="contributionContainer" class="mt-6">
      <svg
        width="100%"
        :viewBox="`0 0 ${weeks.length * 13 - 3} 91`"
        class="overflow-visible"
        preserveAspectRatio="xMinYMin meet"
      >
        <g v-for="(week, weekIndex) in weeks" :key="weekIndex" :transform="`translate(${weekIndex * 13}, 0)`">
          <rect
            v-for="(day, dayIndex) in week.contributionDays"
            :key="day.date"
            :x="0"
            :y="dayIndex * 13"
            width="10"
            height="10"
            rx="2.5"
            class="contribution-rect fill-current origin-center transition-all duration-300 hover:stroke-emerald-400 hover:stroke-2 dark:hover:stroke-emerald-300"
            :class="getDayColorClass(day.contributionCount)"
          >
            <title>{{ day.contributionCount }} contributions on {{ day.date }}</title>
          </rect>
        </g>
      </svg>
    </div>

    <div class="mt-2 flex items-center justify-end gap-2 pr-1">
      <span class="text-[10px] text-slate-400 dark:text-slate-500">Less</span>
      <div class="flex gap-1">
        <div v-for="i in [0, 2, 5, 8, 12]" :key="i" class="h-2 w-2 rounded-[1.5px] fill-current" :class="getDayColorClass(i)" />
      </div>
      <span class="text-[10px] text-slate-400 dark:text-slate-500">More</span>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.1);
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.2);
}

.contribution-rect {
  transform-box: fill-box;
}
</style>
