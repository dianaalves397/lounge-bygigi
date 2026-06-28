# lounge Advanced

VersÃ£o avanÃ§ada com homepage e layout editÃ¡veis no painel, categorias automÃ¡ticas, saldos, W Sports/M Sports, produtos com cores/tamanhos, menu mega personalizÃ¡vel, Ã¡rea de cliente, carrinho detalhado e integraÃ§Ãµes preparadas para Shopify, WooCommerce e Stripe.

## Testar

```bash
npm install
npm run dev
```

VariÃ¡veis:

```txt
ADMIN_PASSWORD=uma-password
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Painel: `/control`

Nota: esta versÃ£o usa ficheiros JSON para facilitar testes. Para produÃ§Ã£o real com alteraÃ§Ãµes permanentes em Vercel/Netlify, o ideal Ã© ligar uma base de dados.


## AtualizaÃ§Ãµes pelo painel

Esta versÃ£o forÃ§a as pÃ¡ginas e APIs a lerem sempre os ficheiros JSON atualizados.

Em desenvolvimento local:
- Altera dados em `/control`.
- Abre/atualiza a pÃ¡gina pÃºblica.
- As alteraÃ§Ãµes devem aparecer.

Em Vercel/Netlify:
- AlteraÃ§Ãµes em ficheiros JSON podem nÃ£o ser permanentes em produÃ§Ã£o.
- Para uma loja real com alteraÃ§Ãµes permanentes pelo painel, liga uma base de dados, WooCommerce ou Shopify.


## Painel privado sem botÃ£o pÃºblico

O botÃ£o do painel foi removido do menu pÃºblico.

O novo link privado do painel Ã©:

```txt
/lounge-control-926
```

Exemplo online:

```txt
https://teusite.vercel.app/lounge-control-926
```

A rota antiga `/control` devolve 404.

Configura estas variÃ¡veis:

```txt
ADMIN_USER=admin
ADMIN_PASSWORD=a-tua-password-segura
NEXT_PUBLIC_SITE_URL=https://teusite.vercel.app
```

Podes aceder de qualquer PC desde que saibas:
1. o link privado;
2. o utilizador;
3. a password.

Para maior seguranÃ§a, usa uma password forte e nÃ£o partilhes o link do painel.


## Ajustes finais

Credenciais padrÃ£o:
```txt
ADMIN_USER=Diana2020*
ADMIN_PASSWORD=Diana2020*
```

Menu pÃºblico:
- Homepage: Men / Women
- Outras pÃ¡ginas: PÃ¡gina inicial / Men / Women

Ao entrar no site, o cliente escolhe paÃ­s/lÃ­ngua/moeda. Os preÃ§os sÃ£o convertidos visualmente conforme o paÃ­s escolhido.


## Ajustes desta versÃ£o

- Login do painel corrigido com utilizador e password:
  - ADMIN_USER=Diana2020*
  - ADMIN_PASSWORD=Diana2020*
- Painel privado em /lounge-control-926.
- Menu moderno/minimalista:
  - Homepage: Men / Women
  - Outras pÃ¡ginas: PÃ¡gina inicial / Men / Women
- Seletor de paÃ­s/lÃ­ngua/moeda ativo.


## Checkout WooCommerce

Quando WooCommerce estÃ¡ ativo no painel:

```txt
Painel â†’ Plataformas â†’ WooCommerce â†’ Ativar WooCommerce = yes
```

o botÃ£o de checkout da lounge passa a:
1. criar uma encomenda pendente no WooCommerce;
2. enviar o cliente para a pÃ¡gina de pagamento dessa encomenda no WooCommerce.

Isto faz com que pagamentos, emails de encomenda, stock, mÃ©todos de envio e gateways fiquem tratados pelo WooCommerce.

Requisito importante: os produtos no carrinho tÃªm de ser produtos sincronizados do WooCommerce, com IDs no formato `woocommerce-123`.


## Checkout corrigido

O checkout agora cria sempre uma encomenda local no painel.

Funcionamento:
- WooCommerce ativo + produtos WooCommerce: cria encomenda local e redireciona para pagamento WooCommerce.
- WooCommerce ativo + produtos manuais: cria encomenda manual no painel e mostra aviso.
- Stripe ativo: cria encomenda local e redireciona para Stripe.
- Sem WooCommerce/Stripe: cria encomenda manual no painel.

Depois de testar, vai a:
```txt
/lounge-control-926 â†’ Encomendas â†’ Atualizar encomendas
```


## CorreÃ§Ã£o para Vercel

Esta versÃ£o inclui:
- `vercel.json`
- `.npmrc`
- versÃµes de dependÃªncias fixas
- Node/NPM definidos em `package.json`

Isto evita falhas na instalaÃ§Ã£o como:

```txt
npm error Exit handler never called!
```

Para publicar:
```bash
vercel.cmd --prod
```

Se jÃ¡ existir projeto na Vercel, faz Redeploy depois de carregar esta versÃ£o.


## CorreÃ§Ã£o Vercel com Yarn

Esta versÃ£o evita o erro da Vercel:

```txt
npm error Exit handler never called!
```

A Vercel passa a usar:

```txt
corepack enable && yarn install --ignore-engines --network-timeout 100000
```

e o build:

```txt
yarn build
```

Depois de publicar, confirma na Vercel:
- Install Command: `corepack enable && yarn install --ignore-engines --network-timeout 100000`
- Build Command: `yarn build`


## CorreÃ§Ã£o de seguranÃ§a Next.js para Vercel

A Vercel bloqueava o deploy por detetar Next.js vulnerÃ¡vel.

Esta versÃ£o usa:

```txt
next = 15.5.7
```

e instala com Yarn:

```txt
corepack enable && yarn install --ignore-engines --network-timeout 100000
```

Build:

```txt
yarn build
```


# Lounge by Gigi â€” Wix backend

Esta versÃ£o foi preparada para ligar a lounge/Lounge by Gigi Ã  Wix:

- produtos e inventÃ¡rio vÃªm da Wix;
- checkout redireciona para checkout Wix;
- pagamentos e dropshipping ficam configurados dentro da Wix;
- painel mantÃ©m as funcionalidades e ganhou secÃ§Ã£o Wix.

## Configurar Wix

Na Wix precisas:
1. Ter Wix Stores instalado no site.
2. Ter plano que permita loja/pagamentos.
3. Configurar pagamentos na Wix.
4. Ligar apps de dropshipping na Wix.
5. Criar API Key em Wix API Keys Manager.
6. Dar permissÃµes de Stores/eCommerce: produtos, inventÃ¡rio, checkout/orders.
7. Copiar o Site ID do dashboard da Wix.

No painel:
```txt
/lounge-control-926 â†’ Plataformas â†’ Wix
```

Preenche:
```txt
Ativar Wix = yes
Usar Wix como base de dados = yes
Wix API Key = a tua API key
Wix Site ID = site ID
Wix Store URL = URL da tua loja Wix
```

Depois clica:
```txt
Guardar Wix/plataformas
Testar Wix
Sincronizar Wix
```

## Publicar no GitHub pelo terminal

Dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Lounge by Gigi Wix"
git branch -M main
git remote add origin https://github.com/TEU-UTILIZADOR/NOME-DO-REPO.git
git push -u origin main
```

Se o Git pedir login, usa o login do GitHub.

## Publicar na Vercel

1. Vai a Vercel.
2. Add New Project.
3. Importa o repositÃ³rio GitHub.
4. Confirma:
```txt
Framework: Next.js
Install Command: corepack enable && yarn install --ignore-engines --network-timeout 100000
Build Command: yarn build
```

5. Em Environment Variables adiciona:
```txt
ADMIN_USER=Diana2020*
ADMIN_PASSWORD=Diana2020*
NEXT_PUBLIC_SITE_URL=https://o-teu-site.vercel.app
WIX_API_KEY=a_tua_wix_api_key
WIX_SITE_ID=o_teu_wix_site_id
```

6. Deploy.

## Importante

A integraÃ§Ã£o usa APIs oficiais da Wix. A Wix exige API Key + Site ID para site-level APIs. Produtos sÃ£o lidos da Wix Stores e o checkout Ã© criado via Wix eCommerce Checkout API.


# Lounge by Gigi â€” Shopify backend

Esta versÃ£o foi preparada para usar Shopify como backend:

- produtos vÃªm da Shopify;
- inventÃ¡rio vem da Shopify;
- checkout redireciona para o checkout Shopify;
- pagamentos, encomendas, emails e apps de dropshipping ficam na Shopify;
- o site Lounge by Gigi mantÃ©m o layout personalizado.

## Configurar Shopify

Na Shopify:
1. Cria uma loja Shopify.
2. Adiciona produtos ou instala apps de dropshipping/print-on-demand.
3. Cria uma Custom App.
4. Ativa Admin API scopes de produtos/inventÃ¡rio.
5. Cria um Storefront Access Token.
6. Copia:
   - Store Domain: `atua-loja.myshopify.com`
   - Admin Access Token
   - Storefront Access Token

No painel:
```txt
/lounge-control-926 â†’ Plataformas â†’ Shopify
```

Preenche:
```txt
Ativar Shopify = yes
Usar Shopify como base de dados = yes
Shopify Store Domain = atua-loja.myshopify.com
Admin Access Token = shpat_...
Storefront Access Token = ...
API Version = 2025-10
```

Depois:
```txt
Guardar Shopify/plataformas
Testar Shopify
Sincronizar Shopify
```

## Publicar no GitHub pelo terminal

Dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Lounge by Gigi Shopify"
git branch -M main
git remote add origin https://github.com/TEU-UTILIZADOR/NOME-DO-REPO.git
git push -u origin main
```

## Colocar na Vercel

Na Vercel:
```txt
Add New Project
Importa o repositÃ³rio GitHub
Framework: Next.js
Install Command: corepack enable && yarn install --ignore-engines --network-timeout 100000
Build Command: yarn build
```

Environment Variables:
```txt
ADMIN_USER=Diana2020*
ADMIN_PASSWORD=Diana2020*
NEXT_PUBLIC_SITE_URL=https://o-teu-site.vercel.app
SHOPIFY_STORE_DOMAIN=atua-loja.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_...
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
SHOPIFY_API_VERSION=2025-10
```

Depois faz Deploy.


## Shopify Storefront API â€” sem Admin Access Token

Esta versÃ£o jÃ¡ nÃ£o pede Admin Access Token.

SÃ³ precisas de:

```txt
Shopify Store Domain
Storefront Access Token
API Version
```

No painel:

```txt
/lounge-control-926 â†’ Plataformas â†’ Shopify
```

Preenche:

```txt
Ativar Shopify = yes
Usar Shopify como base de dados = yes
Shopify Store Domain = dcgzsv-mz.myshopify.com
Storefront Access Token = o token Storefront API
API Version = 2025-10
```

Depois clica:

```txt
Guardar Shopify/plataformas
Testar Shopify
Sincronizar Shopify
```

Em produÃ§Ã£o, na Vercel, podes tambÃ©m configurar:

```txt
SHOPIFY_STORE_DOMAIN=dcgzsv-mz.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=o_token
SHOPIFY_API_VERSION=2025-10
```

A partir daÃ­:
- produtos pÃºblicos vÃªm da Shopify;
- stock disponÃ­vel vem da Shopify Storefront API;
- checkout Ã© criado na Shopify;
- pagamentos, encomendas e dropshipping ficam dentro da Shopify.

# Lounge by Gigi â€” Printful + Printify + Stripe/Apple Pay + PayPal

Esta versÃ£o permite colocar as credenciais diretamente no painel:

```txt
/lounge-control-926
```

## Fornecedores
No separador **Fornecedores**, podes preencher:

```txt
Printful API Token
Printful Store ID
Printify API Token
Printify Shop ID
```

Depois clica:

```txt
Guardar fornecedores
Testar Printful / Testar Printify
Sincronizar Printful / Sincronizar Printify
```

## Pagamentos
No separador **Pagamentos**, podes preencher:

```txt
Stripe Publishable Key
Stripe Secret Key
Stripe Webhook Secret
PayPal Client ID
PayPal Client Secret
PayPal mode
```

Apple Pay funciona atravÃ©s da Stripe quando o domÃ­nio estiver verificado na Stripe.

## Nota importante para Vercel
As alteraÃ§Ãµes feitas no painel ficam guardadas em JSON. Para garantir que ficam publicadas de forma estÃ¡vel, faz as alteraÃ§Ãµes localmente e depois publica com:

```bash
vercel.cmd --prod
```

Se precisares de alterar dados diretamente no site publicado sem redeploy, a soluÃ§Ã£o correta Ã© ligar uma base de dados como Supabase.


# VersÃ£o com Supabase permanente

Esta versÃ£o permite guardar permanentemente no Supabase as alteraÃ§Ãµes feitas no painel online da Vercel.

## 1. Criar tabela no Supabase

No Supabase â†’ SQL Editor, cola e executa o conteÃºdo de:

```txt
supabase/schema.sql
```

## 2. VariÃ¡veis na Vercel

Em Vercel â†’ Project â†’ Settings â†’ Environment Variables, adiciona:

```txt
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey...
ADMIN_USER=Diana2020*
ADMIN_PASSWORD=Diana2020*
NEXT_PUBLIC_SITE_URL=https://o-teu-site.vercel.app
```

Depois faz Redeploy.

## 3. Inicializar no painel

Abre:

```txt
/lounge-control-926
```

Clica em:

```txt
Inicializar Supabase
```

A partir daÃ­ podes colocar no painel:

```txt
Printful API Token
Printful Store ID
Printify API Token
Printify Shop ID
Stripe keys
PayPal keys
```

e as configuraÃ§Ãµes ficam guardadas permanentemente no Supabase.

## Importante

- Printful/Printify continuam a atualizar produtos/stock quando o site consulta os fornecedores.
- O Supabase guarda as tuas configuraÃ§Ãµes, overrides, imagens extra, produtos manuais, encomendas, clientes e settings.
- Apple Pay aparece atravÃ©s da Stripe Checkout quando o domÃ­nio estiver verificado na Stripe.


