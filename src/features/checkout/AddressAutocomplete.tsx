import { useEffect, useId, useState, type KeyboardEvent } from 'react'
import { LoaderCircle, MapPin, Search } from 'lucide-react'
import {
  searchDeliveryAddresses,
  type AddressSuggestion,
} from '../../services/address'
import { DELIVERY_ADDRESS_CONFIG } from '../../data/menu'

type AddressAutocompleteProps = {
  active: boolean
  value: string
  onChange: (value: string) => void
  onClearSelection: () => void
  onSelect: (suggestion: AddressSuggestion) => void
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR')

export function AddressAutocomplete({
  active,
  value,
  onChange,
  onClearSelection,
  onSelect,
}: AddressAutocompleteProps) {
  const listId = useId()
  const [focused, setFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [selectedStreet, setSelectedStreet] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const hasSelectedStreet =
    Boolean(selectedStreet) &&
    normalize(value).startsWith(normalize(selectedStreet))

  useEffect(() => {
    if (!active || !focused || hasSelectedStreet || value.trim().length < 3) {
      setSuggestions([])
      setLoading(false)
      setFailed(false)
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setLoading(true)
      setFailed(false)

      try {
        const results = await searchDeliveryAddresses(value, controller.signal)
        setSuggestions(results)
        setActiveIndex(-1)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setSuggestions([])
        setFailed(true)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 250)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [active, focused, hasSelectedStreet, value])

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    if (!suggestion.isWithinDeliveryRadius) return
    setSelectedStreet(suggestion.street)
    setSuggestions([])
    setActiveIndex(-1)
    onSelect(suggestion)
  }

  const handleChange = (nextValue: string) => {
    const keepsSelectedStreet =
      Boolean(selectedStreet) &&
      normalize(nextValue).startsWith(normalize(selectedStreet))

    if (!keepsSelectedStreet && selectedStreet) {
      setSelectedStreet('')
      onClearSelection()
    }

    onChange(nextValue)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1,
      )
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      const suggestion = suggestions[activeIndex]
      if (suggestion.isWithinDeliveryRadius) selectSuggestion(suggestion)
    } else if (event.key === 'Escape') {
      setSuggestions([])
      setActiveIndex(-1)
    }
  }

  const listVisible = active && focused && suggestions.length > 0

  return (
    <div className="mt-5">
      <label htmlFor={`${listId}-input`} className="field-label">
        Endereço para entrega
      </label>
      <div className="relative">
        <MapPin
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-ink/40"
          aria-hidden="true"
        />
        <input
          id={`${listId}-input`}
          className="field pl-11 pr-11"
          required
          autoComplete="off"
          maxLength={220}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Comece digitando o nome da rua"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={listVisible}
          aria-controls={listId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/35">
          {loading ? (
            <LoaderCircle size={18} className="animate-spin" aria-label="Buscando" />
          ) : (
            <Search size={18} aria-hidden="true" />
          )}
        </span>

        {listVisible ? (
          <div
            id={listId}
            role="listbox"
            className="absolute inset-x-0 top-[calc(100%+0.4rem)] z-40 overflow-hidden rounded-xl border border-ink/10 bg-white p-1.5 shadow-2xl"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                id={`${listId}-option-${index}`}
                type="button"
                role="option"
                disabled={!suggestion.isWithinDeliveryRadius}
                aria-selected={activeIndex === index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                  !suggestion.isWithinDeliveryRadius
                    ? 'cursor-not-allowed bg-ink/[0.025] opacity-55'
                    : activeIndex === index
                      ? 'bg-cobalt/8'
                      : 'hover:bg-ink/5'
                }`}
              >
                <MapPin
                  size={16}
                  className="mt-0.5 shrink-0 text-tomato"
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <strong className="block truncate text-sm">
                    {suggestion.street}
                  </strong>
                  <small className="mt-0.5 block text-xs text-ink/55">
                    {suggestion.neighborhood} · {suggestion.city}–{suggestion.state} ·{' '}
                    {suggestion.cep}
                  </small>
                  <small
                    className={`mt-1 block text-xs font-bold ${
                      suggestion.isWithinDeliveryRadius
                        ? 'text-emerald-700'
                        : 'text-tomato'
                    }`}
                  >
                    {suggestion.distanceKm === null
                      ? 'Não foi possível calcular a distância'
                      : suggestion.isWithinDeliveryRadius
                        ? 'Disponível para entrega'
                        : `Fora do raio de ${DELIVERY_ADDRESS_CONFIG.maxRadiusKm} km`}
                  </small>
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <p className={`mt-2 text-xs ${failed ? 'text-tomato' : 'text-ink/50'}`}>
        {failed
          ? 'Não foi possível calcular a distância. Tente novamente ou escolha retirada.'
          : hasSelectedStreet
            ? 'Endereço selecionado. Agora informe o número e o complemento.'
            : `Digite pelo menos 3 letras. Entregamos em um raio de até ${DELIVERY_ADDRESS_CONFIG.maxRadiusKm} km.`}
      </p>
    </div>
  )
}
