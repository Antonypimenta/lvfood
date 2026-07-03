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

  // Produtos de exemplo — só cria se o cardápio ainda estiver vazio.
  const totalProdutos = await prisma.produto.count();
  if (totalProdutos === 0) {
    const produtos: {
      nome: string;
      descricao?: string;
      preco: number;
      categoria: string;
      ordem: number;
    }[] = [
      // Combos (destaque no topo)
      { nome: "Combo X-Burguer", descricao: "X-Burguer + batata + refrigerante", preco: 28, categoria: "COMBOS", ordem: 1 },
      { nome: "Combo X-Salada", descricao: "X-Salada + batata + refrigerante", preco: 30, categoria: "COMBOS", ordem: 2 },
      // Hambúrgueres
      { nome: "X-Burguer", descricao: "Pão, carne, queijo", preco: 16, categoria: "HAMBURGUERES", ordem: 1 },
      { nome: "X-Salada", descricao: "Pão, carne, queijo, salada", preco: 18, categoria: "HAMBURGUERES", ordem: 2 },
      { nome: "X-Bacon", descricao: "Pão, carne, queijo, bacon", preco: 21, categoria: "HAMBURGUERES", ordem: 3 },
      // Batatas
      { nome: "Batata Frita P", preco: 10, categoria: "BATATAS", ordem: 1 },
      { nome: "Batata Frita G", preco: 16, categoria: "BATATAS", ordem: 2 },
      // Bebidas
      { nome: "Guaracamp", preco: 6, categoria: "BEBIDAS", ordem: 1 },
      { nome: "Refrigerante Lata", preco: 7, categoria: "BEBIDAS", ordem: 2 },
      { nome: "Água", preco: 4, categoria: "BEBIDAS", ordem: 3 },
      // Extras (nunca aparecem no cardápio; só como adicional de hambúrguer)
      { nome: "Bacon", preco: 4, categoria: "EXTRAS", ordem: 1 },
      { nome: "Ovo", preco: 2, categoria: "EXTRAS", ordem: 2 },
      { nome: "Carne Extra", preco: 8, categoria: "EXTRAS", ordem: 3 },
    ];
    await prisma.produto.createMany({ data: produtos });
  }

  console.log("Seed concluído: configuração + entregadores + produtos criados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
