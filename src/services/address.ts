import { DELIVERY_ADDRESS_CONFIG } from '../data/menu'

type PhotonFeature = {
  geometry?: {
    coordinates?: [number, number]
  }
  properties?: {
    name?: string
    street?: string
    housenumber?: string
    district?: string
    locality?: string
    city?: string
    postcode?: string
    state?: string
    countrycode?: string
    osm_type?: string
    osm_id?: number
  }
}

type PhotonResponse = {
  features?: PhotonFeature[]
}

type ViaCepAddress = {
  cep?: string
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
}

type AwesomeCepAddress = {
  lat?: string
  lng?: string
}

type Coordinates = {
  latitude: number
  longitude: number
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

const normalizeSearch = (value: string) =>
  value.trim().replace(/\s+/g, ' ').trim()

const normalizePlaceName = (value: string) =>
  value
    .replace(/^Comdomínio\b/i, 'Condomínio')
    .replace(/\bpraia do Janga\b/i, 'Praia do Janga')

const searchKnownPlaces = async (
  query: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> => {
  const { city, state, origin, maxRadiusKm } = DELIVERY_ADDRESS_CONFIG
  const searchAreaKm = 12
  const latitudeDelta = searchAreaKm / 111
  const longitudeDelta =
    searchAreaKm / (111 * Math.cos(degreesToRadians(origin.latitude)))
  const bbox = [
    origin.longitude - longitudeDelta,
    origin.latitude - latitudeDelta,
    origin.longitude + longitudeDelta,
    origin.latitude + latitudeDelta,
  ].join(',')
  const endpoint = new URL('https://photon.komoot.io/api/')

  endpoint.searchParams.set('q', `${query}, ${city}, ${state}`)
  endpoint.searchParams.set('lat', String(origin.latitude))
  endpoint.searchParams.set('lon', String(origin.longitude))
  endpoint.searchParams.set('bbox', bbox)
  endpoint.searchParams.set('limit', '8')

  const response = await fetch(endpoint, { signal })
  if (!response.ok) return []

  const data = (await response.json()) as PhotonResponse
  const uniqueSuggestions = new Map<string, AddressSuggestion>()

  for (const feature of data.features ?? []) {
    const properties = feature.properties
    const coordinates = feature.geometry?.coordinates
    const longitude = Number(coordinates?.[0])
    const latitude = Number(coordinates?.[1])
    const rawName = properties?.name?.trim() || properties?.street?.trim()
    const name = rawName ? normalizePlaceName(rawName) : ''
    if (
      !properties ||
      !name ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      continue
    }

    const distanceKm = calculateDistanceKm(origin, { latitude, longitude })
    const neighborhood =
      properties.district?.trim() ||
      properties.locality?.trim() ||
      properties.city?.trim() ||
      city
    const id =
      `${properties.osm_type ?? 'place'}-${properties.osm_id ?? `${latitude}-${longitude}`}`
    if (uniqueSuggestions.has(id)) continue

    uniqueSuggestions.set(id, {
      id,
      cep: properties.postcode?.trim() || '',
      street: name,
      neighborhood,
      city: properties.city?.trim() || city,
      state,
      distanceKm,
      isWithinDeliveryRadius: distanceKm <= maxRadiusKm,
    })
  }

  return Array.from(uniqueSuggestions.values()).slice(0, 6)
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

const searchOfficialStreets = async (
  query: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> => {
  const { state, city, origin, maxRadiusKm } = DELIVERY_ADDRESS_CONFIG
  const streetQuery = query.replace(/,.*$/, '').trim()
  const endpoint = `https://viacep.com.br/ws/${state}/${encodeURIComponent(
    city,
  )}/${encodeURIComponent(streetQuery)}/json/`
  const response = await fetch(endpoint, { signal })
  if (!response.ok) return []

  const data = (await response.json()) as ViaCepAddress[]
  if (!Array.isArray(data)) return []

  const uniqueSuggestions = new Map<string, AddressSuggestion>()
  for (const address of data) {
    const street = address.logradouro?.trim()
    const neighborhood = address.bairro?.trim()
    const cep = address.cep?.trim()
    if (!street || !neighborhood || !cep) continue

    const id = `${cep}-${street}-${neighborhood}`
    if (uniqueSuggestions.has(id)) continue
    const coordinates = await getCepCoordinates(cep, signal)
    const distanceKm = coordinates
      ? calculateDistanceKm(origin, coordinates)
      : null

    uniqueSuggestions.set(id, {
      id,
      cep,
      street,
      neighborhood,
      city: address.localidade?.trim() || city,
      state: address.uf?.trim() || state,
      distanceKm,
      isWithinDeliveryRadius:
        distanceKm !== null && distanceKm <= maxRadiusKm,
    })
    if (uniqueSuggestions.size === 6) break
  }

  return Array.from(uniqueSuggestions.values())
}

export const searchDeliveryAddresses = async (
  value: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> => {
  const query = normalizeSearch(value)
  if (query.length < 3) return []

  const cacheKey = query.toLocaleLowerCase('pt-BR')
  const cached = suggestionCache.get(cacheKey)
  if (cached) return cached

  try {
    const knownPlaces = await searchKnownPlaces(query, signal)
    if (knownPlaces.length) {
      suggestionCache.set(cacheKey, knownPlaces)
      return knownPlaces
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
  }

  const officialStreets = await searchOfficialStreets(query, signal)
  suggestionCache.set(cacheKey, officialStreets)
  return officialStreets
}
