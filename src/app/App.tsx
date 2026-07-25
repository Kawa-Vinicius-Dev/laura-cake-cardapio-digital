import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bike,
  ChevronDown,
  Clock3,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { CartDrawer } from '../features/cart/CartDrawer'
import { getCartItemUnitPrice } from '../features/cart/cart-calculations'
import { CheckoutModal } from '../features/checkout/CheckoutModal'
import { PastelCustomizer } from '../features/menu/PastelCustomizer'
import { ProductCard } from '../features/menu/ProductCard'
import { ProductCustomizer } from '../features/menu/ProductCustomizer'
import {
  getProductAvailability,
  getStoreAvailability,
  orderProductsByAvailability,
} from '../features/menu/availability'
import { STORE_CONFIG, categories, deliveryAreas, products } from '../data/menu'
import type { Category, Product, ProductOption } from '../domain/menu'
import type {
  CartAddonSelection,
  CartItem,
  PastelCustomization,
} from '../domain/order'
import { loadCart, saveCart } from '../services/storage'
import { formatCurrency } from '../shared/format'

type CategorySectionProps = {
  category: Category & { products: Product[] }
  currentTime: Date
  onActivate: (categoryId: string) => void
  onAdd: (product: Product) => void
}

function CategorySection({
  category,
  currentTime,
  onActivate,
  onAdd,
}: CategorySectionProps) {
  const orderedProducts = useMemo(
    () => orderProductsByAvailability(category.products, currentTime),
    [category.products, currentTime],
  )
  const availableCount = orderedProducts.filter(
    ({ availability }) => availability.available,
  ).length
  const categoryStatus =
    availableCount > 0
      ? `${availableCount} ${
          availableCount === 1 ? 'item disponível' : 'itens disponíveis'
        } agora`
      : orderedProducts[0]?.availability.message ?? 'Nenhum item disponível agora'

  return (
    <section
      id={category.id}
      data-category-id={category.id}
      className="scroll-mt-24"
      onMouseEnter={() => onActivate(category.id)}
    >
      <div className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
        <h2 className="font-display text-2xl uppercase sm:text-3xl">
          {category.name}
        </h2>
        <span className="hidden h-px min-w-8 flex-1 bg-ink/15 sm:block" />
        <span
          className={`rounded-full px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.06em] ${
            availableCount > 0
              ? 'bg-mint/45 text-ink/65'
              : 'bg-tomato/10 text-tomato'
          }`}
        >
          {categoryStatus}
        </span>
        <span className="text-xs font-extrabold text-ink/40">
          {String(category.products.length).padStart(2, '0')}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 min-[540px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {orderedProducts.map(({ product, availability: productAvailability }) => (
          <ProductCard
            key={product.id}
            product={product}
            available={productAvailability.available}
            availabilityMessage={productAvailability.message}
            onAdd={onAdd}
          />
        ))}
      </div>
    </section>
  )
}

const productById = new Map(products.map((product) => [product.id, product]))
const groupedProducts = categories.map((category) => ({
  ...category,
  products: category.productIds.flatMap((productId) => {
    const product = productById.get(productId)
    return product ? [product] : []
  }),
}))

const getPastelItemId = (
  product: Product,
  customization: PastelCustomization,
) => {
  const normalize = (values: string[]) => [...values].sort().join(',')
  return [
    product.id,
    normalize(customization.flavors),
    normalize(customization.accompaniments),
    normalize(customization.sauces),
  ].join(':')
}

const getConfiguredItemId = (
  product: Product,
  selectedOption: ProductOption | undefined,
  selectedAddons: CartAddonSelection[],
) => {
  const addonsKey = [...selectedAddons]
    .sort((first, second) => first.addon.id.localeCompare(second.addon.id))
    .map((selection) => `${selection.addon.id}-${selection.quantity}`)
    .join(',')
  return [product.id, selectedOption?.id ?? 'padrao', addonsKey].join(':')
}

function App() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id)
  const [cart, setCart] = useState<CartItem[]>(loadCart)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [pastelToCustomize, setPastelToCustomize] = useState<Product | null>(null)
  const [productToCustomize, setProductToCustomize] = useState<Product | null>(null)
  const [toast, setToast] = useState('')
  const [currentTime, setCurrentTime] = useState(() => new Date())

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce(
    (total, item) => total + getCartItemUnitPrice(item) * item.quantity,
    0,
  )
  const unavailableItemIds = cart
    .filter((item) => !getProductAvailability(item.product, currentTime).available)
    .map((item) => item.id)
  const storeAvailability = getStoreAvailability(currentTime)

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 2200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(new Date()), 30_000)
    return () => window.clearInterval(interval)
  }, [])

  const addProduct = (product: Product) => {
    const availability = getProductAvailability(product, new Date())
    if (!availability.available) {
      setToast(availability.message)
      return
    }

    if (product.pastelFlavorLimit) {
      setPastelToCustomize(product)
      return
    }

    setProductToCustomize(product)
  }

  const addConfiguredProduct = (
    product: Product,
    selectedOption: ProductOption | undefined,
    quantity: number,
    selectedAddons: CartAddonSelection[],
  ) => {
    const availability = getProductAvailability(product, new Date())
    if (!availability.available) {
      setToast(availability.message)
      return
    }

    const itemId = getConfiguredItemId(
      product,
      selectedOption,
      selectedAddons,
    )
    setCart((current) => {
      const existing = current.find((item) => item.id === itemId)
      if (existing) {
        return current.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }

      return [
        ...current,
        {
          id: itemId,
          product,
          selectedOption,
          selectedAddons,
          quantity,
          notes: '',
        },
      ]
    })
    setToast(
      `${quantity}x ${product.name}${
        selectedOption ? ` • ${selectedOption.name}` : ''
      } adicionado`,
    )
  }

  const addCustomizedPastel = (
    product: Product,
    customization: PastelCustomization,
    quantity: number,
  ) => {
    const availability = getProductAvailability(product, new Date())
    if (!availability.available) {
      setToast(availability.message)
      return
    }

    const itemId = getPastelItemId(product, customization)
    setCart((current) => {
      const existing = current.find((item) => item.id === itemId)
      if (existing) {
        return current.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }

      return [
        ...current,
        {
          id: itemId,
          product,
          quantity,
          notes: '',
          customization,
        },
      ]
    })
    setToast(`${quantity}x ${product.name} adicionado`)
  }

  const changeQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      setCart((current) => current.filter((item) => item.id !== itemId))
      return
    }
    setCart((current) =>
      current.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
    )
  }

  const changeNotes = (itemId: string, notes: string) => {
    setCart((current) =>
      current.map((item) => (item.id === itemId ? { ...item, notes } : item)),
    )
  }

  const openCheckout = () => {
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  const backToCart = () => {
    setCheckoutOpen(false)
    setCartOpen(true)
  }

  const completeOrder = () => {
    setCart([])
  }

  const scrollToMenu = () => {
    document.getElementById('cardapio')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper text-ink">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-3 text-white" aria-label="Início">
            <span className="brand-logo">
              <img
                src="/logo-laura-cake.png"
                alt="Laura Cake & Sabores da Casa"
                className="h-full w-full object-cover"
              />
            </span>
            <span className="hidden font-extrabold leading-tight sm:block">
              Laura Cake e
              <br />
              Sabores da Casa
            </span>
          </a>
          <button type="button" onClick={() => setCartOpen(true)} className="header-cart">
            <ShoppingBag size={19} aria-hidden="true" />
            <span className="hidden sm:inline">Carrinho</span>
            <span className="grid size-6 place-items-center rounded-full bg-sun text-xs font-black text-ink">
              {cartCount}
            </span>
          </button>
        </div>
      </header>

      <main>
        <section className="brand-hero relative overflow-hidden pt-28 text-white">
          <div className="hero-dots absolute inset-y-0 right-0 w-1/2 opacity-10" />
          <div className="relative mx-auto grid min-h-[42rem] max-w-7xl items-center gap-10 px-4 pb-16 sm:px-6 lg:min-h-[45rem] lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-20">
            <div className="relative z-10 max-w-2xl pt-7 lg:pt-0">
              <div
                className={`mb-7 inline-flex rotate-[-2deg] items-center gap-2 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] shadow-[5px_5px_0_#101116] ${
                  storeAvailability.available
                    ? 'bg-sun text-ink'
                    : 'bg-white text-tomato'
                }`}
              >
                {storeAvailability.available ? (
                  <Sparkles size={15} aria-hidden="true" />
                ) : (
                  <Clock3 size={15} aria-hidden="true" />
                )}
                {storeAvailability.available
                  ? 'Aberto para matar sua fome'
                  : 'Loja fechada'}
              </div>
              <p className="eyebrow mb-3 text-white/65">Cardápio digital</p>
              <h1 className="max-w-xl">
                <span className="sr-only">Laura Cake e Sabores da Casa</span>
                <img
                  src="/logo-laura-cake.png"
                  alt=""
                  className="hero-brand-art"
                />
              </h1>
              <p className="mt-7 max-w-lg text-base font-medium leading-7 text-white/78 sm:text-lg">
                {STORE_CONFIG.subtitle} Escolha, monte seu pedido e chame a gente no
                WhatsApp.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={scrollToMenu} className="hero-button">
                  Ver o cardápio
                  <ArrowRight size={19} aria-hidden="true" />
                </button>
                <div className="flex items-center gap-3 px-1 py-2 text-sm text-white/75 sm:px-4">
                  <Clock3 size={18} className="text-sun" aria-hidden="true" />
                  {storeAvailability.available
                    ? `Entrega em ${STORE_CONFIG.deliveryEstimate}`
                    : storeAvailability.message}
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl pb-5 lg:pb-0">
              <div className="absolute -left-2 top-7 z-10 rotate-[-8deg] bg-tomato px-4 py-3 font-display text-sm uppercase shadow-[5px_5px_0_#101116] sm:left-0 sm:text-base">
                Feito na hora!
              </div>
              <div className="hero-image-wrap">
                <img
                  src={products[0].image}
                  alt="Coxinha preparada pela Laura Cake e Sabores da Casa"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-3 right-2 z-10 rounded-2xl bg-white p-4 text-ink shadow-xl sm:right-0 sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-mint">
                    <Bike size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.13em] text-ink/45">
                      Taxa de entrega
                    </p>
                    <strong>
                      A partir de {formatCurrency(deliveryAreas[0].fee)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={scrollToMenu}
            className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-white/60 lg:block"
            aria-label="Ir para o cardápio"
          >
            <ChevronDown className="animate-bounce" aria-hidden="true" />
          </button>
        </section>

        <section className="border-b border-ink/10 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-ink/10 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div className="flex items-center justify-center gap-3 py-5 text-sm font-bold sm:justify-start">
              <MapPin size={18} className="text-tomato" aria-hidden="true" />
              Entrega e retirada
            </div>
            <div className="flex items-center justify-center gap-3 py-5 text-sm font-bold">
              <MessageCircle size={18} className="text-cobalt" aria-hidden="true" />
              Pedido pelo WhatsApp
            </div>
            <div className="hidden items-center justify-end gap-3 py-5 text-sm font-bold lg:flex">
              <Clock3 size={18} className="text-tomato" aria-hidden="true" />
              Tudo feito na hora
            </div>
          </div>
        </section>

        <section id="cardapio" className="scroll-mt-4 py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow text-tomato">Escolha o seu</p>
                <h2 className="font-display mt-2 text-4xl uppercase tracking-[-0.04em] sm:text-5xl">
                  Nosso cardápio
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-ink/60">
                Salgados, lanches, pratos, doces e bebidas preparados para todos os
                momentos.
              </p>
            </div>

            <nav
              className="hide-scrollbar sticky top-0 z-30 -mx-4 mt-8 flex gap-2 overflow-x-auto border-y border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur sm:mx-0 sm:mt-10 sm:border sm:px-3"
              aria-label="Categorias do cardápio"
            >
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  onClick={() => setActiveCategory(category.id)}
                  className={`category-pill ${
                    activeCategory === category.id ? 'category-pill-active' : ''
                  }`}
                >
                  {category.name}
                </a>
              ))}
            </nav>

            <div className="mt-12 space-y-16 sm:mt-16">
              {groupedProducts.map((category) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  currentTime={currentTime}
                  onActivate={setActiveCategory}
                  onAdd={addProduct}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-ink px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <img
              src="/logo-laura-cake.png"
              alt="Laura Cake & Sabores da Casa"
              className="mb-5 size-28 rounded-2xl border border-white/20 object-cover shadow-lg"
            />
            <h2 className="font-display text-2xl uppercase">{STORE_CONFIG.name}</h2>
            <p className="mt-2 text-sm text-white/55">{STORE_CONFIG.subtitle}</p>
          </div>
          <div className="space-y-2 sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
              Cardápio digital • {new Date().getFullYear()}
            </p>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
              Desenvolvido pela <span className="text-sun">ANAIV</span>
            </p>
          </div>
        </div>
      </footer>

      {cartCount > 0 && !cartOpen && !checkoutOpen ? (
        <div className="fixed bottom-0 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 pb-[max(.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="mobile-cart-bar"
            aria-label={`Abrir carrinho com ${cartCount} ${
              cartCount === 1 ? 'item' : 'itens'
            } no valor de ${formatCurrency(subtotal)}`}
          >
            <span className="grid size-9 place-items-center rounded-full bg-sun text-sm font-black text-ink">
              <ShoppingBag size={18} aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm">
              <strong>Carrinho</strong>
              <span className="text-white/45">•</span>
              <span className="truncate">
                {cartCount} {cartCount === 1 ? 'item' : 'itens'}
              </span>
              <span className="text-white/45">•</span>
              <strong className="ml-auto shrink-0">{formatCurrency(subtotal)}</strong>
            </span>
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <CartDrawer
        open={cartOpen}
        items={cart}
        subtotal={subtotal}
        unavailableItemIds={unavailableItemIds}
        onClose={() => setCartOpen(false)}
        onQuantityChange={changeQuantity}
        onNotesChange={changeNotes}
        onRemove={(itemId) =>
          setCart((current) => current.filter((item) => item.id !== itemId))
        }
        onCheckout={openCheckout}
      />

      <PastelCustomizer
        open={Boolean(pastelToCustomize)}
        product={pastelToCustomize}
        onClose={() => setPastelToCustomize(null)}
        onAdd={addCustomizedPastel}
      />

      <ProductCustomizer
        open={Boolean(productToCustomize)}
        product={productToCustomize}
        onClose={() => setProductToCustomize(null)}
        onAdd={addConfiguredProduct}
      />

      <CheckoutModal
        open={checkoutOpen}
        items={cart}
        subtotal={subtotal}
        hasUnavailableItems={unavailableItemIds.length > 0}
        onBack={backToCart}
        onClose={() => setCheckoutOpen(false)}
        onCompleted={completeOrder}
      />

      <div
        className={`fixed left-1/2 top-5 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-xl transition-all ${
          toast ? 'translate-y-0 opacity-100' : '-translate-y-4 pointer-events-none opacity-0'
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="size-2 rounded-full bg-mint" />
        {toast}
      </div>
    </div>
  )
}

export default App
