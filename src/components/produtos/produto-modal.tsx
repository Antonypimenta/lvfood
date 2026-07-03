"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { produtoFormSchema, type ProdutoFormValues } from "@/schemas/produto";
import { useStore } from "@/store/useStore";
import { CATEGORIAS_PRODUTO, CATEGORIA_PRODUTO_LABEL } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Produto } from "@/types";

interface ProdutoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: Produto | null;
}

const defaults: ProdutoFormValues = {
  nome: "",
  descricao: "",
  preco: 0,
  categoria: "HAMBURGUERES",
  ativo: true,
  ordem: 0,
  componentesIds: [],
};

export function ProdutoModal({ open, onOpenChange, produto }: ProdutoModalProps) {
  const criarProduto = useStore((s) => s.criarProduto);
  const editarProduto = useStore((s) => s.editarProduto);
  const produtos = useStore((s) => s.produtos);
  const isEdit = Boolean(produto);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoFormSchema),
    defaultValues: defaults,
  });

  React.useEffect(() => {
    if (!open) return;
    if (produto) {
      reset({
        nome: produto.nome,
        descricao: produto.descricao ?? "",
        preco: produto.preco,
        categoria: produto.categoria,
        ativo: produto.ativo,
        ordem: produto.ordem,
        componentesIds: produto.componentes.map((c) => c.produtoId),
      });
    } else {
      reset(defaults);
    }
  }, [open, produto, reset]);

  const ativo = watch("ativo");
  const categoria = watch("categoria");
  const componentesIds = watch("componentesIds") ?? [];

  // Candidatos a compor um combo: hambúrgueres, batatas e bebidas.
  const candidatos = React.useMemo(
    () =>
      produtos.filter((p) =>
        ["HAMBURGUERES", "BATATAS", "BEBIDAS"].includes(p.categoria)
      ),
    [produtos]
  );

  function toggleComponente(id: string) {
    const atual = componentesIds;
    setValue(
      "componentesIds",
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
    );
  }

  async function onSubmit(data: ProdutoFormValues) {
    try {
      if (isEdit && produto) {
        await editarProduto(produto.id, data);
        toast.success("Produto atualizado");
      } else {
        await criarProduto(data);
        toast.success("Produto criado");
      }
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : onOpenChange(false))}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>
            Os produtos ativos aparecem no cardápio público conforme a ordem.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4"
          autoComplete="off"
        >
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" autoFocus placeholder="X-Burguer" {...register("nome")} />
            {errors.nome && (
              <p className="text-xs text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Pão, carne, queijo..."
              {...register("descricao")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="preco">Preço *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min={0}
                {...register("preco")}
              />
              {errors.preco && (
                <p className="text-xs text-destructive">{errors.preco.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                id="categoria"
                value={watch("categoria")}
                onChange={(e) =>
                  setValue(
                    "categoria",
                    e.target.value as ProdutoFormValues["categoria"]
                  )
                }
              >
                {CATEGORIAS_PRODUTO.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIA_PRODUTO_LABEL[c]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Composição do combo (hambúrguer + acompanhamento + bebida) */}
          {categoria === "COMBOS" && (
            <div className="grid gap-2 rounded-xl border border-border bg-secondary/30 p-3">
              <Label>Itens do combo</Label>
              <p className="text-xs text-muted-foreground">
                Selecione os produtos que compõem este combo. Inclua um{" "}
                <b>hambúrguer</b> para que o combo aceite extras.
              </p>
              {candidatos.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Cadastre hambúrgueres, batatas e bebidas primeiro.
                </p>
              ) : (
                <div className="grid max-h-52 gap-1.5 overflow-y-auto scrollbar-thin">
                  {candidatos.map((p) => {
                    const active = componentesIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={
                          "flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors " +
                          (active
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:bg-secondary")
                        }
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => toggleComponente(p.id)}
                            className="h-4 w-4 rounded border-slate-300 text-primary accent-green-600"
                          />
                          <span className="font-medium text-foreground">
                            {p.nome}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {CATEGORIA_PRODUTO_LABEL[p.categoria]}
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(p.preco)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ordem">Ordem de exibição</Label>
              <Input id="ordem" type="number" min={0} {...register("ordem")} />
            </div>
            <div className="grid gap-2">
              <Label>Situação</Label>
              <button
                type="button"
                onClick={() => setValue("ativo", !ativo)}
                className={
                  "flex h-10 items-center justify-between rounded-lg border px-3 text-sm font-medium transition-colors " +
                  (ativo
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-border bg-secondary text-muted-foreground")
                }
              >
                {ativo ? "Ativo" : "Inativo"}
                <span
                  className={
                    "ml-2 inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors " +
                    (ativo ? "bg-green-500" : "bg-slate-300")
                  }
                >
                  <span
                    className={
                      "h-4 w-4 rounded-full bg-white transition-transform " +
                      (ativo ? "translate-x-4" : "translate-x-0")
                    }
                  />
                </span>
              </button>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : isEdit
                  ? "Salvar alterações"
                  : "Criar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
