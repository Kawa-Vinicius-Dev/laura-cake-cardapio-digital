import { DELIVERY_ADDRESS_CONFIG, STORE_CONFIG } from '../data/menu'
import type { OrderPayload } from '../domain/order'
import {
  getCartItemBasePrice,
  getCartItemUnitPrice,
  getItemDetails,
  getNeighborhoodName,
} from '../features/cart/cart-calculations'
import { formatCurrency, formatOrderNumber } from '../shared/format'

export const buildWhatsAppMessage = (order: OrderPayload, orderNumber: number) => {
  const deliveryQuotePending =
    order.orderType === 'delivery' &&
    (order.deliveryDistanceKm === null ||
      order.deliveryDistanceKm > DELIVERY_ADDRESS_CONFIG.maxRadiusKm)
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
          deliveryQuotePending
            ? 'Taxa de entrega: a confirmar pela loja'
            : `Taxa de entrega: ${formatCurrency(order.deliveryFee)}`,
          `Embalagem: ${formatCurrency(order.packagingFee)}`,
        ]
      : []),
    `${deliveryQuotePending ? 'Total parcial' : 'Total'}: ${formatCurrency(order.total)}`,
    `Tipo: ${order.orderType === 'delivery' ? 'Entrega' : 'Retirada'}`,
    ...(order.orderType === 'delivery'
      ? [
          ...(order.neighborhood
            ? [`Bairro: ${getNeighborhoodName(order.neighborhood)}`]
            : []),
          `Endereço: ${order.address}`,
          ...(order.addressReference
            ? [`Complemento / referência: ${order.addressReference}`]
            : []),
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
