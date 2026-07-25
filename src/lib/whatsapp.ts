import { STORE_CONFIG } from '../data/menu'
import type { OrderPayload } from '../types'
import { formatCurrency, formatOrderNumber } from './format'
import {
  getCartItemBasePrice,
  getCartItemUnitPrice,
  getItemDetails,
  getNeighborhoodName,
} from './order'

export const buildWhatsAppMessage = (order: OrderPayload, orderNumber: number) => {
  const items = order.items
    .map((item) => {
      const line = `${item.quantity}x ${item.product.name} — ${formatCurrency(
        (item.selectedAddons?.length
          ? getCartItemBasePrice(item)
          : getCartItemUnitPrice(item)) * item.quantity,
      )}`
      const details = getItemDetails(item)
      return details.length
        ? `${line}\n${details.map((detail) => `   • ${detail}`).join('\n')}`
        : line
    })
    .join('\n')

  const details = [
    'Olá! Novo pedido pelo cardápio digital.',
    '',
    `Pedido: ${formatOrderNumber(orderNumber)}`,
    `Cliente: ${order.name}`,
    `WhatsApp: ${order.phone}`,
    '',
    'Itens:',
    items,
    '',
    `Subtotal: ${formatCurrency(order.subtotal)}`,
    ...(order.orderType === 'delivery'
      ? [
          order.deliveryFeePending
            ? 'Taxa de entrega: A confirmar no WhatsApp'
            : `Taxa de entrega: ${formatCurrency(order.deliveryFee)}`,
        ]
      : []),
    `${order.deliveryFeePending ? 'Total parcial' : 'Total'}: ${formatCurrency(order.total)}`,
    `Tipo: ${order.orderType === 'delivery' ? 'Entrega' : 'Retirada'}`,
    ...(order.orderType === 'delivery'
      ? [
          `Bairro: ${getNeighborhoodName(order.neighborhood)}`,
          `Endereço: ${order.address}`,
        ]
      : []),
    `Pagamento: ${order.paymentMethod}`,
    ...(order.paymentMethod === 'Dinheiro' && order.changeFor
      ? [`Troco para: ${order.changeFor}`]
      : []),
    ...(order.notes ? [`Observação geral: ${order.notes}`] : []),
  ]

  return details.join('\n')
}

export const getWhatsAppUrl = (message: string) =>
  `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`
