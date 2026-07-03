import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import {
  criarProdutoSchema,
  atualizarProdutoSchema,
} from "@/schemas/produto";
import type { Prisma } from "@prisma/client";

/** Include padrão: componentes do combo (com o produto de cada componente). */
const produtoInclude = {
  componentes: {
    include: { produto: true },
    orderBy: { ordem: "asc" as const },
  },
} as const;

type ProdutoComComponentes = Prisma.ProdutoGetPayload<{
  include: typeof produtoInclude;
}>;

/** Achata os componentes para o formato usado pelo cliente. */
function serializar(p: ProdutoComComponentes) {
  return {
    ...p,
    componentes: p.componentes.map((c) => ({
      produtoId: c.produtoId,
      nome: c.produto.nome,
      categoria: c.produto.categoria,
    })),
  };
}

/** Lista todos os produtos (admin) ordenados por categoria e ordem de exibição. */
export async function listarProdutos() {
  const produtos = await prisma.produto.findMany({
    orderBy: [{ categoria: "asc" }, { ordem: "asc" }, { createdAt: "asc" }],
    include: produtoInclude,
  });
  return produtos.map(serializar);
}

/** Lista apenas produtos ativos (usado no cardápio público /pedido). */
export async function listarProdutosAtivos() {
  const produtos = await prisma.produto.findMany({
    where: { ativo: true },
    orderBy: [{ ordem: "asc" }, { createdAt: "asc" }],
    include: produtoInclude,
  });
  return produtos.map(serializar);
}

/** Componentes só se aplicam a combos; para os demais, sempre vazio. */
function componentesDoCombo(
  categoria: string,
  componentesIds: string[]
): string[] {
  return categoria === "COMBOS" ? componentesIds : [];
}

export async function criarProduto(data: z.infer<typeof criarProdutoSchema>) {
  const parsed = criarProdutoSchema.parse(data);
  const ids = componentesDoCombo(parsed.categoria, parsed.componentesIds);

  const produto = await prisma.produto.create({
    data: {
      nome: parsed.nome,
      descricao: parsed.descricao || null,
      preco: parsed.preco,
      categoria: parsed.categoria,
      ativo: parsed.ativo,
      ordem: parsed.ordem,
      componentes: {
        create: ids.map((produtoId, i) => ({ produtoId, ordem: i })),
      },
    },
    include: produtoInclude,
  });
  return serializar(produto);
}

export async function atualizarProduto(
  id: string,
  data: z.infer<typeof atualizarProdutoSchema>
) {
  const parsed = atualizarProdutoSchema.parse(data);
  const { componentesIds, ...campos } = parsed;

  // Se a composição foi enviada, substitui os componentes do combo.
  if (componentesIds !== undefined) {
    const categoria =
      campos.categoria ??
      (await prisma.produto.findUnique({ where: { id } }))?.categoria ??
      "";
    const ids = componentesDoCombo(categoria, componentesIds);
    await prisma.$transaction([
      prisma.comboItem.deleteMany({ where: { comboId: id } }),
      prisma.comboItem.createMany({
        data: ids.map((produtoId, i) => ({ comboId: id, produtoId, ordem: i })),
      }),
    ]);
  }

  const produto = await prisma.produto.update({
    where: { id },
    data: campos,
    include: produtoInclude,
  });
  return serializar(produto);
}

export async function excluirProduto(id: string) {
  return prisma.produto.delete({ where: { id } });
}
