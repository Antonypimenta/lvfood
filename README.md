# LVFood 🍔

Sistema web profissional para gerenciamento de pedidos de delivery de hambúrguer,
feito para operar com **máxima velocidade** durante um evento. Cadastre um pedido
em menos de 15 segundos, acompanhe tudo pelo Kanban e controle entregas e vendas
em tempo real.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** + componentes no estilo **shadcn/ui**
- **Prisma ORM** + **PostgreSQL** (Vercel Postgres)
- **Zustand** (estado + sincronização em tempo real por polling)
- **React Hook Form** + **Zod** (formulários e validação)
- **@dnd-kit** (drag and drop no Kanban)
- **date-fns** + **Lucide React**

## Como executar (local)

Requer um banco **PostgreSQL**. A forma mais simples é usar o mesmo banco da
Vercel: crie o projeto/Postgres na Vercel (ver abaixo) e puxe as variáveis:

```bash
npm install
vercel link                 # vincula a pasta ao projeto Vercel
vercel env pull .env        # baixa POSTGRES_PRISMA_URL e POSTGRES_URL_NON_POOLING
npx prisma migrate deploy   # aplica as migrations
npm run db:seed             # popula configuração + entregadores (opcional)
npm run dev                 # http://localhost:3000
```

> As variáveis de ambiente estão documentadas em `.env.example`.

## Deploy na Vercel + Vercel Postgres

1. Importe o repositório na Vercel (framework detectado: **Next.js**).
2. Em **Storage → Create Database → Postgres**, crie o banco e **conecte** ao
   projeto. Isso injeta automaticamente `POSTGRES_PRISMA_URL` e
   `POSTGRES_URL_NON_POOLING` em todos os ambientes.
3. Faça o deploy. O script de build (`prisma generate && prisma migrate deploy
   && next build`) cria as tabelas automaticamente.
4. Popule os entregadores uma vez (localmente, com `.env` puxado da Vercel):
   `npm run db:seed` — ou cadastre-os pela própria tela **Entregadores**.

> O Prisma usa a URL com pool (`POSTGRES_PRISMA_URL`) em runtime serverless e a
> URL direta (`POSTGRES_URL_NON_POOLING`) para migrations.

## Funcionalidades

| Tela | O que faz |
|------|-----------|
| **Dashboard** | Cards de operação (total, em preparo, prontos, em entrega, entregues, combos, valor vendido, ticket médio), últimos pedidos e status dos entregadores. |
| **Kanban** | Colunas *Em preparo · Pronto · Em entrega · Entregue* com drag-and-drop (salva automático), cronômetro por pedido, botão WhatsApp e criação de rota a partir da coluna *Pronto*. |
| **Pedidos** | Tabela completa com pesquisa instantânea (nome/telefone/nº), filtros (status, bairro, pagamento) e ações editar/duplicar/excluir. |
| **Entregadores** | Cadastro simples, cards com status e entregas, e **Finalizar rota** (marca pedidos como entregues). |
| **Vendas** | Painel financeiro em tempo real: valor vendido, combos, PIX/Dinheiro/Cartão, ticket médio, entregues e pendentes. |
| **Configurações** | Nome do evento, valor do combo e **Limpar sistema** (com confirmação). |

## Atalhos de teclado

- **Ctrl/⌘ + N** — novo pedido
- **Ctrl/⌘ + K** — focar a busca de pedidos
- **Enter** — salvar formulários · **Esc** — fechar modais · **Tab** — navegar

## Regras de negócio

- **Valor** nunca é editado — sempre `quantidade × valor do combo`.
- **Número** do pedido é sequencial e gerado no servidor (`0001`, `0002`, ...).
- Ao criar rota: pedidos → *Em entrega*, entregador → *Ocupado*, horário de saída registrado.
- Ao finalizar rota: pedidos → *Entregue*, entregador → *Disponível*.
- Cronômetro fica **cinza** até 30 min, **vermelho** após 30 min e **pulsa** após 45 min.

## Organização do código

```
src/
├─ app/            # rotas (App Router) + API routes
├─ components/     # UI, layout, kanban, pedidos, dashboard, vendas, ...
├─ hooks/          # useTempo, usePolling, useAtalhos
├─ services/       # lógica de acesso ao banco (Prisma)
├─ schemas/        # validação Zod
├─ store/          # Zustand (dados + estado de UI)
├─ lib/            # utils, constantes, stats, navegação
└─ types/          # tipos TypeScript
prisma/            # schema, migrations, seed
```
