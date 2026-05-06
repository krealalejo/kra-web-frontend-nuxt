<script setup lang="ts">
const { data: metricsResponse, refresh, pending } = await useFetch('/api/admin/metrics')

const metrics = computed(() => metricsResponse.value || {})

const stats = computed(() => {
  if (!metrics.value) return []

  const getSum = (id: string) => metrics.value[id]?.values?.reduce((a: number, b: number) => a + b, 0) || 0
  const getAvg = (id: string) => {
    const vals = metrics.value[id]?.values || []
    return vals.length ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0
  }

  const thumbInvocations = getSum('thumb_invocations')
  const thumbErrors = getSum('thumb_errors')
  const emailInvocations = getSum('email_invocations')
  const emailErrors = getSum('email_errors')
  
  const totalInvocations = thumbInvocations + emailInvocations
  const totalErrors = thumbErrors + emailErrors
  const successRate = totalInvocations > 0 ? ((totalInvocations - totalErrors) / totalInvocations) * 100 : 100

  return [
    {
      label: 'Lambda Success Rate',
      value: `${successRate.toFixed(1)}%`,
      status: successRate > 99 ? 'success' : successRate > 95 ? 'warning' : 'error',
      description: 'Combined success rate for all handlers'
    },
    {
      label: 'Avg Latency',
      value: `${getAvg('thumb_duration').toFixed(0)}ms`,
      status: 'neutral',
      description: 'Thumbnail generator processing time'
    },
    {
      label: 'System Errors',
      value: totalErrors.toString(),
      status: totalErrors === 0 ? 'success' : 'error',
      description: 'Failed executions in the last 24h'
    },
    {
      label: 'DB Throttles',
      value: getSum('db_throttles').toString(),
      status: getSum('db_throttles') === 0 ? 'success' : 'warning',
      description: 'DynamoDB read/write capacity limits'
    }
  ]
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success': return 'var(--success, #22c55e)'
    case 'warning': return 'var(--warning, #f59e0b)'
    case 'error': return 'var(--error, #ef4444)'
    default: return 'var(--fg-muted)'
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <h2 class="t-label" style="font-size: 14px; color: var(--fg)">System Health (AWS)</h2>
        <p class="t-label" style="font-size: 11px; color: var(--fg-muted)">Real-time metrics from CloudWatch (Last 24h)</p>
      </div>
      <button 
        @click="refresh()" 
        :disabled="pending"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all active:scale-95"
        style="background: var(--bg-sunken); border: 1px solid var(--hairline); cursor: pointer"
      >
        <Icon name="lucide:refresh-cw" class="h-3.5 w-3.5" :class="{ 'animate-spin': pending }" />
        <span class="t-label" style="font-size: 10px">Refresh</span>
      </button>
    </div>

    <div v-if="pending && !metricsResponse" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="i in 4" :key="i" class="h-32 animate-pulse rounded-2xl" style="background: var(--bg-elev); border: 1px solid var(--hairline)" />
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="group flex flex-col gap-3 rounded-2xl p-5 transition-all hover:translate-y-[-2px]"
        style="background: var(--bg-elev); border: 1px solid var(--hairline)"
      >
        <div class="flex items-center justify-between">
          <span class="t-label" style="font-size: 10px; color: var(--fg-muted); letter-spacing: 0.05em; text-transform: uppercase">{{ stat.label }}</span>
          <div class="h-1.5 w-1.5 rounded-full" :style="{ background: getStatusColor(stat.status), boxShadow: `0 0 8px ${getStatusColor(stat.status)}` }" />
        </div>
        
        <div class="flex items-baseline gap-2">
          <span class="t-h2" style="font-size: 24px">{{ stat.value }}</span>
        </div>

        <p class="t-label" style="font-size: 10px; color: var(--fg-muted); line-height: 1.4">{{ stat.description }}</p>
      </div>
    </div>

    <!-- Lambda Comparison -->
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-2xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline)">
        <h3 class="t-label mb-6" style="font-size: 12px">Functions Activity</h3>
        <div class="space-y-6">
          <div v-for="fn in ['Thumbnail', 'Email']" :key="fn" class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="t-label" style="font-size: 11px">{{ fn }} Generator</span>
              <span class="t-label" style="font-size: 10px; color: var(--fg-muted)">
                {{ metrics[fn.toLowerCase() + '_invocations']?.values?.reduce((a, b) => a + b, 0) || 0 }} invocations
              </span>
            </div>
            <div class="h-1.5 w-full rounded-full overflow-hidden" style="background: var(--bg-sunken)">
              <div 
                class="h-full transition-all duration-1000"
                style="background: var(--accent)"
                :style="{ width: `${Math.min(100, (metrics[fn.toLowerCase() + '_invocations']?.values?.reduce((a, b) => a + b, 0) || 0) / 10)}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl p-6" style="background: var(--bg-elev); border: 1px solid var(--hairline)">
        <h3 class="t-label mb-6" style="font-size: 12px">Reliability</h3>
        <div class="flex items-center justify-center py-4">
          <div class="relative flex items-center justify-center">
            <!-- Simple SVG Gauge -->
            <svg class="h-32 w-32 transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="var(--bg-sunken)" stroke-width="8" fill="transparent" />
              <circle 
                cx="64" cy="64" r="58" 
                stroke="var(--accent)" 
                stroke-width="8" 
                fill="transparent" 
                stroke-dasharray="364.4"
                :stroke-dashoffset="364.4 - (364.4 * (stats[0]?.value.replace('%','') / 100))"
                stroke-linecap="round"
                class="transition-all duration-1000"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="t-h2" style="font-size: 20px">{{ stats[0]?.value }}</span>
              <span class="t-label" style="font-size: 9px; color: var(--fg-muted)">uptime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
