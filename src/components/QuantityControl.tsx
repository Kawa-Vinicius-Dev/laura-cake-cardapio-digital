import { Minus, Plus } from 'lucide-react'

type QuantityControlProps = {
  quantity: number
  label: string
  onDecrease: () => void
  onIncrease: () => void
}

export function QuantityControl({
  quantity,
  label,
  onDecrease,
  onIncrease,
}: QuantityControlProps) {
  return (
    <div className="flex items-center rounded-full border border-ink/15 bg-paper p-1">
      <button
        type="button"
        onClick={onDecrease}
        className="quantity-button"
        aria-label={`Diminuir quantidade de ${label}`}
      >
        <Minus aria-hidden="true" size={15} strokeWidth={2.5} />
      </button>
      <span className="min-w-8 text-center text-sm font-extrabold" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className="quantity-button"
        aria-label={`Aumentar quantidade de ${label}`}
      >
        <Plus aria-hidden="true" size={15} strokeWidth={2.5} />
      </button>
    </div>
  )
}
