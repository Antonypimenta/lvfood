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
};

export function ProdutoModal({ open, onOpenChange, produto }: ProdutoModalProps) {
  const criarProduto = useStore((s) => s.criarProduto);
  const editarProduto = useStore((s) => s.editarProduto);
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
      });
    } else {
      reset(defaults);
    }
  }, [open, produto, reset]);

  const ativo = watch("ativo");

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
