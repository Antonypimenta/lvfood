import { z } from "zod";

export const formaPagamentoEnum = z.enum(["PIX", "DINHEIRO", "CARTAO"]);
export const statusPagamentoEnum = z.enum(["PAGO", "PENDENTE"]);
export const statusPedidoEnum = z.enum([
  "EM_PREPARO",
  "PRONTO",
  "EM_ENTREGA",
  "ENTREGUE",
]);

/** Schema do formulário de cadastro/edição de pedido (sem valor: calculado). */
export const pedidoFormSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome"),
  telefone: z
    .string()
    .trim()
    .min(8, "Telefone inválido")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone inválido"),
  bairro: z.string().trim().min(1, "Informe o bairro"),
  endereco: z.string().trim().min(1, "Informe o endereço"),
  quantidade: z.coerce.number().int().min(1, "Mínimo 1 combo"),
  observacoes: z.string().trim().optional().or(z.literal("")),
  formaPagamento: formaPagamentoEnum,
  pagamento: statusPagamentoEnum,
});

export type PedidoFormValues = z.infer<typeof pedidoFormSchema>;

/** Payload aceito pela API na criação. */
export const criarPedidoSchema = pedidoFormSchema;

/** Payload de atualização parcial (drag-and-drop, edição, pagamento). */
export const atualizarPedidoSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  telefone: z.string().trim().min(8).optional(),
  bairro: z.string().trim().min(1).optional(),
  endereco: z.string().trim().min(1).optional(),
  quantidade: z.coerce.number().int().min(1).optional(),
  observacoes: z.string().trim().nullable().optional(),
  formaPagamento: formaPagamentoEnum.optional(),
  pagamento: statusPagamentoEnum.optional(),
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
