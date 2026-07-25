import { useEffect, useState } from 'react'
import { Check, ListChecks, Plus, X } from 'lucide-react'
import type { Product, ProductOption } from '../data/menu'
import { formatCurrency } from '../lib/format'
import type { CartAddonSelection } from '../types'
import { QuantityControl } from './QuantityControl'

type ProductCustomizerProps = {
  open: boolean
  product: Product | null
  onClose: () => void
  onAdd: (
    product: Product,
    option: ProductOption | undefined,
    quantity: number,
    addons: CartAddonSelection[],
  ) => void
}

export function ProductCustomizer({
  open,
  product,
  onClose,
  onAdd,
}: ProductCustomizerProps) {
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({})
  const hasOptions = Boolean(product?.options?.length)

  useEffect(() => {
    if (!open) return
    setSelectedOptionId('')
    setQuantity(1)
    setAddonQuantities({})
  }, [open, product?.id])

  const selectedOption = product?.options?.find(
    (option) => option.id === selectedOptionId,
  )
  const canAdd = Boolean(product && (!hasOptions || selectedOption))
  const selectedAddons =
    product?.addons?.flatMap((addon) => {
      const addonQuantity = addonQuantities[addon.id] ?? 0
      return addonQuantity > 0
        ? [{ addon, quantity: addonQuantity }]
        : []
    }) ?? []
  const addonUnitTotal = selectedAddons.reduce(
    (total, selection) =>
      total + selection.addon.price * selection.quantity,
    0,
  )
  const unitPrice =
    (selectedOption?.price ?? product?.price ?? 0) + addonUnitTotal

  const handleAdd = () => {
    if (!product || !canAdd) return
    onAdd(product, selectedOption, quantity, selectedAddons)
    onClose()
  }

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
        className={`absolute inset-x-0 bottom-0 mx-auto flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-t-[2rem] bg-paper shadow-2xl transition-[transform,opacity] duration-300 ease-out sm:inset-y-8 sm:rounded-[2rem] ${
          open
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 sm:translate-y-10'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-customizer-title"
      >
        <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sun">
              <ListChecks size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="eyebrow text-tomato">
                {hasOptions ? 'Personalize seu pedido' : 'Escolha a quantidade'}
              </p>
              <h2
                id="product-customizer-title"
                className="font-display mt-1 truncate text-lg uppercase sm:text-xl"
              >
                {product?.name ?? 'Adicionar produto'}
              </h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Fechar">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {hasOptions ? (
            <>
              <div className="mb-4">
                <p className="field-label mb-1">Opção obrigatória</p>
                <h3 className="text-lg font-extrabold">
                  {product?.optionLabel ?? 'Escolha uma opção'}
                </h3>
              </div>

              <div
                className="space-y-2.5"
                role="radiogroup"
                aria-label={product?.optionLabel}
              >
                {product?.options?.map((option) => {
                  const checked = selectedOptionId === option.id

                  return (
                    <label
                      key={option.id}
                      className={`product-option-choice ${
                        checked ? 'product-option-choice-selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="product-option"
                        value={option.id}
                        checked={checked}
                        onChange={() => setSelectedOptionId(option.id)}
                        className="sr-only"
                      />
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${
                          checked
                            ? 'border-cobalt bg-cobalt text-white'
                            : 'border-ink/20 bg-white'
                        }`}
                      >
                        {checked ? (
                          <Check size={14} strokeWidth={3} aria-hidden="true" />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block text-sm">{option.name}</strong>
                        <small className="mt-1 block text-xs leading-5 text-ink/50">
                          {option.description}
                        </small>
                      </span>
                      <strong className="shrink-0 text-sm text-cobalt">
                        {formatCurrency(option.price)}
                      </strong>
                    </label>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm leading-6 text-ink/60">{product?.description}</p>
              <strong className="mt-2 block text-lg text-cobalt">
                {formatCurrency(product?.price ?? 0)}
              </strong>
            </div>
          )}

          {product?.addons?.length ? (
            <section className="mt-6">
              <div className="mb-3">
                <p className="field-label mb-1">Adicionais</p>
                <h3 className="font-extrabold">Complete do seu jeito</h3>
              </div>
              <div className="space-y-2.5">
                {product.addons.map((addon) => {
                  const addonQuantity = addonQuantities[addon.id] ?? 0

                  return (
                    <div key={addon.id} className="addon-choice">
                      <div className="min-w-0 flex-1">
                        <strong className="block text-sm">{addon.name}</strong>
                        <span className="mt-1 block text-xs font-bold text-cobalt">
                          {formatCurrency(addon.price)} por unidade
                        </span>
                      </div>
                      <QuantityControl
                        quantity={addonQuantity}
                        label={addon.name}
                        onDecrease={() =>
                          setAddonQuantities((current) => ({
                            ...current,
                            [addon.id]: Math.max(0, addonQuantity - 1),
                          }))
                        }
                        onIncrease={() =>
                          setAddonQuantities((current) => ({
                            ...current,
                            [addon.id]: Math.min(20, addonQuantity + 1),
                          }))
                        }
                      />
                    </div>
                  )
                })}
              </div>
            </section>
          ) : null}

          {!hasOptions || selectedOption ? (
            <div className="quantity-step mt-6">
              <div>
                <p className="field-label mb-1">Quantidade</p>
                <strong>Quantos você deseja?</strong>
              </div>
              <QuantityControl
                quantity={quantity}
                label={product?.name ?? 'produto'}
                onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
                onIncrease={() => setQuantity((current) => Math.min(99, current + 1))}
              />
            </div>
          ) : null}
        </div>

        <footer className="border-t border-ink/10 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7">
          <button
            type="button"
            disabled={!canAdd}
            onClick={handleAdd}
            className="primary-button w-full disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none"
          >
            <Plus size={19} aria-hidden="true" />
            {canAdd
              ? `Adicionar ${quantity} • ${formatCurrency(unitPrice * quantity)}`
              : 'Escolha uma opção para adicionar'}
          </button>
        </footer>
      </section>
    </div>
  )
}
