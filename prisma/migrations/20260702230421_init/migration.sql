-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "observacoes" TEXT,
    "formaPagamento" TEXT NOT NULL DEFAULT 'PIX',
    "pagamento" TEXT NOT NULL DEFAULT 'PENDENTE',
    "valor" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EM_PREPARO',
    "horarioSaida" DATETIME,
    "entregadorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pedido_entregadorId_fkey" FOREIGN KEY ("entregadorId") REFERENCES "Entregador" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entregador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "nomeEvento" TEXT NOT NULL DEFAULT 'Delivery Igreja',
    "valorCombo" REAL NOT NULL DEFAULT 18
);

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_numero_key" ON "Pedido"("numero");

-- CreateIndex
CREATE INDEX "Pedido_status_idx" ON "Pedido"("status");

-- CreateIndex
CREATE INDEX "Pedido_entregadorId_idx" ON "Pedido"("entregadorId");
