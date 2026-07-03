"use client";

import * as React from "react";
import { Minus, Plus, Trash2, Pencil, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCarrinho, type CarrinhoItem } from "@/store/useCarrinho";

interface CartProps {
  /** Reabre o modal de extras para editar aquele hambúrguer. */
  onEditarExtras: (item: CarrinhoItem) => void;
  onCheckout: () => void;
}

export function Cart({ onEditarExtras, onCheckout }: CartProps) {
  const itens = useCarrinho((s) => s.itens);
  const incrementar = useCarrinho((s) => s.incrementar);
  const decrementar = useCarrinho((s) => s.decrementar);
  const remover = useCarrinho((s) => s.remover);
  const subtotalLinha = useCarrinho((s) => s.subtotalLinha);
  const total = useCarrinho((s) => s.total);

  const vazio = itens.length === 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <ShoppingCart className="h-5 w-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">Seu pedido</h2>
      </div>

      {vazio ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
          <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Seu carrinho está vazio. Escolha os produtos ao lado.
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin px-4 py-4">
          {itens.map((item) => {
            const ehHamburguer = item.produto.categoria === "HAMBURGUERES";
            return (
              <div
                key={item.uid}
                className="rounded-xl border border-border bg-card p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {item.produto.nome}
                    </p>
                    {item.extras.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {item.extras.map((e) => (
                          <li
                            key={e.id}
                            className="text-xs text-muted-foreground"
                          >
                            + {e.nome}{" "}
                            <span className="text-primary">
                              ({formatCurrency(e.preco)})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    onClick={() => remover(item.uid)}
                    className="rounded-md p-1 text-red-500 transition-colors hover:bg-red-50"
                    aria-label="Remover item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decrementar(item.uid)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary"
                      aria-label="Diminuir"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-foreground">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => incrementar(item.uid)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary"
                      aria-label="Aumentar"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>

                    {ehHamburguer && (
                      <button
                        onClick={() => onEditarExtras(item)}
                        className="ml-1 flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
                      >
                        <Pencil className="h-3 w-3" /> Extras
                      </button>
                    )}
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(subtotalLinha(item))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!vazio && (
        <div className="border-t border-border px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-extrabold text-primary">
              {formatCurrency(total())}
            </span>
          </div>
          <Button onClick={onCheckout} size="lg" className="w-full">
            Finalizar pedido
          </Button>
        </div>
      )}
    </div>
  );
}
