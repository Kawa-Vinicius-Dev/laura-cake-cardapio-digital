import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  formatAddressSearchInput,
  isValidCep,
  searchDeliveryAddresses,
} from './address'

const jsonResponse = (body: unknown, ok = true) =>
  ({
    ok,
    json: async () => body,
  }) as Response

describe('searchDeliveryAddresses', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('formata somente uma entrada numérica como CEP', () => {
    expect(formatAddressSearchInput('53437320')).toBe('53437-320')
    expect(formatAddressSearchInput('Rua 10')).toBe('Rua 10')
    expect(isValidCep('53437-320')).toBe(true)
    expect(isValidCep('5343732')).toBe(false)
  })

  it('consulta a rota de CEP e retorna o endereço completo', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          cep: '53437-320',
          logradouro: 'Rua João Alfredo',
          bairro: 'Janga',
          localidade: 'Paulista',
          uf: 'PE',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ lat: '-7.9294147', lng: '-34.8310874' }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const suggestions = await searchDeliveryAddresses('53437-320')

    expect(fetchMock.mock.calls[0]?.[0].toString()).toBe(
      'https://viacep.com.br/ws/53437320/json/',
    )
    expect(suggestions).toEqual([
      expect.objectContaining({
        cep: '53437-320',
        street: 'Rua João Alfredo',
        neighborhood: 'Janga',
        city: 'Paulista',
        state: 'PE',
        isWithinDeliveryRadius: true,
      }),
    ])
  })

  it('não consulta CEP incompleto como se fosse uma rua', async () => {
    const fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchDeliveryAddresses('5343732')).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('retorna vazio quando o CEP não existe', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ erro: true }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchDeliveryAddresses('00000-000')).resolves.toEqual([])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('prioriza a busca de rua próxima de Janga e descarta local distante', async () => {
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      const url = input.toString()
      if (url.startsWith('https://photon.komoot.io/api/')) {
        return jsonResponse({
          features: [
            {
              geometry: { coordinates: [-34.831, -7.93] },
              properties: {
                osm_type: 'W',
                osm_id: 1,
                name: 'Rua João Alfredo',
                district: 'Janga',
                city: 'Paulista',
                state: 'Pernambuco',
                countrycode: 'BR',
                postcode: '53437-320',
              },
            },
            {
              geometry: { coordinates: [-34.9, -8.2] },
              properties: {
                osm_type: 'W',
                osm_id: 2,
                name: 'Rua João Alfredo',
                district: 'Boa Viagem',
                city: 'Recife',
                state: 'Pernambuco',
                countrycode: 'BR',
                postcode: '51000-000',
              },
            },
          ],
        })
      }

      return jsonResponse([])
    })
    vi.stubGlobal('fetch', fetchMock)

    const suggestions = await searchDeliveryAddresses('Rua João Alfredo')

    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]).toEqual(
      expect.objectContaining({
        street: 'Rua João Alfredo',
        neighborhood: 'Janga',
        city: 'Paulista',
        state: 'PE',
      }),
    )
    expect(suggestions.length).toBeLessThanOrEqual(6)
  })

  it('marca endereço automático fora do raio de entrega', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          cep: '53401-000',
          logradouro: 'Avenida distante',
          bairro: 'Centro',
          localidade: 'Paulista',
          uf: 'PE',
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ lat: '-8.02', lng: '-34.90' }))
    vi.stubGlobal('fetch', fetchMock)

    const [suggestion] = await searchDeliveryAddresses('53401000')

    expect(suggestion.distanceKm).toBeGreaterThan(6)
    expect(suggestion.isWithinDeliveryRadius).toBe(false)
  })
})
