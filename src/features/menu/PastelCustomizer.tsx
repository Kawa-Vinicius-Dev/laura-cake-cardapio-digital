import { useEffect, useState } from 'react'
import { Check, ChefHat, Plus, X } from 'lucide-react'
import { PASTEL_OPTIONS } from '../../data/menu'
import type { Product } from '../../domain/menu'
import type { PastelCustomization } from '../../domain/order'
import { QuantityControl } from '../../shared/components/QuantityControl'
import { formatCurrency } from '../../shared/format'

type PastelCustomizerProps = {
  open: boolean
  product: Product | null
  onClose: () => void
  onAdd: (
    product: Product,
    customization: PastelCustomization,
    quantity: number,
  ) => void
}

const EMPTY_CUSTOMIZATION: PastelCustomization = {
  flavors: [],
  accompaniments: [],
  sauces: [],
}

type SelectionKey = keyof PastelCustomization

export function PastelCustomizer({
  open,
  product,
  onClose,
  onAdd,
}: PastelCustomizerProps) {
  const [selection, setSelection] = useState<PastelCustomization>(EMPTY_CUSTOMIZATION)
  const [quantity, setQuantity] = useState(1)
  const flavorLimit = product?.pastelFlavorLimit ?? 3

  useEffect(() => {
    if (!open) return
    setSelection(EMPTY_CUSTOMIZATION)
    setQuantity(1)
  }, [open, product?.id])

  const toggleOption = (
    key: SelectionKey,
    option: string,
    limit: number,
  ) => {
    setSelection((current) => {
      const selected = current[key]
      if (selected.includes(option)) {
        return { ...current, [key]: selected.filter((item) => item !== option) }
      }
      if (selected.length >= limit) return current
      return { ...current, [key]: [...selected, option] }
    })
  }

  const complete =
    selection.flavors.length === flavorLimit &&
    selection.accompaniments.length === 4 &&
    selection.sauces.length === 2

  const handleAdd = () => {
    if (!product || !complete) return
    onAdd(product, selection, quantity)
    onClose()
  }

  const renderOptions = (
    key: SelectionKey,
    options: readonly string[],
    limit: number,
  ) => (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const checked = selection[key].includes(option)
        const disabled = !checked && selection[key].length >= limit

        return (
          <label
            key={option}
            className={`customization-choice ${
              checked ? 'customization-choice-selected' : ''
            } ${disabled ? 'cursor-not-allowed opacity-45' : ''}`}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={() => toggleOption(key, option, limit)}
              className="sr-only"
            />
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-md border ${
                checked ? 'border-cobalt bg-cobalt text-white' : 'border-ink/20 bg-white'
              }`}
            >
              {checked ? <Check size={13} strokeWidth={3} aria-hidden="true" /> : null}
            </span>
            <span>{option}</span>
          </label>
        )
      })}
    </div>
  )

  return (
    <div
      className={`fixed inset-0 z-[70] transition ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Fechar personalização"
        onClick={onClose}
        className={`absolute inset-0 bg-ink/65 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <section
        className={`absolute inset-x-0 bottom-0 mx-auto flex max-h-[94dvh] w-full max-w-3xl flex-col rounded-t-[2rem] bg-paper shadow-2xl transition-[transform,opacity] duration-300 ease-out sm:inset-y-6 sm:rounded-[2rem] ${
          open
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 sm:translate-y-10'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pastel-customizer-title"
      >
        <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-sun">
              <ChefHat size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow text-tomato">Monte do seu jeito</p>
              <h2
                id="pastel-customizer-title"
                className="font-display mt-1 text-lg uppercase sm:text-xl"
              >
                {product?.name ?? 'Personalizar pastel'}
              </h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Fechar">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-7">
          <p className="rounded-2xl bg-white p-4 text-base leading-7 text-ink/60">
            {product?.description}
          </p>

          <section>
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="field-label mb-1">1. Sabores</p>
                <h3 className="font-extrabold">
                  Escolha exatamente {flavorLimit} sabores
                </h3>
              </div>
              <span className="selection-counter">
                {selection.flavors.length}/{flavorLimit}
              </span>
            </div>
            {renderOptions('flavors', PASTEL_OPTIONS.flavors, flavorLimit)}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="field-label mb-1">2. Acompanhamentos</p>
                <h3 className="font-extrabold">Escolha exatamente 4 acompanhamentos</h3>
              </div>
              <span className="selection-counter">
                {selection.accompaniments.length}/4
              </span>
            </div>
            {renderOptions('accompaniments', PASTEL_OPTIONS.accompaniments, 4)}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="field-label mb-1">3. Molhos</p>
                <h3 className="font-extrabold">Escolha exatamente 2 molhos</h3>
              </div>
              <span className="selection-counter">{selection.sauces.length}/2</span>
            </div>
            {renderOptions('sauces', PASTEL_OPTIONS.sauces, 2)}
          </section>
        </div>

        <footer className="border-t border-ink/10 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7">
          {complete ? (
            <div className="quantity-step mb-4">
              <div>
                <p className="field-label mb-1">Quantidade</p>
                <strong>Quantos pastéis você deseja?</strong>
              </div>
              <QuantityControl
                quantity={quantity}
                label={product?.name ?? 'pastel'}
                onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
                onIncrease={() => setQuantity((current) => Math.min(99, current + 1))}
              />
            </div>
          ) : null}
          <button
            type="button"
            disabled={!complete}
            onClick={handleAdd}
            className="primary-button w-full disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none"
          >
            <Plus size={19} aria-hidden="true" />
            {complete
              ? `Adicionar ${quantity} • ${formatCurrency((product?.price ?? 0) * quantity)}`
              : 'Complete as escolhas para adicionar'}
          </button>
        </footer>
      </section>
    </div>
  )
}
