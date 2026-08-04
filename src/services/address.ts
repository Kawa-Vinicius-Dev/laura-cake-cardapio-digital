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
  erro?: boolean
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
const searchAreaKm = 12
const preferredNeighborhoods = [
  'janga',
  'pau amarelo',
  'nossa senhora do o',
]

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

const cepLikePattern = /^[\d-]+$/

export const isValidCep = (value: string) =>
  /^\d{5}-?\d{3}$/.test(value.trim())

export const formatAddressSearchInput = (value: string) => {
  if (!/^\d+$/.test(value)) return value

  const digits = value.slice(0, 8)
  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits
}

const normalizePlaceName = (value: string) =>
  value
    .replace(/^Comdomínio\b/i, 'Condomínio')
    .replace(/\bpraia do Janga\b/i, 'Praia do Janga')

const normalizeForComparison = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR')

const sortLocalSuggestions = (suggestions: AddressSuggestion[]) =>
  suggestions.sort((first, second) => {
    const firstPriority = preferredNeighborhoods.indexOf(
      normalizeForComparison(first.neighborhood),
    )
    const secondPriority = preferredNeighborhoods.indexOf(
      normalizeForComparison(second.neighborhood),
    )
    const normalizedFirstPriority = firstPriority === -1 ? Infinity : firstPriority
    const normalizedSecondPriority =
      secondPriority === -1 ? Infinity : secondPriority

    if (normalizedFirstPriority !== normalizedSecondPriority) {
      return normalizedFirstPriority - normalizedSecondPriority
    }

    return (first.distanceKm ?? Infinity) - (second.distanceKm ?? Infinity)
  })

const searchKnownPlaces = async (
  query: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> => {
  const { city, state, origin, maxRadiusKm } = DELIVERY_ADDRESS_CONFIG
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
      !Number.isFinite(longitude) ||
      (properties.countrycode &&
        properties.countrycode.toLocaleLowerCase('pt-BR') !== 'br')
    ) {
      continue
    }

    const distanceKm = calculateDistanceKm(origin, { latitude, longitude })
    if (distanceKm > searchAreaKm) continue
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

  return sortLocalSuggestions(Array.from(uniqueSuggestions.values())).slice(0, 6)
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

const searchCep = async (
  cep: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> => {
  const { city, state, origin, maxRadiusKm } = DELIVERY_ADDRESS_CONFIG
  const normalizedCep = cep.replace(/\D/g, '')
  const response = await fetch(
    `https://viacep.com.br/ws/${normalizedCep}/json/`,
    { signal },
  )
  if (!response.ok) return []

  const address = (await response.json()) as ViaCepAddress
  if (address.erro) return []

  const formattedCep = address.cep?.trim()
  const addressCity = address.localidade?.trim()
  const addressState = address.uf?.trim()
  if (!formattedCep || !addressCity || !addressState) return []

  const coordinates = await getCepCoordinates(formattedCep, signal)
  const distanceKm = coordinates
    ? calculateDistanceKm(origin, coordinates)
    : null
  const neighborhood = address.bairro?.trim() || ''

  return [
    {
      id: `cep-${normalizedCep}`,
      cep: formattedCep,
      street:
        address.logradouro?.trim() ||
        neighborhood ||
        `${addressCity}–${addressState}`,
      neighborhood,
      city: addressCity || city,
      state: addressState || state,
      distanceKm,
      isWithinDeliveryRadius:
        distanceKm !== null && distanceKm <= maxRadiusKm,
    },
  ]
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

  const uniqueAddresses = new Map<
    string,
    Omit<
      AddressSuggestion,
      'distanceKm' | 'isWithinDeliveryRadius'
    >
  >()
  for (const address of data) {
    const street = address.logradouro?.trim()
    const neighborhood = address.bairro?.trim()
    const cep = address.cep?.trim()
    if (!street || !neighborhood || !cep) continue

    const id = `${cep}-${street}-${neighborhood}`
    if (uniqueAddresses.has(id)) continue
    uniqueAddresses.set(id, {
      id,
      cep,
      street,
      neighborhood,
      city: address.localidade?.trim() || city,
      state: address.uf?.trim() || state,
    })
    if (uniqueAddresses.size === 6) break
  }

  return Promise.all(
    Array.from(uniqueAddresses.values()).map(async (address) => {
      const coordinates = await getCepCoordinates(address.cep, signal)
      const distanceKm = coordinates
        ? calculateDistanceKm(origin, coordinates)
        : null

      return {
        ...address,
        distanceKm,
        isWithinDeliveryRadius:
          distanceKm !== null && distanceKm <= maxRadiusKm,
      }
    }),
  )
}

export const searchDeliveryAddresses = async (
  value: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> => {
  const query = normalizeSearch(value)
  if (query.length < 3) return []

  if (cepLikePattern.test(query)) {
    if (!isValidCep(query)) return []
    return searchCep(query, signal)
  }

  const cacheKey = query.toLocaleLowerCase('pt-BR')
  const cached = suggestionCache.get(cacheKey)
  if (cached) return cached

  const [knownPlacesResult, officialStreetsResult] = await Promise.allSettled([
    searchKnownPlaces(query, signal),
    searchOfficialStreets(query, signal),
  ])
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  const candidates = [
    ...(knownPlacesResult.status === 'fulfilled' ? knownPlacesResult.value : []),
    ...(officialStreetsResult.status === 'fulfilled'
      ? officialStreetsResult.value
      : []),
  ]
  const uniqueSuggestions = new Map<string, AddressSuggestion>()
  for (const suggestion of candidates) {
    const key = [
      suggestion.cep,
      normalizeForComparison(suggestion.street),
      normalizeForComparison(suggestion.neighborhood),
    ].join('|')
    if (!uniqueSuggestions.has(key)) uniqueSuggestions.set(key, suggestion)
  }

  const suggestions = sortLocalSuggestions(
    Array.from(uniqueSuggestions.values()),
  ).slice(0, 6)
  suggestionCache.set(cacheKey, suggestions)
  return suggestions
}
