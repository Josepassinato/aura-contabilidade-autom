import { describe, it, expect } from 'vitest'

// Teste simples de utilitários
describe('Utility Functions', () => {
  describe('Email validation', () => {
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    it('validates correct email formats', () => {
      expect(validateEmail('test@email.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('123@456.org')).toBe(true)
    })

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('user@domain')).toBe(false)
    })
  })

  describe('Date formatting', () => {
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('pt-BR')
    }

    it('formats dates correctly', () => {
      const testDate = new Date('2024-01-15')
      const formatted = formatDate(testDate)
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })
  })

  describe('Currency formatting', () => {
    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    }

    it('formats currency correctly', () => {
      expect(formatCurrency(1000)).toBe('R$ 1.000,00')
      expect(formatCurrency(0.5)).toBe('R$ 0,50')
    })
  })
})