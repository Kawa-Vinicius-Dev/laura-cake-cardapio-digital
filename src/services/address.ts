import { DELIVERY_ADDRESS_CONFIG } from '../data/menu'

type ViaCepAddress = {
  cep?: string
  logradouro?: string
  complemento?: string
  bairro?: string
  localidade?: string
  uf?: string
}

export type AddressSuggestion = {
  id: string
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
  distanceKm: number | null
  isWithinDeliveryRadius: boolean
}

const suggestionCache = new Map<string, AddressSuggestion[]>()
const coordinatesCache = new Map<string, Coordinates | null>()

type Coordinates = {
  latitude: number
  longitude: number
}

type AwesomeCepAddress = {
  lat?: string
  lng?: string
}

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180

const calculateDistanceKm = (from: Coordinates, to: Coordinates) => {
  const earthRadiusKm = 6371
  const latitudeDistance = degreesToRadians(to.latitude - from.latitude)
  const longitudeDistance = degreesToRadians(to.longitude - from.longitude)
  const startLatitude = degreesToRadians(from.latitude)
  const endLatitude = degreesToRadians(to.latitude)
  const haversine =
    Math.sin(latitudeDistance / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDistance / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

const getCepCoordinates = async (
  cep: string,
  signal?: AbortSignal,
): Promise<Coordinates | null> => {
  const normalizedCep = cep.replace(/\D/g, '')
  if (coordinatesCache.has(normalizedCep)) {
    return coordinatesCache.get(normalizedCep) ?? null
  }

  try {
    const response = await fetch(
      `https://cep.awesomeapi.com.br/json/${normalizedCep}`,
      { signal },
    )
    if (!response.ok) return null

    const data = (await response.json()) as AwesomeCepAddress
    const latitude = Number(data.lat)
    const longitude = Number(data.lng)
    const coordinates =
      Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { latitude, longitude }
        : null
    coordinatesCache.set(normalizedCep, coordinates)
    return coordinates
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    return null
  }
}

const normalizeSearch = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[,\d].*$/, '')
    .trim()

export const searchDeliveryAddresses = async (
  value: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> => {
  const query = normalizeSearch(value)
  if (query.length < 3) return []

  const cacheKey = query.toLocaleLowerCase('pt-BR')
  const cached = suggestionCache.get(cacheKey)
  if (cached) return cached

  const { state, city } = DELIVERY_ADDRESS_CONFIG
  const endpoint = `https://viacep.com.br/ws/${state}/${encodeURIComponent(
    city,
  )}/${encodeURIComponent(query)}/json/`
  const response = await fetch(endpoint, { signal })

  if (!response.ok) {
    throw new Error('Não foi possível consultar os endereços.')
  }

  const data = (await response.json()) as ViaCepAddress[]
  const uniqueSuggestions = new Map<string, AddressSuggestion>()

  if (Array.isArray(data)) {
    data.forEach((address) => {
      const street = address.logradouro?.trim()
      const neighborhood = address.bairro?.trim()
      const cep = address.cep?.trim()
      if (!street || !neighborhood || !cep) return

      const id = `${cep}-${street}-${neighborhood}`
      if (uniqueSuggestions.has(id)) return

      uniqueSuggestions.set(id, {
        id,
        cep,
        street,
        neighborhood,
        city: address.localidade?.trim() || city,
        state: address.uf?.trim() || state,
        distanceKm: null,
        isWithinDeliveryRadius: false,
      })
    })
  }

  const basicSuggestions = Array.from(uniqueSuggestions.values()).slice(0, 6)
  const { origin, maxRadiusKm } = DELIVERY_ADDRESS_CONFIG
  const suggestions = await Promise.all(
    basicSuggestions.map(async (suggestion) => {
      const coordinates = await getCepCoordinates(suggestion.cep, signal)
      const distanceKm = coordinates
        ? calculateDistanceKm(origin, coordinates)
        : null

      return {
        ...suggestion,
        distanceKm,
        isWithinDeliveryRadius:
          distanceKm !== null && distanceKm <= maxRadiusKm,
      }
    }),
  )
  suggestionCache.set(cacheKey, suggestions)
  return suggestions
}
