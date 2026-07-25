import { STORE_CONFIG } from '../data/menu'

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat(STORE_CONFIG.locale, {
    style: 'currency',
    currency: STORE_CONFIG.currency,
  }).format(value)

export const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export const onlyDigits = (value: string) => value.replace(/\D/g, '')

export const formatOrderNumber = (value: number) =>
  `#${String(value).padStart(4, '0')}`
