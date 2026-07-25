import { deliveryAreas } from '../data/menu'
import type { CartItem } from '../types'
import { formatCurrency } from './format'

export const getNeighborhoodName = (neighborhoodId: string) =>
  deliveryAreas.find((area) => area.id === neighborhoodId)?.name ??
    (neighborhoodId === 'other' ? 'Outro bairro' : '')

export const getCartItemBasePrice = (item: CartItem) =>
  item.selectedOption?.price ?? item.product.price

export const getCartItemAddonUnitTotal = (item: CartItem) =>
  item.selectedAddons?.reduce(
    (total, selection) =>
      total + selection.addon.price * selection.quantity,
    0,
  ) ?? 0

export const getCartItemUnitPrice = (item: CartItem) =>
  getCartItemBasePrice(item) + getCartItemAddonUnitTotal(item)

export const getItemDetails = (item: CartItem) => {
  const details: string[] = []

  if (item.selectedOption) {
    details.push(item.selectedOption.name)
  }

  item.selectedAddons?.forEach((selection) => {
    details.push(
      `${selection.quantity}x ${selection.addon.name} — ${formatCurrency(
        selection.addon.price * selection.quantity,
      )} por item`,
    )
  })

  if (item.selectedAddons?.length) {
    details.push(
      `Total do item: ${formatCurrency(
        getCartItemUnitPrice(item) * item.quantity,
      )}`,
    )
  }

  if (item.customization) {
    details.push(`Sabores: ${item.customization.flavors.join(', ')}`)
    details.push(
      `Acompanhamentos: ${item.customization.accompaniments.join(', ')}`,
    )
    details.push(`Molhos: ${item.customization.sauces.join(', ')}`)
  }

  if (item.notes) details.push(`Observação: ${item.notes}`)

  return details
}
