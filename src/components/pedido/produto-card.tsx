"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { Produto } from "@/types";

interface ProdutoCardProps {
  produto: Produto;
  /** Combos recebem um destaque visual maior. */
  destaque?: boolean;
  onAdd: (produto: Produto) => void;
}

export function ProdutoCard({ produto, destaque, onAdd }: ProdutoCardProps) {
  if (destaque) {
    return (
      <div className="flex flex-col justify-between gap-3 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5 shadow-sm transition-shadow hover:shadow-md">
        <div>
          <div className="mb-1 inline-flex rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
            Combo
          </div>
          <h3 className="text-lg font-bold text-foreground">{produto.nome}</h3>
          {produto.descricao && (
            <p className="mt-1 text-sm text-muted-foreground">
              {produto.descricao}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xl font-extrabold text-primary">
            {formatCurrency(produto.preco)}
          </span>
          <Button onClick={() => onAdd(produto)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      )}
    >
      <div className="min-w-0">
        <h3 className="font-semibold text-foreground">{produto.nome}</h3>
        {produto.descricao && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {produto.descricao}
          </p>
        )}
        <span className="mt-1 block text-sm font-bold text-primary">
          {formatCurrency(produto.preco)}
        </span>
      </div>
      <Button
        size="icon"
        variant="outline"
        onClick={() => onAdd(produto)}
        aria-label={`Adicionar ${produto.nome}`}
        className="shrink-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
