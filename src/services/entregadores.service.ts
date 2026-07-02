import { prisma } from "@/lib/prisma";

export async function listarEntregadores() {
  return prisma.entregador.findMany({
    orderBy: { createdAt: "asc" },
    include: { pedidos: { include: { entregador: false } } },
  });
}

export async function criarEntregador(nome: string) {
  return prisma.entregador.create({
    data: { nome, status: "DISPONIVEL" },
  });
}

export async function excluirEntregador(id: string) {
  // Desvincula pedidos antes de remover (SetNull já cobre, mas garantimos).
  await prisma.pedido.updateMany({
    where: { entregadorId: id },
    data: { entregadorId: null },
  });
  return prisma.entregador.delete({ where: { id } });
}

/**
 * Finaliza a rota do entregador: todos os pedidos EM_ENTREGA dele viram
 * ENTREGUE e o entregador volta a ficar DISPONIVEL.
 */
export async function finalizarRota(entregadorId: string) {
  await prisma.$transaction([
    prisma.pedido.updateMany({
      where: { entregadorId, status: "EM_ENTREGA" },
      data: { status: "ENTREGUE" },
    }),
    prisma.entregador.update({
      where: { id: entregadorId },
      data: { status: "DISPONIVEL" },
    }),
  ]);
  return { ok: true };
}
