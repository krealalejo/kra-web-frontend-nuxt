import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useApiError } from './useApiError'

describe('useApiError', () => {
  describe('isMissingApiBase', () => {
    it('returns false when error is null', () => {
      const { isMissingApiBase } = useApiError(ref(null))
      expect(isMissingApiBase.value).toBe(false)
    })

    it('returns true when error is an Error with MISSING_API_BASE message', () => {
      const { isMissingApiBase } = useApiError(ref(new Error('MISSING_API_BASE')))
      expect(isMissingApiBase.value).toBe(true)
    })

    it('returns false when error is an Error with a different message', () => {
      const { isMissingApiBase } = useApiError(ref(new Error('Network error')))
      expect(isMissingApiBase.value).toBe(false)
    })

    it('returns true when error is a string containing MISSING_API_BASE', () => {
      const { isMissingApiBase } = useApiError(ref('MISSING_API_BASE'))
      expect(isMissingApiBase.value).toBe(true)
    })

    it('returns false when error is a string without MISSING_API_BASE', () => {
      const { isMissingApiBase } = useApiError(ref('some other error'))
      expect(isMissingApiBase.value).toBe(false)
    })

    it('returns false when error is undefined', () => {
      const { isMissingApiBase } = useApiError(ref(undefined))
      expect(isMissingApiBase.value).toBe(false)
    })

    it('returns false when error is a plain object without message property', () => {
      const { isMissingApiBase } = useApiError(ref({ code: 42 }))
      expect(isMissingApiBase.value).toBe(false)
    })

    it('returns true when error is a plain object that JSON.stringify contains MISSING_API_BASE', () => {
      const { isMissingApiBase } = useApiError(ref({ code: 'MISSING_API_BASE' }))
      expect(isMissingApiBase.value).toBe(true)
    })
  })
})
