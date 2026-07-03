import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import {
  criarProdutoSchema,
  atualizarProdutoSchema,
} from "@/schemas/produto";

/** Lista todos os produtos (admin) ordenados por categoria e ordem de exibição. */
export async function listarProdutos() {
  return prisma.produto.findMany({
    orderBy: [{ categoria: "asc" }, { ordem: "asc" }, { createdAt: "asc" }],
  });
}

/** Lista apenas produtos ativos (usado no cardápio público /pedido). */
export async function listarProdutosAtivos() {
  return prisma.produto.findMany({
    where: { ativo: true },
    orderBy: [{ ordem: "asc" }, { createdAt: "asc" }],
  });
}

export async function criarProduto(
  data: z.infer<typeof criarProdutoSchema>
) {
  const parsed = criarProdutoSchema.parse(data);
  return prisma.produto.create({
    data: {
      nome: parsed.nome,
      descricao: parsed.descricao || null,
      preco: parsed.preco,
      categoria: parsed.categoria,
      ativo: parsed.ativo,
      ordem: parsed.ordem,
    },
  });
}

export async function atualizarProduto(
  id: string,
  data: z.infer<typeof atualizarProdutoSchema>
) {
  const parsed = atualizarProdutoSchema.parse(data);
  return prisma.produto.update({
    where: { id },
    data: parsed,
  });
}

export async function excluirProduto(id: string) {
  return prisma.produto.delete({ where: { id } });
}
