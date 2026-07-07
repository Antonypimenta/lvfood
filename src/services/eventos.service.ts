import { prisma } from "@/lib/prisma";

/**
 * Retorna o evento atualmente ativo. Se não houver nenhum (primeiro acesso ou
 * evento removido), cria/seleciona um automaticamente para nunca ficar sem
 * evento — todo pedido precisa pertencer a um.
 */
export async function eventoAtivo() {
  const config = await prisma.configuracao.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", nomeEvento: "Burguer LV" },
  });

  if (config.eventoAtivoId) {
    const atual = await prisma.evento.findUnique({
      where: { id: config.eventoAtivoId },
    });
    if (atual) return atual;
  }

  // Sem evento ativo válido: usa o mais recente ou cria um novo.
  const existente = await prisma.evento.findFirst({
    orderBy: { createdAt: "desc" },
  });
  const evento =
    existente ??
    (await prisma.evento.create({
      data: { nome: config.nomeEvento || "Evento 1" },
    }));

  await prisma.configuracao.update({
    where: { id: "singleton" },
    data: { eventoAtivoId: evento.id, nomeEvento: evento.nome },
  });
  return evento;
}

export async function eventoAtivoId() {
  return (await eventoAtivo()).id;
}

/** Lista os eventos com a contagem de pedidos de cada um. */
export async function listarEventos() {
  const eventos = await prisma.evento.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { pedidos: true } } },
  });
  return eventos.map((e) => ({
    id: e.id,
    nome: e.nome,
    createdAt: e.createdAt,
    totalPedidos: e._count.pedidos,
  }));
}

/** Cria um novo evento e já o torna o evento ativo. */
export async function criarEvento(nome: string) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) throw new Error("Informe o nome do evento");
  const evento = await prisma.evento.create({ data: { nome: nomeLimpo } });
  await prisma.configuracao.update({
    where: { id: "singleton" },
    data: { eventoAtivoId: evento.id, nomeEvento: evento.nome },
  });
  return evento;
}

/** Renomeia um evento (mantém o nome da config em sincronia se for o ativo). */
export async function renomearEvento(id: string, nome: string) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) throw new Error("Informe o nome do evento");
  const evento = await prisma.evento.update({
    where: { id },
    data: { nome: nomeLimpo },
  });
  const config = await prisma.configuracao.findUnique({
    where: { id: "singleton" },
  });
  if (config?.eventoAtivoId === id) {
    await prisma.configuracao.update({
      where: { id: "singleton" },
      data: { nomeEvento: evento.nome },
    });
  }
  return evento;
}

/** Seleciona o evento ativo (define quais pedidos são exibidos/recebidos). */
export async function selecionarEvento(id: string) {
  const evento = await prisma.evento.findUnique({ where: { id } });
  if (!evento) throw new Error("Evento não encontrado");
  await prisma.configuracao.update({
    where: { id: "singleton" },
    data: { eventoAtivoId: evento.id, nomeEvento: evento.nome },
  });
  return evento;
}

/**
 * Exclui um evento e todos os seus pedidos (cascade). Não permite remover o
 * último evento. Se remover o ativo, seleciona outro automaticamente.
 */
export async function excluirEvento(id: string) {
  const total = await prisma.evento.count();
  if (total <= 1) {
    throw new Error("Não é possível excluir o único evento");
  }
  await prisma.evento.delete({ where: { id } });

  const config = await prisma.configuracao.findUnique({
    where: { id: "singleton" },
  });
  if (config?.eventoAtivoId === id) {
    const proximo = await prisma.evento.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (proximo) {
      await prisma.configuracao.update({
        where: { id: "singleton" },
        data: { eventoAtivoId: proximo.id, nomeEvento: proximo.nome },
      });
    }
  }
  return { ok: true };
}
