import { useState, type FormEvent } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Bike,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MessageCircle,
  Store,
  X,
} from 'lucide-react'
import {
  OTHER_DELIVERY_FEE,
  PACKAGING_FEE,
  STORE_CONFIG,
  deliveryAreas,
} from '../../data/menu'
import type {
  CartItem,
  CheckoutData,
  OrderPayload,
  PaymentMethod,
} from '../../domain/order'
import {
  loadCustomer,
  nextLocalOrderNumber,
  saveCustomer,
} from '../../services/storage'
import {
  buildWhatsAppMessage,
  getWhatsAppUrl,
} from '../../services/whatsapp'
import {
  formatCurrency,
  formatOrderNumber,
  formatPhone,
  onlyDigits,
} from '../../shared/format'
import { AddressAutocomplete } from './AddressAutocomplete'
import type { AddressSuggestion } from '../../services/address'

type CheckoutModalProps = {
  open: boolean
  items: CartItem[]
  subtotal: number
  hasUnavailableItems: boolean
  onBack: () => void
  onClose: () => void
  onCompleted: () => void
}

const paymentMethods: PaymentMethod[] = ['Pix', 'Cartão', 'Dinheiro']
const normalizeNeighborhood = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR')

export function CheckoutModal({
  open,
  items,
  subtotal,
  hasUnavailableItems,
  onBack,
  onClose,
  onCompleted,
}: CheckoutModalProps) {
  const [form, setForm] = useState<CheckoutData>(() => ({
    ...loadCustomer(),
    orderType: 'delivery',
    paymentMethod: 'Pix',
    changeFor: '',
    notes: '',
  }))
  const [submitting, setSubmitting] = useState(false)
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number | null>(
    null,
  )
  const [completed, setCompleted] = useState<{
    orderNumber: number
    whatsappUrl: string
  } | null>(null)

  const selectedArea = deliveryAreas.find((area) => area.id === form.neighborhood)
  const deliveryFee =
    form.orderType === 'delivery' && form.neighborhood
      ? selectedArea?.fee ?? OTHER_DELIVERY_FEE
      : 0
  const packagingFee = form.orderType === 'delivery' ? PACKAGING_FEE : 0
  const total = subtotal + deliveryFee + packagingFee
  const deliveryReady =
    form.orderType === 'pickup' ||
    (deliveryDistanceKm !== null &&
      Boolean(form.neighborhood) &&
      Boolean(form.address.trim()) &&
      /\d/.test(form.address))
  const canSubmit =
    items.length > 0 &&
    onlyDigits(form.phone).length >= 10 &&
    Boolean(form.name.trim()) &&
    deliveryReady &&
    !hasUnavailableItems

  const updateField = <K extends keyof CheckoutData>(key: K, value: CheckoutData[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const selectAddress = (suggestion: AddressSuggestion) => {
    if (
      !suggestion.isWithinDeliveryRadius ||
      suggestion.distanceKm === null
    ) {
      return
    }

    const neighborhood = normalizeNeighborhood(suggestion.neighborhood)
    const matchedArea = deliveryAreas.find(
      (area) => normalizeNeighborhood(area.name) === neighborhood,
    )

    setForm((current) => ({
      ...current,
      address: `${suggestion.street}, `,
      neighborhood: matchedArea?.id ?? 'other',
    }))
    setDeliveryDistanceKm(suggestion.distanceKm)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || submitting) return

    setSubmitting(true)
    const whatsappWindow = window.open('', '_blank')
    if (whatsappWindow) {
      whatsappWindow.document.title = 'Abrindo WhatsApp…'
      whatsappWindow.document.body.innerHTML =
        '<p style="font:600 16px system-ui;padding:24px">Preparando seu pedido…</p>'
    }

    const order: OrderPayload = {
      ...form,
      items,
      subtotal,
      deliveryFee,
      deliveryDistanceKm:
        form.orderType === 'delivery' ? deliveryDistanceKm : null,
      packagingFee,
      total,
    }

    const orderNumber = nextLocalOrderNumber()
    saveCustomer({
      name: form.name,
      phone: form.phone,
      address: form.address,
      neighborhood: form.neighborhood,
    })
    const message = buildWhatsAppMessage(order, orderNumber)
    const whatsappUrl = getWhatsAppUrl(message)

    setCompleted({ orderNumber, whatsappUrl })
    onCompleted()

    if (whatsappWindow) {
      whatsappWindow.location.href = whatsappUrl
    }
    setSubmitting(false)
  }

  const handleClose = () => {
    setCompleted(null)
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-[60] transition ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <section
        className={`absolute inset-x-0 bottom-0 mx-auto flex max-h-[94dvh] w-full max-w-2xl flex-col rounded-t-[2rem] bg-paper shadow-2xl transition-[transform,opacity] duration-300 ease-out sm:inset-y-6 sm:rounded-[2rem] ${
          open
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 sm:translate-y-10'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        {completed ? (
          <div className="flex min-h-[30rem] flex-1 flex-col items-center justify-center overflow-y-auto p-7 text-center sm:p-12">
            <span className="grid size-20 place-items-center rounded-full bg-mint text-ink">
              <CheckCircle2 size={38} strokeWidth={2.5} aria-hidden="true" />
            </span>
            <p className="eyebrow mt-6 text-cobalt">Pedido confirmado</p>
            <h2 className="font-display mt-2 text-3xl uppercase sm:text-4xl">
              {formatOrderNumber(completed.orderNumber)}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-ink/65">
              Seu pedido está pronto. Agora é só enviar a mensagem no WhatsApp.
            </p>
            <a
              href={completed.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="primary-button mt-7 w-full max-w-sm"
            >
              <MessageCircle size={19} aria-hidden="true" />
              Enviar pedido pelo WhatsApp
            </a>
            <button type="button" onClick={handleClose} className="secondary-button mt-3">
              Voltar ao cardápio
            </button>
          </div>
        ) : (
          <>
            <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4 sm:px-7">
              <button type="button" onClick={onBack} className="icon-button" aria-label="Voltar">
                <ArrowLeft aria-hidden="true" />
              </button>
              <div className="text-center">
                <p className="eyebrow text-tomato">Último passo</p>
                <h2 id="checkout-title" className="font-display text-xl uppercase sm:text-2xl">
                  Finalizar pedido
                </h2>
              </div>
              <button type="button" onClick={onClose} className="icon-button" aria-label="Fechar">
                <X aria-hidden="true" />
              </button>
            </header>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-5 py-6 pb-8 sm:px-7"
            >
              {hasUnavailableItems ? (
                <div className="mb-6 flex gap-3 rounded-xl border border-tomato/20 bg-tomato/10 p-3 text-xs font-bold leading-5 text-tomato">
                  <AlertCircle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
                  Há itens fora do horário no carrinho. Volte e remova esses itens para
                  finalizar o pedido.
                </div>
              ) : null}

              <fieldset>
                <legend className="field-label">Como você quer receber?</legend>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`choice-card ${
                      form.orderType === 'delivery' ? 'choice-card-selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderType"
                      value="delivery"
                      checked={form.orderType === 'delivery'}
                      onChange={() => updateField('orderType', 'delivery')}
                      className="sr-only"
                    />
                    <Bike size={22} aria-hidden="true" />
                    <span>
                      <strong>Entrega</strong>
                      <small>{STORE_CONFIG.deliveryEstimate}</small>
                    </span>
                  </label>
                  <label
                    className={`choice-card ${
                      form.orderType === 'pickup' ? 'choice-card-selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderType"
                      value="pickup"
                      checked={form.orderType === 'pickup'}
                      onChange={() => updateField('orderType', 'pickup')}
                      className="sr-only"
                    />
                    <Store size={22} aria-hidden="true" />
                    <span>
                      <strong>Retirada</strong>
                      <small>{STORE_CONFIG.pickupEstimate}</small>
                    </span>
                  </label>
                </div>
                {form.orderType === 'delivery' ? (
                  <p className="mt-3 rounded-xl bg-sun/20 px-4 py-3 text-xs font-bold leading-5 text-ink/65">
                    Pedidos para entrega recebem um acréscimo de{' '}
                    {formatCurrency(PACKAGING_FEE)} referente à embalagem.
                  </p>
                ) : null}
              </fieldset>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="field-label">Seu nome</span>
                  <input
                    className="field"
                    required
                    autoComplete="name"
                    maxLength={100}
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    placeholder="João da Silva"
                  />
                </label>
                <label>
                  <span className="field-label">WhatsApp</span>
                  <input
                    className="field"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    minLength={14}
                    value={form.phone}
                    onChange={(event) => updateField('phone', formatPhone(event.target.value))}
                    placeholder="(81) 99999-9999"
                  />
                </label>
              </div>

              {form.orderType === 'delivery' ? (
                <>
                  <AddressAutocomplete
                    active={open}
                    value={form.address}
                    onChange={(value) => updateField('address', value)}
                    onClearSelection={() => {
                      updateField('neighborhood', '')
                      setDeliveryDistanceKm(null)
                    }}
                    onSelect={selectAddress}
                  />

                  <label className="mt-5 block">
                    <span className="field-label">Bairro e taxa de entrega</span>
                    <span className="relative block">
                      <select
                        className="field appearance-none pr-11"
                        required
                        value={form.neighborhood}
                        onChange={(event) => updateField('neighborhood', event.target.value)}
                      >
                        <option value="">Selecione o bairro</option>
                        {deliveryAreas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name} — {formatCurrency(area.fee)}
                          </option>
                        ))}
                        <option value="other">
                          Outro bairro — {formatCurrency(OTHER_DELIVERY_FEE)}
                        </option>
                      </select>
                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/45"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-2 block text-xs text-ink/50">
                      Ao escolher uma sugestão, o bairro e a taxa são preenchidos
                      automaticamente. Você também pode corrigir manualmente.
                    </span>
                  </label>
                </>
              ) : null}

              <fieldset className="mt-7">
                <legend className="field-label">Forma de pagamento</legend>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <label
                      key={method}
                      className={`payment-choice ${
                        form.paymentMethod === method ? 'payment-choice-selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={form.paymentMethod === method}
                        onChange={() => updateField('paymentMethod', method)}
                        className="sr-only"
                      />
                      {method}
                    </label>
                  ))}
                </div>
              </fieldset>

              {form.paymentMethod === 'Dinheiro' ? (
                <label className="mt-5 block">
                  <span className="field-label">Precisa de troco?</span>
                  <input
                    className="field"
                    inputMode="decimal"
                    maxLength={30}
                    value={form.changeFor}
                    onChange={(event) => updateField('changeFor', event.target.value)}
                    placeholder={`Ex.: para ${formatCurrency(100)}`}
                  />
                </label>
              ) : null}

              <label className="mt-5 block">
                <span className="field-label">Observação geral (opcional)</span>
                <textarea
                  className="field min-h-24 resize-none py-3"
                  maxLength={300}
                  value={form.notes}
                  onChange={(event) => updateField('notes', event.target.value)}
                  placeholder="Alguma informação importante sobre o pedido?"
                />
              </label>

              <div className="receipt mt-7">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink/60">Subtotal</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink/60">Taxa de entrega</span>
                  <strong>
                    {form.orderType === 'pickup'
                      ? 'Grátis'
                      : form.neighborhood
                        ? formatCurrency(deliveryFee)
                        : 'Selecione o bairro'}
                  </strong>
                </div>
                {form.orderType === 'delivery' ? (
                  <>
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-ink/60">Distância estimada</span>
                      <strong>
                        {deliveryDistanceKm === null
                          ? 'Escolha um endereço'
                          : `${deliveryDistanceKm.toFixed(1)} km`}
                      </strong>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-ink/60">Embalagem</span>
                      <strong>{formatCurrency(packagingFee)}</strong>
                    </div>
                  </>
                ) : null}
                <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink/25 pt-4">
                  <span className="font-extrabold">Total</span>
                  <strong className="text-2xl">{formatCurrency(total)}</strong>
                </div>
              </div>

              <p className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-ink/50">
                <Clock3 size={14} aria-hidden="true" />
                Seus dados ficam salvos somente neste navegador.
              </p>

              <button
                type="submit"
                disabled={submitting || !canSubmit}
                className="primary-button mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MessageCircle size={19} aria-hidden="true" />
                {submitting
                  ? 'Preparando pedido…'
                  : `Enviar pedido pelo WhatsApp • ${formatCurrency(total)}`}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
