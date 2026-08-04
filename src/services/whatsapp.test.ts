import { describe, expect, it } from 'vitest'
import type { OrderPayload } from '../domain/order'
import { buildWhatsAppMessage } from './whatsapp'

describe('buildWhatsAppMessage', () => {
  it('preserva endereço manual e complemento e deixa a taxa para confirmação', () => {
    const order: OrderPayload = {
      name: 'Maria',
      phone: '(81) 99999-9999',
      address: 'Rua das Flores, 10, Janga',
      addressReference: 'Casa azul, após a praça',
      neighborhood: '',
      orderType: 'delivery',
      paymentMethod: 'Pix',
      changeFor: '',
      notes: '',
      items: [],
      subtotal: 25,
      deliveryFee: 0,
      deliveryDistanceKm: null,
      packagingFee: 1,
      total: 26,
    }

    const message = buildWhatsAppMessage(order, 1)

    expect(message).toContain('Taxa de entrega: a confirmar pela loja')
    expect(message).toContain('Endereço: Rua das Flores, 10, Janga')
    expect(message).toContain(
      'Complemento / referência: Casa azul, após a praça',
    )
  })
})
