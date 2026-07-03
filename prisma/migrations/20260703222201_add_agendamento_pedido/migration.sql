-- Adiciona o horário de entrega agendado (opcional). Coluna nullable: não afeta pedidos existentes.
ALTER TABLE "Pedido" ADD COLUMN "agendamento" TEXT;
