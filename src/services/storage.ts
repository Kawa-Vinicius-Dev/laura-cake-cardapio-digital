import type {
  CartItem,
  CustomerProfile,
  StoredOrder,
} from '../domain/order'

const PROFILE_KEY = 'sabor-da-casa:customer:v1'
const CART_KEY = 'sabor-da-casa:cart:v4'
const ORDERS_KEY = 'sabor-da-casa:orders:v1'
const SEQUENCE_KEY = 'sabor-da-casa:order-sequence:v2'
const STORE_TIME_ZONE = 'America/Fortaleza'

type LocalOrderSequence = {
  date: string
  lastNumber: number
}

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export const loadCustomer = (): CustomerProfile => {
  const fallback: CustomerProfile = {
    name: '',
    phone: '',
    address: '',
    neighborhood: '',
  }
  return {
    ...fallback,
    ...safeParse<Partial<CustomerProfile>>(localStorage.getItem(PROFILE_KEY), {}),
  }
}

export const saveCustomer = (customer: CustomerProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(customer))
}

export const loadCart = (): CartItem[] =>
  safeParse<CartItem[]>(localStorage.getItem(CART_KEY), [])

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export const saveLocalOrder = (order: StoredOrder) => {
  const orders = safeParse<StoredOrder[]>(localStorage.getItem(ORDERS_KEY), [])
  localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...orders].slice(0, 30)))
}

const getStoreDate = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: STORE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))

  return `${values.year}-${values.month}-${values.day}`
}

export const nextLocalOrderNumber = () => {
  const today = getStoreDate(new Date())
  const current = safeParse<Partial<LocalOrderSequence>>(
    localStorage.getItem(SEQUENCE_KEY),
    {},
  )
  const lastNumber =
    current.date === today &&
    Number.isSafeInteger(current.lastNumber) &&
    Number(current.lastNumber) >= 0
      ? Number(current.lastNumber)
      : 0
  const next = lastNumber + 1

  localStorage.setItem(
    SEQUENCE_KEY,
    JSON.stringify({ date: today, lastNumber: next } satisfies LocalOrderSequence),
  )
  return next
}
