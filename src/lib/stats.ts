import type { Pedido, StatusPedido } from "@/types";

export interface DashboardStats {
  total: number;
  emPreparo: number;
  prontos: number;
  emEntrega: number;
  entregues: number;
  combosVendidos: number;
  valorVendido: number;
  ticketMedio: number;
}

export function calcularStats(pedidos: Pedido[]): DashboardStats {
  const porStatus = (s: StatusPedido) =>
    pedidos.filter((p) => p.status === s).length;

  const combosVendidos = pedidos.reduce((acc, p) => acc + p.quantidade, 0);
  const valorVendido = pedidos.reduce((acc, p) => acc + p.valor, 0);
  const total = pedidos.length;

  return {
    total,
    emPreparo: porStatus("EM_PREPARO"),
    prontos: porStatus("PRONTO"),
    emEntrega: porStatus("EM_ENTREGA"),
    entregues: porStatus("ENTREGUE"),
    combosVendidos,
    valorVendido,
    ticketMedio: total > 0 ? valorVendido / total : 0,
  };
}

export interface VendasStats {
  valorVendido: number;
  combosVendidos: number;
  pix: number;
  dinheiro: number;
  cartao: number;
  ticketMedio: number;
  entregues: number;
  pendentes: number; // pagamento pendente
}

export function calcularVendas(pedidos: Pedido[]): VendasStats {
  const somaPorForma = (forma: string) =>
    pedidos
      .filter((p) => p.formaPagamento === forma)
      .reduce((acc, p) => acc + p.valor, 0);

  const valorVendido = pedidos.reduce((acc, p) => acc + p.valor, 0);
  const total = pedidos.length;

  return {
    valorVendido,
    combosVendidos: pedidos.reduce((acc, p) => acc + p.quantidade, 0),
    pix: somaPorForma("PIX"),
    dinheiro: somaPorForma("DINHEIRO"),
    cartao: somaPorForma("CARTAO"),
    ticketMedio: total > 0 ? valorVendido / total : 0,
    entregues: pedidos.filter((p) => p.status === "ENTREGUE").length,
    pendentes: pedidos.filter((p) => p.pagamento === "PENDENTE").length,
  };
}

/** Total por coluna do Kanban (quantidade de pedidos + valor). */
export function totaisColuna(pedidos: Pedido[], status: StatusPedido) {
  const filtrados = pedidos.filter((p) => p.status === status);
  return {
    quantidade: filtrados.length,
    valor: filtrados.reduce((acc, p) => acc + p.valor, 0),
  };
}
