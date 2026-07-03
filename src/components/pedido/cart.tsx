"use client";

import * as React from "react";
import { Minus, Plus, Trash2, Pencil, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { CATEGORIA_EMOJI } from "@/lib/constants";
import { aceitaExtras, composicaoTexto } from "@/lib/produto";
import { useCarrinho, type CarrinhoItem } from "@/store/useCarrinho";

interface CartProps {
  /** Reabre o modal de extras para editar aquele hambúrguer/combo. */
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
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShoppingCart className="h-4.5 w-4.5" />
        </span>
        <h2 className="text-base font-extrabold text-slate-800">Seu pedido</h2>
      </div>

      {vazio ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <div className="text-5xl">🛒</div>
          <p className="text-sm text-muted-foreground">
            Seu carrinho está vazio.
            <br />
            Toque nos produtos para adicionar.
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin px-3 py-3">
          {itens.map((item) => {
            const composicao =
              item.produto.categoria === "COMBOS"
                ? composicaoTexto(item.produto)
                : "";
            const podeExtras = aceitaExtras(item.produto);
            return (
              <div
                key={item.uid}
                className="rounded-2xl border border-border bg-white p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-bold text-slate-800">
                      <span>{CATEGORIA_EMOJI[item.produto.categoria]}</span>
                      {item.produto.nome}
                    </p>
                    {composicao && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {composicao}
                      </p>
                    )}
                    {item.extras.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {item.extras.map((e) => (
                          <li key={e.id} className="text-xs text-emerald-600">
                            ➕ {e.nome}{" "}
                            <span className="text-muted-foreground">
                              ({formatCurrency(e.preco)})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    onClick={() => remover(item.uid)}
                    className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Remover item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => decrementar(item.uid)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-slate-600 transition-colors hover:bg-slate-200"
                      aria-label="Diminuir"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-slate-800">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => incrementar(item.uid)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-slate-600 transition-colors hover:bg-slate-200"
                      aria-label="Aumentar"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                    {podeExtras && (
                      <button
                        onClick={() => onEditarExtras(item)}
                        className="ml-1 flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        <Pencil className="h-3 w-3" /> Extras
                      </button>
                    )}
                  </div>
                  <span className="text-sm font-extrabold text-slate-800">
                    {formatCurrency(subtotalLinha(item))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!vazio && (
        <div className="border-t border-border bg-card px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Total
            </span>
            <span className="text-2xl font-black text-primary">
              {formatCurrency(total())}
            </span>
          </div>
          <Button onClick={onCheckout} size="lg" className="w-full text-base font-bold">
            Finalizar pedido 🚀
          </Button>
        </div>
      )}
    </div>
  );
}
