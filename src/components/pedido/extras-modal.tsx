"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Produto } from "@/types";

interface ExtrasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Nome do hambúrguer que está recebendo os extras. */
  nomeHamburguer: string;
  /** Todos os extras cadastrados. */
  extrasDisponiveis: Produto[];
  /** Extras já selecionados (ao editar). */
  selecionados: Produto[];
  onConfirm: (extras: Produto[]) => void;
  /** Texto do botão de confirmação (varia entre adicionar/editar). */
  confirmLabel?: string;
}

export function ExtrasModal({
  open,
  onOpenChange,
  nomeHamburguer,
  extrasDisponiveis,
  selecionados,
  onConfirm,
  confirmLabel = "Adicionar ao carrinho",
}: ExtrasModalProps) {
  const [ids, setIds] = React.useState<Set<string>>(new Set());

  // Sincroniza a seleção sempre que o modal abre.
  React.useEffect(() => {
    if (open) setIds(new Set(selecionados.map((e) => e.id)));
  }, [open, selecionados]);

  function toggle(id: string) {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmar() {
    onConfirm(extrasDisponiveis.filter((e) => ids.has(e.id)));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>➕ Deseja adicionar extras?</DialogTitle>
          <DialogDescription>
            Extras para <b>{nomeHamburguer}</b> 🍔 — ficam vinculados apenas a
            este item.
          </DialogDescription>
        </DialogHeader>

        {extrasDisponiveis.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhum extra disponível no momento.
          </p>
        ) : (
          <div className="grid max-h-[50vh] gap-2 overflow-y-auto scrollbar-thin py-1">
            {extrasDisponiveis.map((extra) => {
              const active = ids.has(extra.id);
              return (
                <label
                  key={extra.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 text-sm transition-all",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-slate-300 hover:bg-secondary"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggle(extra.id)}
                      className="h-4 w-4 rounded border-slate-300 text-primary accent-green-600"
                    />
                    <span className="font-medium text-foreground">
                      {extra.nome}
                    </span>
                  </span>
                  <span className="font-semibold text-primary">
                    +{formatCurrency(extra.preco)}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Pular
          </Button>
          <Button onClick={confirmar}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
