import { Plus } from 'lucide-react'
import type { Product } from '../data/menu'
import { formatCurrency } from '../lib/format'

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
    <article className={`product-card group ${available ? '' : 'product-card-disabled'}`}>
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
            <span className="rounded-full bg-tomato px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.08em] shadow-lg">
              Indisponível agora
            </span>
            <span className="mt-2 max-w-56 text-xs font-bold leading-5 text-white/90">
              {availabilityMessage}
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-display text-[1.05rem] leading-tight uppercase text-ink sm:text-lg">
          {product.name}
        </h3>
        <p className="mt-2 text-sm leading-5 text-ink/65">{product.description}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <span className="block text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-ink/45">
              {hasOptions ? 'a partir de' : 'preço'}
            </span>
            <strong className="text-lg font-extrabold text-ink">
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
