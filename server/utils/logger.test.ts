import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSend, MockCWClient } = vi.hoisted(() => {
  const mockSend = vi.fn().mockResolvedValue({})
  const MockCWClient = vi.fn().mockImplementation(function (this: any) {
    this.send = mockSend
  })
  return { mockSend, MockCWClient }
})

vi.mock('pino', () => ({
  default: vi.fn((opts: any, dest: any) => ({ level: opts.level, _dest: dest })),
}))

vi.mock('@aws-sdk/client-cloudwatch-logs', () => ({
  CloudWatchLogsClient: MockCWClient,
  CreateLogGroupCommand: vi.fn(function (this: any, a: any) { Object.assign(this, a); this._type = 'CreateLogGroup' }),
  CreateLogStreamCommand: vi.fn(function (this: any, a: any) { Object.assign(this, a); this._type = 'CreateLogStream' }),
  PutLogEventsCommand: vi.fn(function (this: any, a: any) { Object.assign(this, a); this._type = 'PutLogEvents' }),
}))

describe('server/utils/logger', () => {
  beforeEach(() => {
    vi.resetModules()
    mockSend.mockClear()
    MockCWClient.mockClear()
    mockSend.mockResolvedValue({})
  })

  it('exports logger with error level', async () => {
    vi.stubEnv('NODE_ENV', 'test')
    const { logger } = await import('./logger')
    expect(logger).toBeDefined()
    expect(logger.level).toBe('error')
  })

  it('uses stdout in non-production', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const pino = (await import('pino')).default as ReturnType<typeof vi.fn>
    await import('./logger')
    const destArg = pino.mock.calls.at(-1)?.[1]
    expect(destArg).toBe(process.stdout)
  })

  it('uses write destination in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const pino = (await import('pino')).default as ReturnType<typeof vi.fn>
    await import('./logger')
    const destArg = pino.mock.calls.at(-1)?.[1]
    expect(destArg).toHaveProperty('write')
    expect(typeof destArg.write).toBe('function')
  })

  it('write triggers sendToCloudWatch PutLogEvents', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const pino = (await import('pino')).default as ReturnType<typeof vi.fn>
    await import('./logger')
    const dest = pino.mock.calls.at(-1)?.[1]

    dest.write('test msg')
    await new Promise((r) => setTimeout(r, 30))

    expect(mockSend).toHaveBeenCalled()
  })

  it('ensureStream creates log group, stream, then PutLogEvents', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const pino = (await import('pino')).default as ReturnType<typeof vi.fn>
    await import('./logger')
    const dest = pino.mock.calls.at(-1)?.[1]

    dest.write('msg')
    await new Promise((r) => setTimeout(r, 30))

    const types = mockSend.mock.calls.map((c) => c[0]._type)
    expect(types).toContain('CreateLogGroup')
    expect(types).toContain('CreateLogStream')
    expect(types).toContain('PutLogEvents')
  })

  it('ensureStream continues when ResourceAlreadyExistsException', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    mockSend
      .mockRejectedValueOnce(Object.assign(new Error('exists'), { name: 'ResourceAlreadyExistsException' }))
      .mockResolvedValue({})
    const pino = (await import('pino')).default as ReturnType<typeof vi.fn>
    await import('./logger')
    const dest = pino.mock.calls.at(-1)?.[1]

    dest.write('msg2')
    await new Promise((r) => setTimeout(r, 30))

    const types = mockSend.mock.calls.map((c) => c[0]._type)
    expect(types).toContain('CreateLogStream')
    expect(types).toContain('PutLogEvents')
  })

  it('sendToCloudWatch swallows CloudWatch failures silently', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    mockSend.mockRejectedValue(new Error('CW down'))
    const pino = (await import('pino')).default as ReturnType<typeof vi.fn>
    await import('./logger')
    const dest = pino.mock.calls.at(-1)?.[1]

    expect(() => dest.write('fail')).not.toThrow()
    await new Promise((r) => setTimeout(r, 30))
  })

  it('getClient reuses existing instance on second call', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const pino = (await import('pino')).default as ReturnType<typeof vi.fn>
    await import('./logger')
    const dest = pino.mock.calls.at(-1)?.[1]

    dest.write('first')
    await new Promise((r) => setTimeout(r, 30))
    const callCount = MockCWClient.mock.instances.length

    dest.write('second')
    await new Promise((r) => setTimeout(r, 30))
    expect(MockCWClient.mock.instances.length).toBe(callCount)
  })
})
