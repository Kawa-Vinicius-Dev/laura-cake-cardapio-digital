import type { Product, ProductAddon, ProductOption } from './menu'

export type CartAddonSelection = {
  addon: ProductAddon
  quantity: number
}

export type CartItem = {
  id: string
  product: Product
  quantity: number
  notes: string
  selectedOption?: ProductOption
  selectedAddons?: CartAddonSelection[]
  customization?: PastelCustomization
}

export type PastelCustomization = {
  flavors: string[]
  accompaniments: string[]
  sauces: string[]
}

export type OrderType = 'delivery' | 'pickup'

export type PaymentMethod = 'Pix' | 'Cartão' | 'Dinheiro'

export type CustomerProfile = {
  name: string
  phone: string
  address: string
  neighborhood: string
}

export type CheckoutData = CustomerProfile & {
  orderType: OrderType
  paymentMethod: PaymentMethod
  changeFor: string
  notes: string
}

export type OrderPayload = CheckoutData & {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  deliveryDistanceKm: number | null
  packagingFee: number
  total: number
}
