# Laura Cake — Cardápio Digital

Cardápio online responsivo para consultar produtos, personalizar itens, montar
o carrinho e enviar o pedido diretamente para o WhatsApp.

O projeto não utiliza banco de dados. Carrinho, dados do cliente e a sequência
local do pedido ficam somente no navegador do cliente.

## Recursos

- disponibilidade de produtos por dia e horário;
- opções, adicionais e personalização de pastéis;
- carrinho persistente no navegador;
- entrega ou retirada;
- taxas de entrega configuráveis por bairro;
- taxa fixa de embalagem de R$ 1,00 somente para entrega;
- resumo completo com subtotal, taxas e total;
- envio do pedido pronto para o WhatsApp.

## Tecnologias

- React 19;
- TypeScript;
- Vite;
- Tailwind CSS;
- Lucide React;
- WhatsApp.

## Executar localmente

Requisitos: Node.js `20.19+` ou `22.12+` e npm.

```bash
npm install
npm run dev
```

O Vite exibirá o endereço local, normalmente `http://localhost:5173`.

Não é necessário criar arquivo `.env` nem configurar serviços externos.

## Configuração do cardápio

As configurações ficam em [`src/data/menu.ts`](./src/data/menu.ts):

| Configuração | Responsabilidade |
| --- | --- |
| `STORE_CONFIG` | Nome, WhatsApp e estimativas |
| `STORE_HOURS` | Dias e horário geral da loja |
| `MENU_TIMEZONE` | Fuso das regras de disponibilidade |
| `MENU_SCHEDULES` | Horários específicos dos produtos |
| `deliveryAreas` | Bairros e taxas de entrega |
| `OTHER_DELIVERY_FEE` | Taxa para outros bairros |
| `PACKAGING_FEE` | Embalagem cobrada nos pedidos de entrega |
| `PASTEL_OPTIONS` | Sabores, acompanhamentos e molhos |
| `categories` | Categorias exibidas |
| `products` | Produtos, preços, fotos, opções e adicionais |

Os valores definidos no arquivo são os preços finais mostrados ao cliente. Por
exemplo, `22.9` é exibido como `R$ 22,90`.

## Disponibilidade

- loja: segunda a sábado, das 11h às 22h;
- produtos do dia: das 11h às 22h;
- produtos noturnos e sopas: das 17h às 22h;
- domingo: fechado.

Produtos fora do horário continuam visíveis, mas ficam desabilitados e mostram
quando estarão disponíveis novamente.

## Pedido pelo WhatsApp

Na finalização, o sistema monta uma mensagem com:

- produtos, quantidades, opções e observações;
- subtotal;
- taxa de entrega;
- taxa de embalagem para entrega;
- total, endereço e forma de pagamento.

O pedido não é registrado em servidor. O cliente confirma o envio ao abrir o
WhatsApp.

## Verificação

```bash
npm run lint
npm run build
```

## Deploy

Em serviços de hospedagem estática, use:

| Campo | Valor |
| --- | --- |
| Framework | Vite |
| Build command | `npm run build` |
| Diretório de saída | `dist` |

Nenhuma variável de ambiente é necessária.
