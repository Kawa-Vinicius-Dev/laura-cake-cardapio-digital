import { describe, expect, it } from 'vitest'
import { products } from '../data/menu'
import type { CartItem } from '../domain/order'
import { refreshCartItems } from './storage'

const coxinha = products.find((product) => product.id === 'coxinha')!
const frango = coxinha.options!.find((option) => option.id === 'frango')!

describe('refreshCartItems', () => {
  it('troca preço antigo salvo pelo preço atual do cardápio', () => {
    const saved: CartItem[] = [
      {
        id: 'coxinha:frango:',
        product: { ...coxinha, price: 1 },
        selectedOption: { ...frango, price: 1 },
        quantity: 2,
        notes: 'sem pimenta',
      },
    ]
    const [item] = refreshCartItems(saved)
    expect(item.product.price).toBe(coxinha.price)
    expect(item.selectedOption?.price).toBe(frango.price)
    expect(item.quantity).toBe(2)
    expect(item.notes).toBe('sem pimenta')
  })

  it('remove itens, opções ou adicionais que saíram do cardápio', () => {
    const saved = [
      { id: 'x', product: { ...coxinha, id: 'nao-existe' }, quantity: 1, notes: '' },
      {
        id: 'y',
        product: coxinha,
        selectedOption: { ...frango, id: 'sabor-removido' },
        quantity: 1,
        notes: '',
      },
      {
        id: 'z',
        product: coxinha,
        selectedAddons: [{ addon: { id: 'sumiu', name: 'x', price: 1 }, quantity: 1 }],
        quantity: 1,
        notes: '',
      },
    ] as CartItem[]
    expect(refreshCartItems(saved)).toEqual([])
  })
})
