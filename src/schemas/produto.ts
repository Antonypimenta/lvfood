import { z } from "zod";

export const categoriaProdutoEnum = z.enum([
  "COMBOS",
  "HAMBURGUERES",
  "BATATAS",
  "BEBIDAS",
  "EXTRAS",
]);

/** Schema do formulário de cadastro/edição de produto. */
export const produtoFormSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome"),
  descricao: z.string().trim().optional().or(z.literal("")),
  preco: z.coerce.number().min(0, "Preço inválido"),
  categoria: categoriaProdutoEnum,
  ativo: z.boolean().default(true),
  ordem: z.coerce.number().int().min(0).default(0),
  /** IDs dos produtos que compõem o combo (só usado quando categoria = COMBOS). */
  componentesIds: z.array(z.string()).default([]),
});

export type ProdutoFormValues = z.infer<typeof produtoFormSchema>;

/** Payload aceito pela API na criação. */
export const criarProdutoSchema = produtoFormSchema;

/** Payload de atualização parcial (editar / ativar / reordenar). */
export const atualizarProdutoSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  descricao: z.string().trim().nullable().optional(),
  preco: z.coerce.number().min(0).optional(),
  categoria: categoriaProdutoEnum.optional(),
  ativo: z.boolean().optional(),
  ordem: z.coerce.number().int().min(0).optional(),
  componentesIds: z.array(z.string()).optional(),
});
