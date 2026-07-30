import { Plus } from 'lucide-react'
import type { Product } from '../../domain/menu'
import { formatCurrency } from '../../shared/format'

type ProductCardProps = {
  product: Product
  available: boolean
  availabilityMessage: string
  onAdd: (product: Product) => void
}

export function ProductCard({
  product,
  available,
  availabilityMessage,
  onAdd,
}: ProductCardProps) {
  const hasOptions = Boolean(product.options?.length)

  return (
    <article
      className={`product-card group ${available ? '' : 'product-card-disabled'}`}
      data-product-id={product.id}
      data-availability={available ? 'available' : 'unavailable'}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#ddd9cb]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = '/logo-laura-cake.png'
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {product.badge ? <span className="product-badge">{product.badge}</span> : null}
        {!available ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/55 p-5 text-center text-white backdrop-blur-[1px]">
            <span className="rounded-full bg-tomato px-4 py-2 text-xs font-black uppercase tracking-[0.08em] shadow-lg sm:text-[0.68rem]">
              Indisponível agora
            </span>
            <span className="mt-2 max-w-64 text-sm font-bold leading-5 text-white/90 sm:max-w-56 sm:text-xs">
              {availabilityMessage}
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-display text-xl leading-tight uppercase text-ink sm:text-lg">
          {product.name}
        </h3>
        <p className="mt-2 text-base leading-6 text-ink/65 sm:text-sm sm:leading-5">
          {product.description}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <span className="block text-xs font-extrabold uppercase tracking-[0.12em] text-ink/45 sm:text-[0.65rem]">
              {hasOptions ? 'a partir de' : 'preço'}
            </span>
            <strong className="text-xl font-extrabold text-ink sm:text-lg">
              {formatCurrency(product.price)}
            </strong>
          </div>
          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={!available}
            className="add-button disabled:cursor-not-allowed disabled:bg-ink/25 disabled:shadow-none"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <Plus aria-hidden="true" size={21} strokeWidth={3} />
            <span>{available ? 'Adicionar' : 'Indisponível'}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
