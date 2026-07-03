import type {
  StatusPedido,
  FormaPagamento,
  StatusPagamento,
  StatusEntregador,
  CategoriaProduto,
} from "@/types";

/** Categorias disponíveis no módulo Produtos. */
export const CATEGORIAS_PRODUTO: CategoriaProduto[] = [
  "COMBOS",
  "HAMBURGUERES",
  "BATATAS",
  "BEBIDAS",
  "EXTRAS",
];

export const CATEGORIA_PRODUTO_LABEL: Record<CategoriaProduto, string> = {
  COMBOS: "Combos",
  HAMBURGUERES: "Hambúrgueres",
  BATATAS: "Batatas",
  BEBIDAS: "Bebidas",
  EXTRAS: "Extras",
};

/**
 * Ordem em que as categorias aparecem no cardápio público, abaixo dos Combos.
 * Extras NUNCA aparece no cardápio principal (só como adicional de hambúrguer).
 */
export const CATEGORIAS_CARDAPIO: CategoriaProduto[] = [
  "HAMBURGUERES",
  "BATATAS",
  "BEBIDAS",
];

/** Emoji de cada categoria — usado no cardápio público. */
export const CATEGORIA_EMOJI: Record<CategoriaProduto, string> = {
  COMBOS: "⭐",
  HAMBURGUERES: "🍔",
  BATATAS: "🍟",
  BEBIDAS: "🥤",
  EXTRAS: "➕",
};

/** Cores sugestivas por categoria (acento visual no cardápio público). */
export const CATEGORIA_COR: Record<
  CategoriaProduto,
  { chip: string; ring: string }
> = {
  COMBOS: {
    chip: "bg-amber-100 text-amber-700",
    ring: "border-amber-200",
  },
  HAMBURGUERES: {
    chip: "bg-orange-100 text-orange-700",
    ring: "border-orange-200",
  },
  BATATAS: {
    chip: "bg-yellow-100 text-yellow-700",
    ring: "border-yellow-200",
  },
  BEBIDAS: {
    chip: "bg-sky-100 text-sky-700",
    ring: "border-sky-200",
  },
  EXTRAS: {
    chip: "bg-emerald-100 text-emerald-700",
    ring: "border-emerald-200",
  },
};

export const STATUS_PEDIDO: StatusPedido[] = [
  "EM_PREPARO",
  "PRONTO",
  "EM_ENTREGA",
  "ENTREGUE",
];

export const STATUS_PEDIDO_LABEL: Record<StatusPedido, string> = {
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto",
  EM_ENTREGA: "Em entrega",
  ENTREGUE: "Entregue",
};

/** Classes de cor por status do pedido (badge). */
export const STATUS_PEDIDO_BADGE: Record<StatusPedido, string> = {
  EM_PREPARO: "bg-amber-100 text-amber-700 border-amber-200",
  PRONTO: "bg-green-100 text-green-700 border-green-200",
  EM_ENTREGA: "bg-blue-100 text-blue-700 border-blue-200",
  ENTREGUE: "bg-slate-100 text-slate-600 border-slate-200",
};

/** Cor do "cabeçalho" de cada coluna do Kanban. */
export const STATUS_PEDIDO_DOT: Record<StatusPedido, string> = {
  EM_PREPARO: "bg-amber-400",
  PRONTO: "bg-green-500",
  EM_ENTREGA: "bg-blue-500",
  ENTREGUE: "bg-slate-400",
};

/** Cor do card no Kanban por status: borda inteira colorida + fundo definido. */
export const STATUS_PEDIDO_CARD: Record<StatusPedido, string> = {
  EM_PREPARO: "border-2 border-amber-400 bg-amber-50",
  PRONTO: "border-2 border-green-500 bg-green-50",
  EM_ENTREGA: "border-2 border-blue-500 bg-blue-50",
  ENTREGUE: "border-2 border-slate-300 bg-slate-100",
};

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  PIX: "PIX",
  DINHEIRO: "Dinheiro",
  CARTAO: "Cartão",
};

export const STATUS_PAGAMENTO_LABEL: Record<StatusPagamento, string> = {
  PAGO: "Pago",
  PENDENTE: "Pendente",
};

export const STATUS_PAGAMENTO_BADGE: Record<StatusPagamento, string> = {
  PAGO: "bg-green-100 text-green-700 border-green-200",
  PENDENTE: "bg-red-100 text-red-700 border-red-200",
};

export const STATUS_ENTREGADOR_LABEL: Record<StatusEntregador, string> = {
  DISPONIVEL: "Disponível",
  EM_ENTREGA: "Em entrega",
};

export const STATUS_ENTREGADOR_DOT: Record<StatusEntregador, string> = {
  DISPONIVEL: "bg-green-500",
  EM_ENTREGA: "bg-blue-500",
};

/** Limites do cronômetro (em minutos). */
export const TEMPO_ATENCAO = 30;
export const TEMPO_CRITICO = 45;

/** Intervalo de polling para atualização "em tempo real" (ms). */
export const POLL_INTERVAL = 3000;
