-- Liga/desliga a aceitação de pedidos no cardápio público.
ALTER TABLE "Configuracao" ADD COLUMN "deliveryAtivo" BOOLEAN NOT NULL DEFAULT true;
