import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('utils', () => {
  describe('cn function', () => {
    it('merges class names correctly', () => {
      const result = cn('px-4', 'py-2', 'bg-blue-500')
      expect(result).toBe('px-4 py-2 bg-blue-500')
    })

    it('handles conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toBe('base-class active-class')
    })

    it('filters out falsy values', () => {
      const result = cn('base-class', false && 'hidden-class', null, undefined, 'visible-class')
      expect(result).toBe('base-class visible-class')
    })

    it('handles conflicting Tailwind classes', () => {
      const result = cn('px-4', 'px-8')
      expect(result).toBe('px-8')
    })

    it('handles empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('handles array inputs', () => {
      const result = cn(['px-4', 'py-2'], 'bg-blue-500')
      expect(result).toBe('px-4 py-2 bg-blue-500')
    })

    it('handles object inputs', () => {
      const result = cn({
        'px-4': true,
        'py-2': true,
        'hidden': false
      })
      expect(result).toBe('px-4 py-2')
    })
  })
})