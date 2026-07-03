import { z } from "zod";

export const formaPagamentoEnum = z.enum(["PIX", "DINHEIRO", "CARTAO"]);
export const statusPagamentoEnum = z.enum(["PAGO", "PENDENTE"]);
export const statusPedidoEnum = z.enum([
  "EM_PREPARO",
  "PRONTO",
  "EM_ENTREGA",
  "ENTREGUE",
]);

/** Dados do cliente/entrega — compartilhado por checkout e edição. */
export const pedidoClienteSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome"),
  telefone: z
    .string()
    .trim()
    .min(8, "Telefone inválido")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone inválido"),
  bairro: z.string().trim().min(1, "Informe o bairro"),
  endereco: z.string().trim().min(1, "Informe o endereço"),
  complemento: z.string().trim().optional().or(z.literal("")),
  observacoes: z.string().trim().optional().or(z.literal("")),
  formaPagamento: formaPagamentoEnum,
  pagamento: statusPagamentoEnum,
  troco: z.coerce.number().min(0).optional().nullable(),
});

export type PedidoClienteValues = z.infer<typeof pedidoClienteSchema>;

/** Formulário de checkout público (o status de pagamento inicia como PENDENTE). */
export const checkoutFormSchema = pedidoClienteSchema.omit({ pagamento: true });
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

/** Extra vinculado a um item do pedido (apenas hambúrgueres). */
export const checkoutExtraSchema = z.object({
  produtoId: z.string().min(1),
});

/** Item enviado no checkout — o preço é sempre recalculado no servidor. */
export const checkoutItemSchema = z.object({
  produtoId: z.string().min(1),
  quantidade: z.coerce.number().int().min(1),
  extras: z.array(checkoutExtraSchema).default([]),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;

/** Payload aceito pela API na criação de um pedido (checkout com itens). */
export const criarPedidoSchema = pedidoClienteSchema.extend({
  itens: z.array(checkoutItemSchema).min(1, "Adicione ao menos um item"),
});

export type CriarPedidoInput = z.infer<typeof criarPedidoSchema>;

/** Payload de atualização parcial (drag-and-drop, edição, pagamento). */
export const atualizarPedidoSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  telefone: z.string().trim().min(8).optional(),
  bairro: z.string().trim().min(1).optional(),
  endereco: z.string().trim().min(1).optional(),
  complemento: z.string().trim().nullable().optional(),
  observacoes: z.string().trim().nullable().optional(),
  formaPagamento: formaPagamentoEnum.optional(),
  pagamento: statusPagamentoEnum.optional(),
  troco: z.coerce.number().min(0).nullable().optional(),
  status: statusPedidoEnum.optional(),
  entregadorId: z.string().nullable().optional(),
});

export const criarRotaSchema = z.object({
  pedidoIds: z.array(z.string()).min(1, "Selecione ao menos um pedido"),
  entregadorId: z.string().min(1, "Selecione um entregador"),
});

export const entregadorSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome"),
});

export const configSchema = z.object({
  nomeEvento: z.string().trim().min(1, "Informe o nome do evento"),
  valorCombo: z.coerce.number().min(0, "Valor inválido"),
});

export type ConfigFormValues = z.infer<typeof configSchema>;
export type EntregadorFormValues = z.infer<typeof entregadorSchema>;
