-- Renomeia o padrão do nome do evento e atualiza o registro existente.
ALTER TABLE "Configuracao" ALTER COLUMN "nomeEvento" SET DEFAULT 'Burguer LV';

-- Só troca se ainda estiver com o valor padrão antigo (não sobrescreve nome personalizado).
UPDATE "Configuracao" SET "nomeEvento" = 'Burguer LV' WHERE "nomeEvento" = 'Delivery Igreja';
