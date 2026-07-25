import { createClient } from '@supabase/supabase-js'
import { nextLocalOrderNumber, saveLocalOrder } from './storage'
import type { OrderPayload } from '../domain/order'
import {
  getCartItemUnitPrice,
  getItemDetails,
  getNeighborhoodName,
} from '../features/cart/cart-calculations'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const isConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('seu-projeto') &&
    !supabaseAnonKey.includes('sua-chave'),
)

const supabase =
  isConfigured && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null

type RegisterResult = {
  orderNumber: number
  storage: 'supabase' | 'local'
}

const saveFallback = (order: OrderPayload): RegisterResult => {
  const orderNumber = nextLocalOrderNumber()

  saveLocalOrder({
    ...order,
    id: crypto.randomUUID(),
    orderNumber,
    createdAt: new Date().toISOString(),
    syncStatus: 'local',
  })

  return { orderNumber, storage: 'local' }
}

export const registerOrder = async (order: OrderPayload): Promise<RegisterResult> => {
  if (!supabase) return saveFallback(order)

  try {
    const { data, error } = await supabase.rpc('create_order', {
      p_order: {
        customer_name: order.name,
        customer_phone: order.phone,
        order_type: order.orderType,
        address:
          order.orderType === 'delivery'
            ? `${order.address} — ${getNeighborhoodName(order.neighborhood)}`
            : null,
        payment_method: order.paymentMethod,
        change_for: order.changeFor || null,
        notes: order.notes || null,
        delivery_fee: order.deliveryFee,
      },
      p_items: order.items.map((item) => ({
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: getCartItemUnitPrice(item),
        notes: getItemDetails(item).join(' | ') || null,
      })),
    })

    if (!error && typeof data === 'number') {
      return { orderNumber: data, storage: 'supabase' }
    }

    console.warn('Pedido salvo localmente porque o Supabase não respondeu.', error)
  } catch (error) {
    console.warn('Pedido salvo localmente por falha de conexão com o Supabase.', error)
  }

  return saveFallback(order)
}
