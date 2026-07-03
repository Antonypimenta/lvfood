import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.configuracao.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      nomeEvento: "Burguer LV",
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
    // 1) Produtos-base (hambúrgueres, batatas, bebidas, extras).
    const base: {
      nome: string;
      descricao?: string;
      preco: number;
      categoria: string;
      ordem: number;
    }[] = [
      { nome: "X-Burguer", descricao: "Pão, carne, queijo", preco: 16, categoria: "HAMBURGUERES", ordem: 1 },
      { nome: "X-Salada", descricao: "Pão, carne, queijo, salada", preco: 18, categoria: "HAMBURGUERES", ordem: 2 },
      { nome: "X-Bacon", descricao: "Pão, carne, queijo, bacon", preco: 21, categoria: "HAMBURGUERES", ordem: 3 },
      { nome: "Batata Frita P", preco: 10, categoria: "BATATAS", ordem: 1 },
      { nome: "Batata Frita G", preco: 16, categoria: "BATATAS", ordem: 2 },
      { nome: "Guaracamp", preco: 6, categoria: "BEBIDAS", ordem: 1 },
      { nome: "Refrigerante Lata", preco: 7, categoria: "BEBIDAS", ordem: 2 },
      { nome: "Água", preco: 4, categoria: "BEBIDAS", ordem: 3 },
      { nome: "Bacon", preco: 4, categoria: "EXTRAS", ordem: 1 },
      { nome: "Ovo", preco: 2, categoria: "EXTRAS", ordem: 2 },
      { nome: "Carne Extra", preco: 8, categoria: "EXTRAS", ordem: 3 },
    ];
    await prisma.produto.createMany({ data: base });

    const porNome = async (nome: string) => {
      const p = await prisma.produto.findFirst({ where: { nome } });
      if (!p) throw new Error(`Produto base não encontrado: ${nome}`);
      return p.id;
    };

    // 2) Combos = hambúrguer + acompanhamento + bebida (preço próprio promocional).
    const combos: {
      nome: string;
      descricao: string;
      preco: number;
      ordem: number;
      componentes: string[];
    }[] = [
      {
        nome: "Combo X-Burguer",
        descricao: "X-Burguer + Batata P + Guaracamp",
        preco: 28,
        ordem: 1,
        componentes: ["X-Burguer", "Batata Frita P", "Guaracamp"],
      },
      {
        nome: "Combo X-Salada",
        descricao: "X-Salada + Batata P + Refrigerante",
        preco: 30,
        ordem: 2,
        componentes: ["X-Salada", "Batata Frita P", "Refrigerante Lata"],
      },
    ];

    for (const combo of combos) {
      const ids = await Promise.all(combo.componentes.map(porNome));
      await prisma.produto.create({
        data: {
          nome: combo.nome,
          descricao: combo.descricao,
          preco: combo.preco,
          categoria: "COMBOS",
          ordem: combo.ordem,
          componentes: {
            create: ids.map((produtoId, i) => ({ produtoId, ordem: i })),
          },
        },
      });
    }
  }

  console.log("Seed concluído: configuração + entregadores + produtos + combos.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
