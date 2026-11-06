import { products } from '../data/menu'
import type {
  CartItem,
  CustomerProfile,
} from '../domain/order'

const PROFILE_KEY = 'sabor-da-casa:customer:v1'
const CART_KEY = 'sabor-da-casa:cart:v4'
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
    addressReference: '',
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

const productById = new Map(products.map((product) => [product.id, product]))

// O carrinho salvo guarda cópias antigas do produto. Troca por dados do cardápio
// atual (preço, nome) e descarta o que não existe mais.
export const refreshCartItems = (items: CartItem[]): CartItem[] =>
  items.flatMap((item) => {
    const product = productById.get(item.product?.id)
    if (!product || !(item.quantity >= 1)) return []

    let selectedOption = undefined
    if (item.selectedOption) {
      selectedOption = product.options?.find(
        (option) => option.id === item.selectedOption?.id,
      )
      if (!selectedOption) return []
    }

    const selectedAddons = []
    for (const selection of item.selectedAddons ?? []) {
      const addon = product.addons?.find((current) => current.id === selection.addon.id)
      if (!addon) return []
      selectedAddons.push({ addon, quantity: selection.quantity })
    }

    return [
      {
        ...item,
        product,
        selectedOption,
        selectedAddons: item.selectedAddons ? selectedAddons : undefined,
      },
    ]
  })

export const loadCart = (): CartItem[] => {
  const saved = safeParse<unknown>(localStorage.getItem(CART_KEY), [])
  return Array.isArray(saved) ? refreshCartItems(saved as CartItem[]) : []
}

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
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
