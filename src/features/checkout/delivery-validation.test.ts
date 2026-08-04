import { describe, expect, it } from 'vitest'
import {
  isDeliveryAddressReady,
  isDeliveryQuotePending,
} from './delivery-validation'

describe('delivery checkout validation', () => {
  it('libera endereço manual completo sem exigir sugestão automática', () => {
    expect(
      isDeliveryAddressReady('delivery', 'Rua das Flores, 10, Janga'),
    ).toBe(true)
  })

  it('mantém a cotação pendente sem uma distância automática', () => {
    expect(isDeliveryQuotePending('delivery', null)).toBe(true)
  })

  it('mantém a cotação pendente para endereço fora do raio', () => {
    expect(isDeliveryQuotePending('delivery', 6.1)).toBe(true)
  })
})
