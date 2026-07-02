import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.configuracao.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      nomeEvento: "Delivery Igreja",
      valorCombo: 18,
    },
  });

  const entregadores = ["Carlos", "Pedro", "João"];
  for (const nome of entregadores) {
    const existe = await prisma.entregador.findFirst({ where: { nome } });
    if (!existe) {
      await prisma.entregador.create({ data: { nome, status: "DISPONIVEL" } });
    }
  }

  console.log("Seed concluído: configuração + entregadores criados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
