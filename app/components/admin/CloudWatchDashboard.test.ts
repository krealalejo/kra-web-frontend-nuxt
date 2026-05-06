import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'

const mockRefresh = vi.fn()
const mockMetrics = ref<Record<string, any> | null>(null)
const mockPending = ref(false)

mockNuxtImport('useFetch', () => {
  return (_url: string) => ({
    data: mockMetrics,
    refresh: mockRefresh,
    pending: mockPending,
  })
})

import CloudWatchDashboard from './CloudWatchDashboard.vue'

const makeMetrics = (overrides: Record<string, any> = {}) => ({
  thumb_invocations: { values: [10, 20] },
  thumb_errors: { values: [0, 1] },
  email_invocations: { values: [5] },
  email_errors: { values: [0] },
  thumb_duration: { values: [120, 80] },
  db_throttles: { values: [0] },
  ...overrides,
})

describe('components/admin/CloudWatchDashboard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPending.value = false
    mockMetrics.value = makeMetrics()
  })

  it('renders heading and subheading', async () => {
    const wrapper = await mountSuspended(CloudWatchDashboard)
    expect(wrapper.text()).toContain('System Health (AWS)')
    expect(wrapper.text()).toContain('CloudWatch')
  })

  it('renders Refresh button', async () => {
    const wrapper = await mountSuspended(CloudWatchDashboard)
    const btn = wrapper.find('button')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Refresh')
  })

  it('calls refresh when Refresh button is clicked', async () => {
    const wrapper = await mountSuspended(CloudWatchDashboard)
    await wrapper.find('button').trigger('click')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('shows loading skeletons when pending and no data', async () => {
    mockMetrics.value = null
    mockPending.value = true
    const wrapper = await mountSuspended(CloudWatchDashboard)
    expect(wrapper.findAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders four stat cards when data is loaded', async () => {
    const wrapper = await mountSuspended(CloudWatchDashboard)
    expect(wrapper.text()).toContain('Lambda Success Rate')
    expect(wrapper.text()).toContain('Avg Latency')
    expect(wrapper.text()).toContain('System Errors')
    expect(wrapper.text()).toContain('DB Throttles')
  })

  it('computes success rate correctly (>99% → success status)', async () => {
    mockMetrics.value = makeMetrics({
      thumb_invocations: { values: [100] },
      thumb_errors: { values: [0] },
      email_invocations: { values: [100] },
      email_errors: { values: [0] },
    })
    const wrapper = await mountSuspended(CloudWatchDashboard)
    expect(wrapper.text()).toContain('100.0%')
  })

  it('computes warning status when success rate is 96-99%', async () => {
    mockMetrics.value = makeMetrics({
      thumb_invocations: { values: [100] },
      thumb_errors: { values: [2] },
      email_invocations: { values: [0] },
      email_errors: { values: [0] },
    })
    const wrapper = await mountSuspended(CloudWatchDashboard)
    expect(wrapper.text()).toContain('98.0%')
  })

  it('computes error status when success rate is <95%', async () => {
    mockMetrics.value = makeMetrics({
      thumb_invocations: { values: [100] },
      thumb_errors: { values: [10] },
      email_invocations: { values: [0] },
      email_errors: { values: [0] },
    })
    const wrapper = await mountSuspended(CloudWatchDashboard)
    expect(wrapper.text()).toContain('90.0%')
  })

  it('shows 100% success when totalInvocations is 0', async () => {
    mockMetrics.value = makeMetrics({
      thumb_invocations: { values: [] },
      email_invocations: { values: [] },
    })
    const wrapper = await mountSuspended(CloudWatchDashboard)
    expect(wrapper.text()).toContain('100.0%')
  })

  it('shows system errors count when there are errors', async () => {
    mockMetrics.value = makeMetrics({
      thumb_errors: { values: [3] },
      email_errors: { values: [2] },
    })
    const wrapper = await mountSuspended(CloudWatchDashboard)
    expect(wrapper.text()).toContain('5')
  })

  it('shows db throttles count', async () => {
    mockMetrics.value = makeMetrics({
      db_throttles: { values: [3] },
    })
    const wrapper = await mountSuspended(CloudWatchDashboard)
    expect(wrapper.text()).toContain('3')
  })

  it('renders SVG reliability gauge', async () => {
    const wrapper = await mountSuspended(CloudWatchDashboard)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('renders functions activity section', async () => {
    const wrapper = await mountSuspended(CloudWatchDashboard)
    expect(wrapper.text()).toContain('Functions Activity')
    expect(wrapper.text()).toContain('Thumbnail Generator')
    expect(wrapper.text()).toContain('Email Generator')
  })

  it('handles missing metrics values gracefully', async () => {
    mockMetrics.value = {}
    const wrapper = await mountSuspended(CloudWatchDashboard)
    expect(wrapper.text()).toContain('Lambda Success Rate')
    expect(wrapper.text()).toContain('100.0%')
  })
})
