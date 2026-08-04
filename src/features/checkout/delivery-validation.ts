import { DELIVERY_ADDRESS_CONFIG } from '../../data/menu'
import type { OrderType } from '../../domain/order'

export const isDeliveryAddressReady = (
  orderType: OrderType,
  address: string,
) => orderType === 'pickup' || Boolean(address.trim())

export const isDeliveryQuotePending = (
  orderType: OrderType,
  distanceKm: number | null,
) =>
  orderType === 'delivery' &&
  (distanceKm === null || distanceKm > DELIVERY_ADDRESS_CONFIG.maxRadiusKm)
