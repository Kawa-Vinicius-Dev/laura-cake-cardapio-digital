import { ArrowRight, ShoppingBag, Trash2, X } from 'lucide-react'
import type { CartItem } from '../../domain/order'
import { QuantityControl } from '../../shared/components/QuantityControl'
import { formatCurrency } from '../../shared/format'
import {
  getCartItemBasePrice,
  getCartItemUnitPrice,
} from './cart-calculations'

type CartDrawerProps = {
  open: boolean
  items: CartItem[]
  subtotal: number
  unavailableItemIds: string[]
  onClose: () => void
  onQuantityChange: (itemId: string, quantity: number) => void
  onNotesChange: (itemId: string, notes: string) => void
  onRemove: (itemId: string) => void
  onCheckout: () => void
}

export function CartDrawer({
  open,
  items,
  subtotal,
  unavailableItemIds,
  onClose,
  onQuantityChange,
  onNotesChange,
  onRemove,
  onCheckout,
}: CartDrawerProps) {
  const unavailableIds = new Set(unavailableItemIds)

  return (
    <div
      className={`fixed inset-0 z-50 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Fechar carrinho"
        onClick={onClose}
        className={`absolute inset-0 bg-ink/55 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-5">
          <div>
            <p className="eyebrow text-tomato">Seu pedido</p>
            <h2 id="cart-title" className="font-display text-2xl uppercase">
              Carrinho
            </h2>
          </div>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Fechar">
            <X aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="mb-5 grid size-20 place-items-center rounded-full bg-sun">
              <ShoppingBag size={34} aria-hidden="true" />
            </span>
            <h3 className="font-display text-xl uppercase">Seu carrinho está vazio</h3>
            <p className="mt-2 max-w-xs text-sm leading-6 text-ink/60">
              Escolha um favorito do cardápio e ele aparece aqui.
            </p>
            <button type="button" onClick={onClose} className="secondary-button mt-6">
              Ver o cardápio
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
              {items.map((item) => (
                <article key={item.id} className="cart-item">
                  <div className="flex gap-3">
                    <img
                      src={item.product.image}
                      alt=""
                      className="size-20 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold leading-tight">{item.product.name}</h3>
                          {item.selectedOption ? (
                            <p className="mt-1 text-sm font-semibold leading-5 text-ink/60">
                              <span className="text-tomato">•</span>{' '}
                              {item.selectedOption.name} —{' '}
                              {formatCurrency(item.selectedOption.price)}
                            </p>
                          ) : null}
                          {item.selectedAddons?.length ? (
                            <div className="mt-2 space-y-1 text-sm leading-5 text-ink/60">
                              <p>
                                Preço base — {formatCurrency(getCartItemBasePrice(item))}
                              </p>
                              {item.selectedAddons.map((selection) => (
                                <p key={selection.addon.id}>
                                  <span className="text-tomato">•</span>{' '}
                                  {selection.quantity}x {selection.addon.name} —{' '}
                                  {formatCurrency(
                                    selection.addon.price * selection.quantity,
                                  )}{' '}
                                  por item
                                </p>
                              ))}
                            </div>
                          ) : null}
                          <p className="mt-1 text-sm font-bold text-cobalt">
                            {item.selectedAddons?.length ? 'Total do item — ' : ''}
                            {formatCurrency(getCartItemUnitPrice(item) * item.quantity)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemove(item.id)}
                          className="rounded-lg p-2 text-ink/40 transition hover:bg-tomato/10 hover:text-tomato focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
                          aria-label={`Remover ${item.product.name}`}
                        >
                          <Trash2 size={17} aria-hidden="true" />
                        </button>
                      </div>
                      {unavailableIds.has(item.id) ? (
                        <p className="mt-2 text-sm font-extrabold text-tomato">
                          Indisponível neste horário
                        </p>
                      ) : null}
                      <div className="mt-3">
                        <QuantityControl
                          quantity={item.quantity}
                          label={item.product.name}
                          onDecrease={() =>
                            onQuantityChange(item.id, item.quantity - 1)
                          }
                          onIncrease={() =>
                            onQuantityChange(item.id, item.quantity + 1)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  {item.customization ? (
                    <div className="mt-3 rounded-xl bg-paper p-3 text-sm leading-6 text-ink/65">
                      <p>
                        <strong className="text-ink">Sabores:</strong>{' '}
                        {item.customization.flavors.join(', ')}
                      </p>
                      <p>
                        <strong className="text-ink">Acompanhamentos:</strong>{' '}
                        {item.customization.accompaniments.join(', ')}
                      </p>
                      <p>
                        <strong className="text-ink">Molhos:</strong>{' '}
                        {item.customization.sauces.join(', ')}
                      </p>
                    </div>
                  ) : null}
                  <label className="mt-3 block">
                    <span className="sr-only">Observação para {item.product.name}</span>
                    <input
                      type="text"
                      value={item.notes}
                      maxLength={140}
                      onChange={(event) => onNotesChange(item.id, event.target.value)}
                      placeholder="Alguma observação? Ex.: sem cebola"
                      className="field h-14 text-base"
                    />
                  </label>
                </article>
              ))}
            </div>
            <div className="border-t border-ink/10 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-ink/60">Subtotal</span>
                <strong className="text-xl">{formatCurrency(subtotal)}</strong>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold text-ink/60">Taxa de entrega</span>
                <strong className="text-xs text-ink/55">Calcular no checkout</strong>
              </div>
              <div className="mb-5 flex items-center justify-between border-t border-dashed border-ink/20 pt-3">
                <span className="font-extrabold">Total parcial</span>
                <strong className="text-xl">{formatCurrency(subtotal)}</strong>
              </div>
              {unavailableItemIds.length > 0 ? (
                <p className="mb-4 rounded-xl bg-tomato/10 p-3 text-sm font-bold leading-6 text-tomato">
                  Remova os itens indisponíveis para continuar com o pedido.
                </p>
              ) : null}
              <button
                type="button"
                onClick={onCheckout}
                disabled={unavailableItemIds.length > 0}
                className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                Finalizar pedido
                <ArrowRight size={19} aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
