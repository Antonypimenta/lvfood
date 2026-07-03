import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import { configSchema } from "@/schemas/pedido";

export async function obterConfig() {
  const config = await prisma.configuracao.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", nomeEvento: "Delivery Igreja" },
  });
  return config;
}

export async function atualizarConfig(data: z.infer<typeof configSchema>) {
  const parsed = configSchema.parse(data);
  return prisma.configuracao.upsert({
    where: { id: "singleton" },
    update: parsed,
    create: { id: "singleton", ...parsed },
  });
}

/** Limpa todos os pedidos e reseta o status dos entregadores. */
export async function limparSistema() {
  await prisma.$transaction([
    prisma.pedido.deleteMany({}),
    prisma.entregador.updateMany({ data: { status: "DISPONIVEL" } }),
  ]);
  return { ok: true };
}
