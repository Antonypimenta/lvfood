import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import { configSchema } from "@/schemas/pedido";
import { eventoAtivo } from "@/services/eventos.service";

export async function obterConfig() {
  // Garante que exista um evento ativo e sincroniza o nome exibido.
  const evento = await eventoAtivo();
  const config = await prisma.configuracao.findUnique({
    where: { id: "singleton" },
  });
  return {
    id: "singleton",
    nomeEvento: config?.nomeEvento ?? evento.nome,
    eventoAtivoId: evento.id,
  };
}

export async function atualizarConfig(data: z.infer<typeof configSchema>) {
  const parsed = configSchema.parse(data);
  // Renomear pelo painel de config renomeia também o evento ativo.
  const evento = await eventoAtivo();
  await prisma.evento.update({
    where: { id: evento.id },
    data: { nome: parsed.nomeEvento },
  });
  return prisma.configuracao.update({
    where: { id: "singleton" },
    data: { nomeEvento: parsed.nomeEvento },
  });
}

/** Limpa os pedidos do evento ativo e reseta o status dos entregadores. */
export async function limparSistema() {
  const evento = await eventoAtivo();
  await prisma.$transaction([
    prisma.pedido.deleteMany({ where: { eventoId: evento.id } }),
    prisma.entregador.updateMany({ data: { status: "DISPONIVEL" } }),
  ]);
  return { ok: true };
}
