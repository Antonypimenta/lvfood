import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import {
  criarPedidoSchema,
  atualizarPedidoSchema,
  criarRotaSchema,
} from "@/schemas/pedido";

async function getValorCombo(): Promise<number> {
  const config = await prisma.configuracao.findUnique({
    where: { id: "singleton" },
  });
  return config?.valorCombo ?? 18;
}

export async function listarPedidos() {
  return prisma.pedido.findMany({
    orderBy: { numero: "desc" },
    include: { entregador: true },
  });
}

export async function criarPedido(
  data: z.infer<typeof criarPedidoSchema>
) {
  const parsed = criarPedidoSchema.parse(data);
  const valorCombo = await getValorCombo();

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
      quantidade: parsed.quantidade,
      observacoes: parsed.observacoes || null,
      formaPagamento: parsed.formaPagamento,
      pagamento: parsed.pagamento,
      valor: parsed.quantidade * valorCombo,
      status: "EM_PREPARO",
    },
    include: { entregador: true },
  });
}

export async function atualizarPedido(
  id: string,
  data: z.infer<typeof atualizarPedidoSchema>
) {
  const parsed = atualizarPedidoSchema.parse(data);
  const updateData: Record<string, unknown> = { ...parsed };

  // Recalcula o valor se a quantidade mudar.
  if (parsed.quantidade !== undefined) {
    const valorCombo = await getValorCombo();
    updateData.valor = parsed.quantidade * valorCombo;
  }

  return prisma.pedido.update({
    where: { id },
    data: updateData,
    include: { entregador: true },
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
