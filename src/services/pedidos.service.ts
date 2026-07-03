import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import {
  criarPedidoSchema,
  atualizarPedidoSchema,
  criarRotaSchema,
} from "@/schemas/pedido";

/** Include padrão: entregador + itens (com extras) de cada pedido. */
const pedidoInclude = {
  entregador: true,
  itens: {
    include: { extras: true },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export async function listarPedidos() {
  return prisma.pedido.findMany({
    orderBy: { numero: "desc" },
    include: pedidoInclude,
  });
}

export async function criarPedido(
  data: z.infer<typeof criarPedidoSchema>
) {
  const parsed = criarPedidoSchema.parse(data);

  // Busca os produtos referenciados para recalcular tudo no servidor
  // (nunca confiar em preços vindos do cliente).
  const produtoIds = new Set<string>();
  for (const item of parsed.itens) {
    produtoIds.add(item.produtoId);
    for (const extra of item.extras) produtoIds.add(extra.produtoId);
  }

  const produtos = await prisma.produto.findMany({
    where: { id: { in: Array.from(produtoIds) } },
  });
  const mapa = new Map(produtos.map((p) => [p.id, p]));

  // Monta os itens com preços do banco. Extras só valem para hambúrgueres.
  const itensData = parsed.itens.map((item) => {
    const produto = mapa.get(item.produtoId);
    if (!produto) {
      throw new Error(`Produto não encontrado: ${item.produtoId}`);
    }

    const extrasValidos =
      produto.categoria === "HAMBURGUERES"
        ? item.extras
            .map((e) => mapa.get(e.produtoId))
            .filter(
              (p): p is NonNullable<typeof p> =>
                Boolean(p) && p!.categoria === "EXTRAS"
            )
        : [];

    const somaExtras = extrasValidos.reduce((acc, e) => acc + e.preco, 0);
    const valorTotal = (produto.preco + somaExtras) * item.quantidade;

    return {
      produtoId: produto.id,
      nomeProduto: produto.nome,
      categoria: produto.categoria,
      quantidade: item.quantidade,
      valorUnitario: produto.preco,
      valorTotal,
      extras: {
        create: extrasValidos.map((e) => ({
          produtoId: e.id,
          nomeProduto: e.nome,
          valorUnitario: e.preco,
        })),
      },
    };
  });

  const valor = itensData.reduce((acc, i) => acc + i.valorTotal, 0);
  const quantidade = itensData.reduce((acc, i) => acc + i.quantidade, 0);

  // Número sequencial: max + 1 (padStart apenas na exibição).
  const ultimo = await prisma.pedido.findFirst({
    orderBy: { numero: "desc" },
    select: { numero: true },
  });
  const numero = (ultimo?.numero ?? 0) + 1;

  return prisma.pedido.create({
    data: {
      numero,
      nome: parsed.nome,
      telefone: parsed.telefone,
      bairro: parsed.bairro,
      endereco: parsed.endereco,
      complemento: parsed.complemento || null,
      quantidade,
      observacoes: parsed.observacoes || null,
      formaPagamento: parsed.formaPagamento,
      pagamento: parsed.pagamento,
      troco:
        parsed.formaPagamento === "DINHEIRO" ? parsed.troco ?? null : null,
      valor,
      status: "EM_PREPARO",
      itens: { create: itensData },
    },
    include: pedidoInclude,
  });
}

export async function atualizarPedido(
  id: string,
  data: z.infer<typeof atualizarPedidoSchema>
) {
  const parsed = atualizarPedidoSchema.parse(data);

  return prisma.pedido.update({
    where: { id },
    data: parsed,
    include: pedidoInclude,
  });
}

export async function excluirPedido(id: string) {
  return prisma.pedido.delete({ where: { id } });
}

/**
 * Cria rota: vincula pedidos a um entregador, move para EM_ENTREGA,
 * registra horário de saída e marca o entregador como EM_ENTREGA.
 */
export async function criarRota(data: z.infer<typeof criarRotaSchema>) {
  const { pedidoIds, entregadorId } = criarRotaSchema.parse(data);
  const agora = new Date();

  await prisma.$transaction([
    prisma.pedido.updateMany({
      where: { id: { in: pedidoIds } },
      data: {
        status: "EM_ENTREGA",
        entregadorId,
        horarioSaida: agora,
      },
    }),
    prisma.entregador.update({
      where: { id: entregadorId },
      data: { status: "EM_ENTREGA" },
    }),
  ]);

  return { ok: true };
}
