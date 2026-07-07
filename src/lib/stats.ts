import type { Pedido, Produto, CategoriaProduto } from "@/types";
import type { StatusPedido } from "@/types";

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

export interface ItemAgregado {
  nome: string;
  categoria: CategoriaProduto | "DESCONHECIDO";
  quantidade: number;
}

export interface RelatorioItens {
  /** Combos vendidos (soma das quantidades de itens categoria COMBOS). */
  combosVendidos: number;
  /** Total de itens individuais (combos expandidos nos seus componentes). */
  itensTotais: number;
  /** Quantidade vendida de cada item, já com os combos desmembrados. */
  porItem: ItemAgregado[];
  /** Quantidade total de extras adicionados. */
  extrasQuantidade: number;
  /** Valor total arrecadado com extras. */
  extrasValor: number;
  /** Quantidade vendida de cada extra. */
  porExtra: ItemAgregado[];
}

/**
 * Relatório detalhado desmembrando cada combo nos seus itens.
 * Um combo com composição "X-Burguer, Batata, Guaraná" conta como 1 combo e
 * 3 itens individuais (cada componente é contabilizado separadamente).
 */
export function calcularRelatorioItens(
  pedidos: Pedido[],
  produtos: Produto[]
): RelatorioItens {
  const categoriaPorNome = new Map<string, CategoriaProduto>(
    produtos.map((p) => [p.nome, p.categoria])
  );

  const itemMap = new Map<string, number>();
  const extraMap = new Map<string, number>();
  let combosVendidos = 0;
  let itensTotais = 0;
  let extrasQuantidade = 0;
  let extrasValor = 0;

  const somar = (mapa: Map<string, number>, nome: string, qtd: number) =>
    mapa.set(nome, (mapa.get(nome) ?? 0) + qtd);

  for (const pedido of pedidos) {
    for (const item of pedido.itens) {
      const qtd = item.quantidade;

      if (item.categoria === "COMBOS") {
        combosVendidos += qtd;
        // Desmembra o combo nos componentes gravados no snapshot da composição.
        const componentes = (item.composicao ?? "")
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
        for (const nome of componentes) {
          somar(itemMap, nome, qtd);
          itensTotais += qtd;
        }
      } else {
        somar(itemMap, item.nomeProduto, qtd);
        itensTotais += qtd;
      }

      // Extras ficam vinculados ao item; multiplicam pela quantidade da linha.
      for (const extra of item.extras) {
        somar(extraMap, extra.nomeProduto, qtd);
        extrasQuantidade += qtd;
        extrasValor += extra.valorUnitario * qtd;
      }
    }
  }

  const paraLista = (mapa: Map<string, number>): ItemAgregado[] =>
    Array.from(mapa.entries())
      .map(
        ([nome, quantidade]): ItemAgregado => ({
          nome,
          categoria: categoriaPorNome.get(nome) ?? "DESCONHECIDO",
          quantidade,
        })
      )
      .sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome));

  return {
    combosVendidos,
    itensTotais,
    porItem: paraLista(itemMap),
    extrasQuantidade,
    extrasValor,
    porExtra: paraLista(extraMap),
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
