import type {
  Category,
  DeliveryArea,
  MenuSchedule,
  Product,
  ProductAddon,
  ProductOption,
  ScheduleId,
} from '../domain/menu'

export const STORE_CONFIG = {
  name: 'Laura Cake e Sabores da Casa',
  subtitle: 'Seu pedido favorito, de um jeito simples.',
  whatsappNumber: '5581999114089',
  locale: 'pt-BR',
  currency: 'BRL',
  pickupEstimate: '20–30 min',
  deliveryEstimate: '35–50 min',
} as const

export const deliveryAreas: DeliveryArea[] = [
  { id: 'janga', name: 'Janga', fee: 5 },
  { id: 'pau-amarelo', name: 'Pau Amarelo', fee: 7 },
  { id: 'nossa-senhora-do-o', name: 'Nossa Senhora do Ó', fee: 7 },
]

export const OTHER_DELIVERY_FEE = 7
export const PACKAGING_FEE = 1
export const DELIVERY_FEE_RANGES = [
  { maxKm: 2, fee: 5 },
  { maxKm: 4, fee: 6 },
  { maxKm: 6, fee: 7 },
] as const
export const DELIVERY_ADDRESS_CONFIG = {
  state: 'PE',
  city: 'Paulista',
  originAddress: 'R. João Alfredo, 715 - Cs 2 - Janga, Paulista - PE, 53437-320',
  origin: {
    latitude: -7.9294147,
    longitude: -34.8310874,
  },
  maxRadiusKm: 6,
} as const
export const MENU_TIMEZONE = 'America/Fortaleza'

export const STORE_HOURS = {
  openHour: 11,
  closeHour: 22,
  closedWeekdays: [0],
} as const

export const MENU_SCHEDULES: Record<ScheduleId, MenuSchedule | null> = {
  lunch: { startHour: 11, endHour: 15, label: 'Das 11h às 15h' },
  day: { startHour: 11, endHour: 22, label: 'Das 11h às 22h' },
  night: { startHour: 17, endHour: 22, label: 'Das 17h às 22h' },
  soups: { startHour: 17, endHour: 22, label: 'Das 17h às 22h' },
}

export const PASTEL_OPTIONS = {
  flavors: [
    'Cheddar',
    'Catupiry',
    'Frango',
    'Queijo coalho',
    'Queijo muçarela',
    'Carne moída',
    'Presunto',
    'Bacon',
    'Calabresa',
    'Charque',
  ],
  accompaniments: [
    'Cebola',
    'Tomate',
    'Cebola caramelizada',
    'Milho e ervilha',
    'Orégano',
    'Azeitona',
    'Uva-passa',
    'Cenoura ralada',
    'Batata palha',
  ],
  sauces: ['Mostarda', 'Ketchup', 'Maionese caseira', 'Mostarda e mel'],
} as const

const images = {
  coxinha: '/products/category-coxinhas.png',
  tempura: '/products/product-tempura-camarao.png',
  hotDog: '/products/product-hot-dog.png',
  hamburguer: '/products/product-hamburguer.png',
  xBurger: '/products/product-x-burger.png',
  pastel: '/products/category-pastel.png',
  cuscuz: '/products/category-cuscuz.png',
  tapioca: '/products/category-tapioca-salgada.png',
  tapiocaDoce: '/products/category-tapioca-doce.png',
  batata: '/products/category-batata.png',
  boloPote: '/products/category-bolo-pote.png',
  miniBolo: '/products/mini-bolo-red-velvet-kinder.png',
  prato: '/products/category-pratos.png',
  yakisoba: '/products/category-yakisoba.png',
  bolo: '/products/category-fatias-bolo.png',
  bebida: '/products/category-bebidas.png',
  sopa: '/products/category-sopas.png',
  torta: '/products/category-torta.png',
} as const

const option = (
  id: string,
  name: string,
  price: number,
  description: string,
): ProductOption => ({ id, name, price, description })

const homemadeMayoExtra: ProductAddon = {
  id: 'maionese-caseira-extra',
  name: 'Maionese caseira extra',
  price: 1.9,
}

const beansExtra: ProductAddon = {
  id: 'feijao-extra',
  name: 'Feijão',
  price: 6.9,
}

export const categories: Category[] = [
  {
    id: 'lanches-e-salgados',
    name: 'Lanches e Salgados',
    productIds: [
      'hot-dog',
      'hamburguer',
      'x-burger',
      'coxinha',
      'camarao-empanado',
      'pastel-3-sabores',
      'pastel-6-sabores',
      'batata-frita',
    ],
  },
  {
    id: 'refeicoes',
    name: 'Refeições',
    productIds: ['pratos-principais', 'yakisoba', 'sopa'],
  },
  {
    id: 'cuscuz-e-tapiocas',
    name: 'Cuscuz e Tapiocas',
    productIds: ['cuscuz-recheado', 'tapioca-salgada', 'tapioca-doce'],
  },
  {
    id: 'doces',
    name: 'Doces',
    productIds: [
      'bolo-no-pote',
      'mini-bolo-vulcao',
      'fatia-de-bolo',
      'torta-frango',
    ],
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    productIds: ['coca-cola', 'refrigerantes', 'agua'],
  },
]

export const products: Product[] = [
  {
    id: 'coxinha',
    scheduleId: 'day',
    name: 'Coxinha',
    description:
      'Massa crocante com opções de recheios preparados e bem temperados.',
    price: 6.9,
    image: images.coxinha,
    badge: '6 recheios',
    optionLabel: 'Escolha o recheio',
    options: [
      option(
        'frango',
        'Frango',
        6.9,
        'Massa crocante recheada com frango bem temperado.',
      ),
      option(
        'frango-catupiry',
        'Frango com Catupiry',
        7.9,
        'Massa crocante recheada com frango temperado e Catupiry cremoso.',
      ),
      option(
        'frango-cheddar',
        'Frango com Cheddar',
        7.9,
        'Massa crocante recheada com frango temperado e cheddar cremoso.',
      ),
      option(
        'frango-cream-cheese',
        'Frango com Cream Cheese',
        9.9,
        'Massa crocante recheada com frango temperado e cream cheese cremoso.',
      ),
      option(
        'charque',
        'Charque',
        11.9,
        'Coxinha dourada e crocante, recheada com charque bem temperado.',
      ),
      option(
        'charque-cream-cheese',
        'Charque com Cream Cheese',
        13.9,
        'Coxinha crocante recheada com charque e cream cheese cremoso.',
      ),
    ],
  },
  {
    id: 'camarao-empanado',
    scheduleId: 'day',
    name: 'Tempurá de Camarão',
    description:
      'Deliciosa porção de camarões empanados, dourados e crocantes, acompanhados de cream cheese.',
    price: 19.8,
    image: images.tempura,
    badge: 'Destaque',
  },
  {
    id: 'hot-dog',
    scheduleId: 'night',
    name: 'Hot Dog',
    description:
      'Delicioso hot dog preparado na hora com pão, salsicha, molho especial, milho, ervilha, tomate, cebola, batata palha crocante, ketchup e mostarda.',
    price: 9.9,
    image: images.hotDog,
    addons: [homemadeMayoExtra],
  },
  {
    id: 'hamburguer',
    scheduleId: 'night',
    name: 'Hambúrguer',
    description:
      'Hambúrguer preparado na hora com pão, deliciosa carne caseira, cebola caramelizada, salada e molho especial da casa.',
    price: 13.9,
    image: images.hamburguer,
    addons: [homemadeMayoExtra],
  },
  {
    id: 'x-burger',
    scheduleId: 'night',
    name: 'X-Burger',
    description:
      'Delicioso X-Burger preparado na hora com pão, carne caseira, queijo muçarela, cebola caramelizada, salada e molho especial da casa.',
    price: 16.9,
    image: images.xBurger,
    addons: [homemadeMayoExtra],
  },
  {
    id: 'pastel-3-sabores',
    scheduleId: 'night',
    name: 'Pastel Montado — até 3 sabores',
    description:
      'Pastel crocante preparado com exatamente 3 sabores, 4 acompanhamentos e 2 molhos escolhidos pelo cliente.',
    price: 9.9,
    image: images.pastel,
    badge: 'Monte do seu jeito',
    pastelFlavorLimit: 3,
  },
  {
    id: 'pastel-6-sabores',
    scheduleId: 'night',
    name: 'Pastel Montado — até 6 sabores',
    description:
      'Pastel crocante preparado com exatamente 6 sabores, 4 acompanhamentos e 2 molhos escolhidos pelo cliente.',
    price: 17.9,
    image: images.pastel,
    badge: 'Monte do seu jeito',
    pastelFlavorLimit: 6,
  },
  {
    id: 'cuscuz-recheado',
    scheduleId: 'night',
    name: 'Cuscuz Recheado',
    description:
      'Cuscuz quentinho e recheado, preparado com carne e queijo coalho conforme a opção escolhida.',
    price: 16.4,
    image: images.cuscuz,
    optionLabel: 'Escolha o recheio',
    options: [
      option(
        'carne-seca-queijo',
        'Carne seca com queijo coalho',
        16.4,
        'Cuscuz quentinho recheado com carne seca e queijo coalho.',
      ),
      option(
        'carne-sol-queijo',
        'Carne de sol com queijo coalho',
        17.4,
        'Cuscuz quentinho recheado com carne de sol e queijo coalho.',
      ),
    ],
  },
  {
    id: 'tapioca-salgada',
    scheduleId: 'night',
    name: 'Tapioca Salgada',
    description:
      'Tapioca preparada na hora, leve e saborosa, com o recheio escolhido pelo cliente.',
    price: 7.9,
    image: images.tapioca,
    optionLabel: 'Escolha o sabor',
    options: [
      option(
        'queijo',
        'Queijo',
        9.9,
        'Tapioca leve e quentinha, recheada com queijo.',
      ),
      option(
        'coco',
        'Coco',
        7.9,
        'Tapioca leve e quentinha preparada com coco.',
      ),
      option(
        'charque-queijo',
        'Charque com queijo',
        12.4,
        'Tapioca quentinha recheada com charque e queijo.',
      ),
      option(
        'carne-sol-queijo',
        'Carne de sol com queijo',
        13.4,
        'Tapioca quentinha recheada com carne de sol e queijo.',
      ),
    ],
  },
  {
    id: 'tapioca-doce',
    scheduleId: 'night',
    name: 'Tapioca Doce',
    description:
      'Tapioca preparada na hora com uma deliciosa opção de recheio doce escolhida pelo cliente.',
    price: 11.9,
    image: images.tapiocaDoce,
    optionLabel: 'Escolha o sabor',
    options: [
      option(
        'romeu-julieta',
        'Romeu e Julieta',
        11.9,
        'Tapioca quentinha recheada com queijo e goiabada.',
      ),
      option(
        'beijinho',
        'Beijinho',
        11.9,
        'Tapioca preparada na hora com recheio cremoso de beijinho.',
      ),
      option(
        'chocolate',
        'Chocolate',
        11.9,
        'Tapioca preparada na hora com delicioso recheio de chocolate.',
      ),
    ],
  },
  {
    id: 'batata-frita',
    scheduleId: 'day',
    name: 'Batata Frita',
    description:
      'Porção de batatas fritas douradas e crocantes, disponível nos tamanhos pequeno, médio e grande.',
    price: 7.9,
    image: images.batata,
    optionLabel: 'Escolha o tamanho',
    options: [
      option(
        'pequena',
        'Pequena',
        7.9,
        'Porção pequena de batatas fritas douradas e crocantes.',
      ),
      option(
        'media',
        'Média',
        12.9,
        'Porção média de batatas fritas douradas e crocantes.',
      ),
      option(
        'grande',
        'Grande',
        15.9,
        'Porção grande de batatas fritas douradas e crocantes.',
      ),
    ],
  },
  {
    id: 'bolo-no-pote',
    scheduleId: 'day',
    name: 'Bolo no Pote',
    description:
      'Camadas de bolo macio com recheio cremoso no sabor escolhido.',
    price: 9.9,
    image: images.boloPote,
    optionLabel: 'Escolha o sabor',
    options: [
      option(
        'chocolate',
        'Chocolate',
        9.9,
        'Camadas de bolo macio com recheio cremoso de chocolate.',
      ),
      option(
        'morango',
        'Morango',
        9.9,
        'Camadas de bolo macio com recheio cremoso de morango.',
      ),
      option(
        'delicia-abacaxi',
        'Delícia de abacaxi',
        9.9,
        'Camadas de bolo macio com recheio cremoso de abacaxi.',
      ),
      option(
        'red-velvet',
        'Red Velvet',
        9.9,
        'Camadas de bolo macio Red Velvet com recheio cremoso.',
      ),
      option(
        'prestigio',
        'Prestígio',
        9.9,
        'Camadas de bolo macio com recheio cremoso sabor Prestígio.',
      ),
      option(
        'kinder-bueno',
        'Kinder Bueno',
        9.9,
        'Camadas de bolo macio com recheio cremoso sabor Kinder Bueno.',
      ),
    ],
  },
  {
    id: 'mini-bolo-vulcao',
    scheduleId: 'day',
    name: 'Mini Bolo Vulcão',
    description:
      'Mini bolo macio com uma generosa cobertura cremosa no sabor escolhido.',
    price: 19.9,
    image: images.miniBolo,
    badge: 'Destaque',
    optionLabel: 'Escolha o sabor',
    options: [
      option(
        'red-velvet-kinder',
        'Red Velvet com Kinder Bueno',
        19.9,
        'Mini bolo Red Velvet com cobertura cremosa e Kinder Bueno.',
      ),
      option(
        'chocolate',
        'Chocolate',
        19.9,
        'Mini bolo de chocolate com cobertura cremosa de chocolate.',
      ),
      option(
        'massa-branca-4-leites',
        'Massa Branca 4 Leites',
        19.9,
        'Mini bolo de massa branca com cobertura cremosa de quatro leites.',
      ),
    ],
  },
  {
    id: 'pratos-principais',
    scheduleId: 'day',
    name: 'Pratos Principais',
    description:
      'Prato saboroso preparado para o almoço, com a receita escolhida pelo cliente.',
    price: 19.9,
    image: images.prato,
    optionLabel: 'Escolha o prato',
    addons: [beansExtra],
    options: [
      option(
        'frango-parmegiana',
        'Frango à Parmegiana',
        19.9,
        'Filé de frango empanado e crocante, coberto com molho de tomate e queijo gratinado, servido com macarrão ao molho pomodoro e batata frita ou purê de batata.',
      ),
      option(
        'frango-cubana',
        'Frango à Cubana',
        19.9,
        'Prato saboroso de frango preparado no estilo cubano.',
      ),
      option(
        'file-parmegiana',
        'Filé à Parmegiana',
        23.9,
        'Filé de carne empanado, coberto com molho de tomate e queijo gratinado, servido com macarrão ao molho pomodoro e batata frita ou purê de batata.',
      ),
      option(
        'frango-xadrez',
        'Frango Xadrez',
        23.9,
        'Frango em cubos com legumes e molho especial, preparado para um almoço saboroso.',
      ),
      option(
        'carne-de-sol',
        'Carne de Sol',
        22.9,
        'Carne de sol acompanhada de feijão, arroz, macarrão e macaxeira frita.',
      ),
    ],
  },
  {
    id: 'yakisoba',
    scheduleId: 'day',
    name: 'Yakisoba',
    description:
      'Macarrão oriental preparado com legumes, molho especial e a opção de proteína escolhida pelo cliente.',
    price: 21.9,
    image: images.yakisoba,
    badge: '5 opções',
    optionLabel: 'Escolha o tipo',
    options: [
      option(
        'frango',
        'Frango',
        21.9,
        'Macarrão oriental com frango, legumes e molho especial.',
      ),
      option(
        'carne',
        'Carne',
        23.9,
        'Macarrão oriental com carne, legumes e molho especial.',
      ),
      option(
        'carne-frango',
        'Carne e Frango',
        23.9,
        'Macarrão oriental com carne, frango, legumes e molho especial.',
      ),
      option(
        'especial',
        'Especial',
        29.9,
        'Yakisoba especial com macarrão oriental, legumes, molho especial e ingredientes variados.',
      ),
      option(
        'especial-2-pessoas',
        'Especial para 2 pessoas',
        49.9,
        'Porção especial de yakisoba para duas pessoas, preparada para compartilhar.',
      ),
    ],
  },
  {
    id: 'fatia-de-bolo',
    scheduleId: 'day',
    name: 'Fatias de Bolo',
    description:
      'Fatia generosa de bolo macio no sabor escolhido pelo cliente.',
    price: 11.9,
    image: images.bolo,
    optionLabel: 'Escolha o sabor',
    options: [
      option(
        'bolo-noiva',
        'Bolo de Noiva',
        13.9,
        'Fatia generosa do tradicional e saboroso Bolo de Noiva.',
      ),
      option(
        'bolo-limao',
        'Bolo de Limão',
        11.9,
        'Fatia de bolo macio e saboroso de limão.',
      ),
    ],
  },
  {
    id: 'coca-cola',
    scheduleId: 'day',
    name: 'Coca-Cola',
    description:
      'Coca-Cola gelada na versão tradicional ou zero e no tamanho escolhido.',
    price: 6.9,
    image: images.bebida,
    optionLabel: 'Escolha a versão',
    options: [
      option(
        'lata',
        'Coca-Cola lata',
        6.9,
        'Coca-Cola tradicional gelada em lata.',
      ),
      option(
        '1-litro',
        'Coca-Cola 1 litro',
        9.9,
        'Coca-Cola tradicional gelada em garrafa de 1 litro.',
      ),
      option(
        'zero-lata',
        'Coca-Cola Zero lata',
        6.9,
        'Coca-Cola Zero gelada em lata.',
      ),
      option(
        'zero-1-litro',
        'Coca-Cola Zero 1 litro',
        9.9,
        'Coca-Cola Zero gelada em garrafa de 1 litro.',
      ),
    ],
  },
  {
    id: 'refrigerantes',
    scheduleId: 'day',
    name: 'Outros Refrigerantes',
    description:
      'Refrigerante gelado escolhido pelo cliente, com opções Kuat, Fanta ou Antarctica de 1 litro.',
    price: 6.9,
    image: images.bebida,
    optionLabel: 'Escolha a bebida',
    options: [
      option(
        'antarctica-1-litro',
        'Antarctica 1 litro',
        9.9,
        'Refrigerante Antarctica gelado em garrafa de 1 litro.',
      ),
      option('kuat', 'Kuat', 6.9, 'Refrigerante Kuat servido gelado.'),
      option('fanta', 'Fanta', 6.9, 'Refrigerante Fanta servido gelado.'),
    ],
  },
  {
    id: 'agua',
    scheduleId: 'day',
    name: 'Água',
    description:
      'Água mineral gelada, com ou sem gás, conforme a versão escolhida.',
    price: 3.9,
    image: images.bebida,
    optionLabel: 'Escolha a versão',
    options: [
      option(
        'com-gas',
        'Água com gás',
        3.9,
        'Água mineral com gás servida gelada.',
      ),
      option(
        'sem-gas',
        'Água sem gás',
        3.9,
        'Água mineral sem gás servida gelada.',
      ),
    ],
  },
  {
    id: 'sopa',
    scheduleId: 'soups',
    name: 'Sopas',
    description:
      'Sopa quentinha e bem temperada, preparada no sabor escolhido pelo cliente.',
    price: 9.9,
    image: images.sopa,
    optionLabel: 'Escolha o sabor',
    options: [
      option(
        'carne',
        'Carne',
        11.9,
        'Sopa caseira de carne, quentinha e bem temperada.',
      ),
      option(
        'brejeira',
        'Brejeira',
        11.9,
        'Sopa Brejeira caseira, quentinha e bem temperada.',
      ),
      option(
        'costela',
        'Costela',
        11.9,
        'Sopa caseira de costela, quentinha e bem temperada.',
      ),
      option(
        'canja',
        'Canja',
        9.9,
        'Canja caseira, quentinha e reconfortante.',
      ),
      option(
        'carne-sem-gluten',
        'Carne sem glúten',
        13.9,
        'Sopa caseira de carne sem glúten, quentinha e bem temperada.',
      ),
    ],
  },
  {
    id: 'torta-frango',
    scheduleId: 'day',
    name: 'Torta de Frango',
    description:
      'Fatia de torta salgada com massa macia e delicioso recheio de frango.',
    price: 12.9,
    image: images.torta,
  },
]
