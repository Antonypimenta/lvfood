-- Cria o conceito de Evento e separa os pedidos por evento.

-- 1. Tabela Evento
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- 2. Evento padrão a partir do nome atual da configuração (fallback "Evento 1").
INSERT INTO "Evento" ("id", "nome", "createdAt")
SELECT
    'evt_default_00000000000000',
    COALESCE((SELECT "nomeEvento" FROM "Configuracao" WHERE "id" = 'singleton'), 'Evento 1'),
    CURRENT_TIMESTAMP;

-- 3. Coluna eventoId em Pedido (primeiro nullable para backfill).
ALTER TABLE "Pedido" ADD COLUMN "eventoId" TEXT;
UPDATE "Pedido" SET "eventoId" = 'evt_default_00000000000000';
ALTER TABLE "Pedido" ALTER COLUMN "eventoId" SET NOT NULL;

-- 4. Numeração passa a ser por evento: remove unique global, cria composta.
DROP INDEX IF EXISTS "Pedido_numero_key";
CREATE UNIQUE INDEX "Pedido_eventoId_numero_key" ON "Pedido"("eventoId", "numero");
CREATE INDEX "Pedido_eventoId_idx" ON "Pedido"("eventoId");

-- 5. Chave estrangeira Pedido -> Evento.
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_eventoId_fkey"
    FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. Evento ativo na configuração.
ALTER TABLE "Configuracao" ADD COLUMN "eventoAtivoId" TEXT;
UPDATE "Configuracao" SET "eventoAtivoId" = 'evt_default_00000000000000' WHERE "id" = 'singleton';
