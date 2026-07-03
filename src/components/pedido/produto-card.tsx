"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { CATEGORIA_EMOJI, CATEGORIA_COR } from "@/lib/constants";
import { composicaoTexto } from "@/lib/produto";
import type { Produto } from "@/types";

interface ProdutoCardProps {
  produto: Produto;
  /** Combos recebem um destaque visual maior. */
  destaque?: boolean;
  onAdd: (produto: Produto) => void;
}

export function ProdutoCard({ produto, destaque, onAdd }: ProdutoCardProps) {
  const emoji = CATEGORIA_EMOJI[produto.categoria];

  if (destaque) {
    const composicao = composicaoTexto(produto);
    return (
      <button
        type="button"
        onClick={() => onAdd(produto)}
        className="group flex w-full flex-col justify-between gap-3 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-4 text-left shadow-sm transition-all hover:border-amber-300 hover:shadow-md active:scale-[0.99]"
      >
        <div>
          <div className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-sm">
            ⭐ Combo
          </div>
          <h3 className="text-lg font-extrabold leading-tight text-slate-800">
            {produto.nome}
          </h3>
          {composicao ? (
            <p className="mt-1 text-sm text-slate-600">🍔 {composicao}</p>
          ) : (
            produto.descricao && (
              <p className="mt-1 text-sm text-slate-600">{produto.descricao}</p>
            )
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-2xl font-black text-primary">
            {formatCurrency(produto.preco)}
          </span>
          <span className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform group-hover:scale-105">
            <Plus className="h-4 w-4" /> Adicionar
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onAdd(produto)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl border bg-card p-3 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99]",
        CATEGORIA_COR[produto.categoria].ring
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl">
        {emoji}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold leading-tight text-slate-800">{produto.nome}</h3>
        {produto.descricao && (
          <p className="truncate text-xs text-muted-foreground">
            {produto.descricao}
          </p>
        )}
        <span className="mt-0.5 block text-sm font-extrabold text-primary">
          {formatCurrency(produto.preco)}
        </span>
      </div>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform group-hover:scale-110"
        aria-hidden
      >
        <Plus className="h-5 w-5" />
      </span>
    </button>
  );
}
