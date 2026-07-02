export type StatusPedido =
  | "EM_PREPARO"
  | "PRONTO"
  | "EM_ENTREGA"
  | "ENTREGUE";

export type FormaPagamento = "PIX" | "DINHEIRO" | "CARTAO";

export type StatusPagamento = "PAGO" | "PENDENTE";

export type StatusEntregador = "DISPONIVEL" | "EM_ENTREGA";

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
  quantidade: number;
  observacoes: string | null;
  formaPagamento: FormaPagamento;
  pagamento: StatusPagamento;
  valor: number;
  status: StatusPedido;
  horarioSaida: string | null;
  entregadorId: string | null;
  entregador: Entregador | null;
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
