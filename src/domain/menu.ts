export type ScheduleId = 'lunch' | 'day' | 'night'

export type Category = {
  id: string
  name: string
  scheduleId?: ScheduleId
}

export type ProductOption = {
  id: string
  name: string
  price: number
  description: string
}

export type ProductAddon = {
  id: string
  name: string
  price: number
}

export type Product = {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  image: string
  badge?: string
  addons?: ProductAddon[]
  pastelFlavorLimit?: 3 | 6
  optionLabel?: string
  options?: ProductOption[]
}

export type DeliveryArea = {
  id: string
  name: string
  fee: number
}

export type MenuSchedule = {
  startHour: number
  endHour: number
  label: string
}
