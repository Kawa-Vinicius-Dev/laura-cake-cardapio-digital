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
export const MENU_TIMEZONE = 'America/Fortaleza'

export const STORE_HOURS = {
  openHour: 11,
  closeHour: 22,
  closedWeekdays: [0],
} as const

export const MENU_SCHEDULES: Record<ScheduleId, MenuSchedule> = {
  lunch: { startHour: 11, endHour: 15, label: 'Das 11h às 15h' },
  day: { startHour: 11, endHour: 22, label: 'Das 11h às 22h' },
  night: { startHour: 18, endHour: 22, label: 'Das 18h às 22h' },
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
  price: 2,
}

export const categories: Category[] = [
  { id: 'coxinhas', name: 'Coxinhas', scheduleId: 'day' },
  { id: 'tempura', name: 'Tempurá', scheduleId: 'day' },
  { id: 'lanches', name: 'Lanches', scheduleId: 'night' },
  { id: 'pastel-montado', name: 'Pastel montado', scheduleId: 'night' },
  { id: 'cuscuz-recheado', name: 'Cuscuz recheado', scheduleId: 'night' },
  { id: 'tapiocas-salgadas', name: 'Tapiocas salgadas', scheduleId: 'night' },
  { id: 'tapiocas-doces', name: 'Tapiocas doces', scheduleId: 'night' },
  { id: 'batata-frita', name: 'Batata frita', scheduleId: 'day' },
  { id: 'bolo-no-pote', name: 'Bolo no pote', scheduleId: 'day' },
  { id: 'mini-bolo-vulcao', name: 'Mini Bolo Vulcão', scheduleId: 'day' },
  { id: 'pratos-principais', name: 'Pratos principais', scheduleId: 'lunch' },
  { id: 'yakisoba', name: 'Yakisoba', scheduleId: 'lunch' },
  { id: 'fatias-de-bolo', name: 'Fatias de bolo', scheduleId: 'day' },
  { id: 'bebidas', name: 'Bebidas', scheduleId: 'day' },
  { id: 'sopas', name: 'Sopas' },
  { id: 'tortas', name: 'Tortas', scheduleId: 'day' },
]

export const products: Product[] = [
  {
    id: 'coxinha',
    categoryId: 'coxinhas',
    name: 'Coxinha',
    description:
      'Massa crocante com opções de recheios preparados e bem temperados.',
    price: 7,
    image: images.coxinha,
    badge: '6 recheios',
    optionLabel: 'Escolha o recheio',
    options: [
      option(
        'frango',
        'Frango',
        7,
        'Massa crocante recheada com frango bem temperado.',
      ),
      option(
        'frango-catupiry',
        'Frango com Catupiry',
        8,
        'Massa crocante recheada com frango temperado e Catupiry cremoso.',
      ),
      option(
        'frango-cheddar',
        'Frango com Cheddar',
        8,
        'Massa crocante recheada com frango temperado e cheddar cremoso.',
      ),
      option(
        'frango-cream-cheese',
        'Frango com Cream Cheese',
        10,
        'Massa crocante recheada com frango temperado e cream cheese cremoso.',
      ),
      option(
        'charque',
        'Charque',
        12,
        'Coxinha dourada e crocante, recheada com charque bem temperado.',
      ),
      option(
        'charque-cream-cheese',
        'Charque com Cream Cheese',
        14,
        'Coxinha crocante recheada com charque e cream cheese cremoso.',
      ),
    ],
  },
  {
    id: 'camarao-empanado',
    categoryId: 'tempura',
    name: 'Tempurá de Camarão',
    description:
      'Deliciosa porção de camarões empanados, dourados e crocantes, acompanhados de cream cheese.',
    price: 19.9,
    image: images.tempura,
    badge: 'Destaque',
  },
  {
    id: 'hot-dog',
    categoryId: 'lanches',
    name: 'Hot Dog',
    description:
      'Delicioso hot dog preparado na hora com pão, salsicha, molho especial, milho, ervilha, tomate, cebola, batata palha crocante, ketchup e mostarda.',
    price: 10,
    image: images.hotDog,
    addons: [homemadeMayoExtra],
  },
  {
    id: 'hamburguer',
    categoryId: 'lanches',
    name: 'Hambúrguer',
    description:
      'Hambúrguer preparado na hora com pão, deliciosa carne caseira, cebola caramelizada, salada e molho especial da casa.',
    price: 14,
    image: images.hamburguer,
    addons: [homemadeMayoExtra],
  },
  {
    id: 'x-burger',
    categoryId: 'lanches',
    name: 'X-Burger',
    description:
      'Delicioso X-Burger preparado na hora com pão, carne caseira, queijo muçarela, cebola caramelizada, salada e molho especial da casa.',
    price: 17,
    image: images.xBurger,
    addons: [homemadeMayoExtra],
  },
  {
    id: 'pastel-3-sabores',
    categoryId: 'pastel-montado',
    name: 'Pastel com até 3 sabores',
    description:
      'Pastel crocante preparado com exatamente 3 sabores, 4 acompanhamentos e 2 molhos escolhidos pelo cliente.',
    price: 10,
    image: images.pastel,
    badge: 'Monte do seu jeito',
    pastelFlavorLimit: 3,
  },
  {
    id: 'pastel-6-sabores',
    categoryId: 'pastel-montado',
    name: 'Pastel com até 6 sabores',
    description:
      'Pastel crocante preparado com exatamente 6 sabores, 4 acompanhamentos e 2 molhos escolhidos pelo cliente.',
    price: 18,
    image: images.pastel,
    badge: 'Monte do seu jeito',
    pastelFlavorLimit: 6,
  },
  {
    id: 'cuscuz-recheado',
    categoryId: 'cuscuz-recheado',
    name: 'Cuscuz recheado',
    description:
      'Cuscuz quentinho e recheado, preparado com carne e queijo coalho conforme a opção escolhida.',
    price: 16.5,
    image: images.cuscuz,
    optionLabel: 'Escolha o recheio',
    options: [
      option(
        'carne-seca-queijo',
        'Carne seca com queijo coalho',
        16.5,
        'Cuscuz quentinho recheado com carne seca e queijo coalho.',
      ),
      option(
        'carne-sol-queijo',
        'Carne de sol com queijo coalho',
        17.5,
        'Cuscuz quentinho recheado com carne de sol e queijo coalho.',
      ),
    ],
  },
  {
    id: 'tapioca-salgada',
    categoryId: 'tapiocas-salgadas',
    name: 'Tapioca salgada',
    description:
      'Tapioca preparada na hora, leve e saborosa, com o recheio escolhido pelo cliente.',
    price: 8,
    image: images.tapioca,
    optionLabel: 'Escolha o sabor',
    options: [
      option(
        'queijo',
        'Queijo',
        10,
        'Tapioca leve e quentinha, recheada com queijo.',
      ),
      option(
        'coco',
        'Coco',
        8,
        'Tapioca leve e quentinha preparada com coco.',
      ),
      option(
        'charque-queijo',
        'Charque com queijo',
        12.5,
        'Tapioca quentinha recheada com charque e queijo.',
      ),
      option(
        'carne-sol-queijo',
        'Carne de sol com queijo',
        13.5,
        'Tapioca quentinha recheada com carne de sol e queijo.',
      ),
    ],
  },
  {
    id: 'tapioca-doce',
    categoryId: 'tapiocas-doces',
    name: 'Tapioca doce',
    description:
      'Tapioca preparada na hora com uma deliciosa opção de recheio doce escolhida pelo cliente.',
    price: 12,
    image: images.tapiocaDoce,
    optionLabel: 'Escolha o sabor',
    options: [
      option(
        'romeu-julieta',
        'Romeu e Julieta',
        12,
        'Tapioca quentinha recheada com queijo e goiabada.',
      ),
      option(
        'beijinho',
        'Beijinho',
        12,
        'Tapioca preparada na hora com recheio cremoso de beijinho.',
      ),
      option(
        'chocolate',
        'Chocolate',
        12,
        'Tapioca preparada na hora com delicioso recheio de chocolate.',
      ),
    ],
  },
  {
    id: 'batata-frita',
    categoryId: 'batata-frita',
    name: 'Batata frita',
    description:
      'Porção de batatas fritas douradas e crocantes, disponível nos tamanhos pequeno, médio e grande.',
    price: 8,
    image: images.batata,
    optionLabel: 'Escolha o tamanho',
    options: [
      option(
        'pequena',
        'Pequena',
        8,
        'Porção pequena de batatas fritas douradas e crocantes.',
      ),
      option(
        'media',
        'Média',
        13,
        'Porção média de batatas fritas douradas e crocantes.',
      ),
      option(
        'grande',
        'Grande',
        16,
        'Porção grande de batatas fritas douradas e crocantes.',
      ),
    ],
  },
  {
    id: 'bolo-no-pote',
    categoryId: 'bolo-no-pote',
    name: 'Bolo no pote',
    description:
      'Camadas de bolo macio com recheio cremoso no sabor escolhido.',
    price: 10,
    image: images.boloPote,
    optionLabel: 'Escolha o sabor',
    options: [
      option(
        'chocolate',
        'Chocolate',
        10,
        'Camadas de bolo macio com recheio cremoso de chocolate.',
      ),
      option(
        'morango',
        'Morango',
        10,
        'Camadas de bolo macio com recheio cremoso de morango.',
      ),
      option(
        'delicia-abacaxi',
        'Delícia de abacaxi',
        10,
        'Camadas de bolo macio com recheio cremoso de abacaxi.',
      ),
      option(
        'red-velvet',
        'Red Velvet',
        10,
        'Camadas de bolo macio Red Velvet com recheio cremoso.',
      ),
      option(
        'prestigio',
        'Prestígio',
        10,
        'Camadas de bolo macio com recheio cremoso sabor Prestígio.',
      ),
      option(
        'kinder-bueno',
        'Kinder Bueno',
        10,
        'Camadas de bolo macio com recheio cremoso sabor Kinder Bueno.',
      ),
    ],
  },
  {
    id: 'mini-bolo-vulcao',
    categoryId: 'mini-bolo-vulcao',
    name: 'Mini Bolo Vulcão',
    description:
      'Mini bolo macio com uma generosa cobertura cremosa no sabor escolhido.',
    price: 20,
    image: images.miniBolo,
    badge: 'Destaque',
    optionLabel: 'Escolha o sabor',
    options: [
      option(
        'red-velvet-kinder',
        'Red Velvet com Kinder Bueno',
        20,
        'Mini bolo Red Velvet com cobertura cremosa e Kinder Bueno.',
      ),
      option(
        'chocolate',
        'Chocolate',
        20,
        'Mini bolo de chocolate com cobertura cremosa de chocolate.',
      ),
      option(
        'massa-branca-4-leites',
        'Massa Branca 4 Leites',
        20,
        'Mini bolo de massa branca com cobertura cremosa de quatro leites.',
      ),
    ],
  },
  {
    id: 'pratos-principais',
    categoryId: 'pratos-principais',
    name: 'Pratos principais',
    description:
      'Prato saboroso preparado para o almoço, com a receita escolhida pelo cliente.',
    price: 20,
    image: images.prato,
    optionLabel: 'Escolha o prato',
    options: [
      option(
        'frango-parmegiana',
        'Frango à Parmegiana',
        20,
        'Filé de frango empanado e crocante, coberto com molho de tomate e queijo gratinado, servido com macarrão ao molho pomodoro e batata frita ou purê de batata.',
      ),
      option(
        'frango-cubana',
        'Frango à Cubana',
        20,
        'Prato saboroso de frango preparado no estilo cubano.',
      ),
      option(
        'file-parmegiana',
        'Filé à Parmegiana',
        24,
        'Filé de carne empanado, coberto com molho de tomate e queijo gratinado, servido com macarrão ao molho pomodoro e batata frita ou purê de batata.',
      ),
      option(
        'frango-xadrez',
        'Frango Xadrez',
        24,
        'Frango em cubos com legumes e molho especial, preparado para um almoço saboroso.',
      ),
    ],
  },
  {
    id: 'yakisoba',
    categoryId: 'yakisoba',
    name: 'Yakisoba',
    description:
      'Macarrão oriental preparado com legumes, molho especial e a opção de proteína escolhida pelo cliente.',
    price: 22,
    image: images.yakisoba,
    badge: '5 opções',
    optionLabel: 'Escolha o tipo',
    options: [
      option(
        'frango',
        'Frango',
        22,
        'Macarrão oriental com frango, legumes e molho especial.',
      ),
      option(
        'carne',
        'Carne',
        24,
        'Macarrão oriental com carne, legumes e molho especial.',
      ),
      option(
        'carne-frango',
        'Carne e Frango',
        24,
        'Macarrão oriental com carne, frango, legumes e molho especial.',
      ),
      option(
        'especial',
        'Especial',
        30,
        'Yakisoba especial com macarrão oriental, legumes, molho especial e ingredientes variados.',
      ),
      option(
        'especial-2-pessoas',
        'Especial para 2 pessoas',
        50,
        'Porção especial de yakisoba para duas pessoas, preparada para compartilhar.',
      ),
    ],
  },
  {
    id: 'fatia-de-bolo',
    categoryId: 'fatias-de-bolo',
    name: 'Fatia de bolo',
    description:
      'Fatia generosa de bolo macio no sabor escolhido pelo cliente.',
    price: 12,
    image: images.bolo,
    optionLabel: 'Escolha o sabor',
    options: [
      option(
        'bolo-noiva',
        'Bolo de Noiva',
        14,
        'Fatia generosa do tradicional e saboroso Bolo de Noiva.',
      ),
      option(
        'bolo-limao',
        'Bolo de Limão',
        12,
        'Fatia de bolo macio e saboroso de limão.',
      ),
    ],
  },
  {
    id: 'coca-cola',
    categoryId: 'bebidas',
    name: 'Coca-Cola',
    description:
      'Coca-Cola gelada na versão tradicional ou zero e no tamanho escolhido.',
    price: 7,
    image: images.bebida,
    optionLabel: 'Escolha a versão',
    options: [
      option(
        'lata',
        'Coca-Cola lata',
        7,
        'Coca-Cola tradicional gelada em lata.',
      ),
      option(
        '1-litro',
        'Coca-Cola 1 litro',
        10,
        'Coca-Cola tradicional gelada em garrafa de 1 litro.',
      ),
      option(
        'zero-lata',
        'Coca-Cola Zero lata',
        7,
        'Coca-Cola Zero gelada em lata.',
      ),
      option(
        'zero-1-litro',
        'Coca-Cola Zero 1 litro',
        10,
        'Coca-Cola Zero gelada em garrafa de 1 litro.',
      ),
    ],
  },
  {
    id: 'refrigerantes',
    categoryId: 'bebidas',
    name: 'Refrigerantes',
    description:
      'Refrigerante gelado escolhido pelo cliente, com opções Kuat, Fanta ou Antarctica de 1 litro.',
    price: 7,
    image: images.bebida,
    optionLabel: 'Escolha a bebida',
    options: [
      option(
        'antarctica-1-litro',
        'Antarctica 1 litro',
        10,
        'Refrigerante Antarctica gelado em garrafa de 1 litro.',
      ),
      option('kuat', 'Kuat', 7, 'Refrigerante Kuat servido gelado.'),
      option('fanta', 'Fanta', 7, 'Refrigerante Fanta servido gelado.'),
    ],
  },
  {
    id: 'agua',
    categoryId: 'bebidas',
    name: 'Água',
    description:
      'Água mineral gelada, com ou sem gás, conforme a versão escolhida.',
    price: 4,
    image: images.bebida,
    optionLabel: 'Escolha a versão',
    options: [
      option(
        'com-gas',
        'Água com gás',
        4,
        'Água mineral com gás servida gelada.',
      ),
      option(
        'sem-gas',
        'Água sem gás',
        4,
        'Água mineral sem gás servida gelada.',
      ),
    ],
  },
  {
    id: 'sopa',
    categoryId: 'sopas',
    name: 'Sopa',
    description:
      'Sopa quentinha e bem temperada, preparada no sabor escolhido pelo cliente.',
    price: 10,
    image: images.sopa,
    optionLabel: 'Escolha o sabor',
    options: [
      option(
        'carne',
        'Carne',
        12,
        'Sopa caseira de carne, quentinha e bem temperada.',
      ),
      option(
        'brejeira',
        'Brejeira',
        12,
        'Sopa Brejeira caseira, quentinha e bem temperada.',
      ),
      option(
        'costela',
        'Costela',
        12,
        'Sopa caseira de costela, quentinha e bem temperada.',
      ),
      option(
        'canja',
        'Canja',
        10,
        'Canja caseira, quentinha e reconfortante.',
      ),
      option(
        'carne-sem-gluten',
        'Carne sem glúten',
        14,
        'Sopa caseira de carne sem glúten, quentinha e bem temperada.',
      ),
    ],
  },
  {
    id: 'torta-frango',
    categoryId: 'tortas',
    name: 'Torta de frango',
    description:
      'Fatia de torta salgada com massa macia e delicioso recheio de frango.',
    price: 13,
    image: images.torta,
  },
]
