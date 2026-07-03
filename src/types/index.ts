export type StatusPedido =
  | "EM_PREPARO"
  | "PRONTO"
  | "EM_ENTREGA"
  | "ENTREGUE";

export type FormaPagamento = "PIX" | "DINHEIRO" | "CARTAO";

export type StatusPagamento = "PAGO" | "PENDENTE";

export type StatusEntregador = "DISPONIVEL" | "EM_ENTREGA";

export type CategoriaProduto =
  | "COMBOS"
  | "HAMBURGUERES"
  | "BATATAS"
  | "BEBIDAS"
  | "EXTRAS";

export interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: CategoriaProduto;
  ativo: boolean;
  ordem: number;
  createdAt: string;
}

export interface ItemExtra {
  id: string;
  produtoId: string | null;
  nomeProduto: string;
  valorUnitario: number;
}

export interface PedidoItem {
  id: string;
  produtoId: string | null;
  nomeProduto: string;
  categoria: CategoriaProduto;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  extras: ItemExtra[];
}

export interface Entregador {
  id: string;
  nome: string;
  status: StatusEntregador;
  createdAt: string;
}

export interface Pedido {
  id: string;
  numero: number;
  nome: string;
  telefone: string;
  bairro: string;
  endereco: string;
  complemento: string | null;
  quantidade: number;
  observacoes: string | null;
  formaPagamento: FormaPagamento;
  pagamento: StatusPagamento;
  troco: number | null;
  valor: number;
  status: StatusPedido;
  horarioSaida: string | null;
  entregadorId: string | null;
  entregador: Entregador | null;
  itens: PedidoItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Configuracao {
  id: string;
  nomeEvento: string;
  valorCombo: number;
}

/** Entregador com contagem de pedidos ativos/do dia. */
export interface EntregadorComPedidos extends Entregador {
  pedidos: Pedido[];
}
