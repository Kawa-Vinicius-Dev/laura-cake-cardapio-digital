import { Clock3, Plus } from 'lucide-react'
import type { Product } from '../../domain/menu'
import { formatCurrency } from '../../shared/format'

type ProductCardProps = {
  product: Product
  available: boolean
  availabilityMessage: string
  storeClosed: boolean
  onAdd: (product: Product) => void
}

export function ProductCard({
  product,
  available,
  availabilityMessage,
  storeClosed,
  onAdd,
}: ProductCardProps) {
  const hasOptions = Boolean(product.options?.length)
  // Loja fechada: o aviso único fica no topo do cardápio; o card continua apetitoso.
  const offSchedule = !available && !storeClosed

  return (
    <article
      className={`product-card group max-[539px]:flex-row ${offSchedule ? 'product-card-disabled' : ''}`}
      data-product-id={product.id}
      data-availability={available ? 'available' : 'unavailable'}
    >
      {product.image ? (
        <div className="relative w-32 shrink-0 overflow-hidden bg-[#ddd9cb] min-[540px]:aspect-[4/3] min-[540px]:w-auto">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = '/logo-laura-cake.png'
            }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] min-[540px]:static"
          />
          {product.badge ? <span className="product-badge">{product.badge}</span> : null}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        {product.badge && !product.image ? (
          <span className="product-badge-inline">{product.badge}</span>
        ) : null}
        <h3 className="font-display text-base leading-tight uppercase text-ink min-[540px]:text-xl sm:text-lg">
          {product.name}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-sm leading-5 text-ink/65 min-[540px]:mt-2 min-[540px]:line-clamp-none min-[540px]:text-base min-[540px]:leading-6 sm:text-sm sm:leading-5">
          {product.description}
        </p>
        {offSchedule ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-extrabold text-tomato">
            <Clock3 size={14} aria-hidden="true" />
            {availabilityMessage}
          </p>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3 min-[540px]:pt-5">
          <div>
            <span className="block text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-ink/45 min-[540px]:text-xs sm:text-[0.65rem]">
              {hasOptions ? 'a partir de' : 'preço'}
            </span>
            <strong className="text-lg font-extrabold text-ink min-[540px]:text-xl sm:text-lg">
              {formatCurrency(product.price)}
            </strong>
          </div>
          {storeClosed ? null : (
            <button
              type="button"
              onClick={() => onAdd(product)}
              disabled={!available}
              className="add-button disabled:cursor-not-allowed disabled:bg-ink/25 disabled:shadow-none"
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              <Plus aria-hidden="true" size={21} strokeWidth={3} />
              <span className="max-[539px]:sr-only">
                {available ? 'Adicionar' : 'Indisponível'}
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
