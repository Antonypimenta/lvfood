"use client";

import { create } from "zustand";
import type { Produto } from "@/types";
import { aceitaExtras } from "@/lib/produto";

/** Linha do carrinho. Cada hambúrguer é uma linha própria (extras exclusivos). */
export interface CarrinhoItem {
  uid: string;
  produto: Produto;
  quantidade: number;
  /** Extras vinculados exclusivamente a esta linha (apenas hambúrgueres). */
  extras: Produto[];
}

let seq = 0;
const novoUid = () => `linha-${Date.now()}-${seq++}`;

interface CarrinhoState {
  itens: CarrinhoItem[];
  /** Adiciona um produto. Retorna o uid da linha criada/atualizada. */
  adicionar: (produto: Produto) => string;
  incrementar: (uid: string) => void;
  decrementar: (uid: string) => void;
  remover: (uid: string) => void;
  definirExtras: (uid: string, extras: Produto[]) => void;
  limpar: () => void;
  subtotalLinha: (item: CarrinhoItem) => number;
  total: () => number;
  totalItens: () => number;
}

export const useCarrinho = create<CarrinhoState>((set, get) => ({
  itens: [],

  adicionar: (produto) => {
    // Produtos que não aceitam extras agrupam na mesma linha (soma quantidade).
    // Hambúrgueres e combos com hambúrguer viram linha própria (extras exclusivos).
    if (!aceitaExtras(produto)) {
      const existente = get().itens.find(
        (i) => i.produto.id === produto.id && i.extras.length === 0
      );
      if (existente) {
        set((s) => ({
          itens: s.itens.map((i) =>
            i.uid === existente.uid
              ? { ...i, quantidade: i.quantidade + 1 }
              : i
          ),
        }));
        return existente.uid;
      }
    }
    const uid = novoUid();
    set((s) => ({
      itens: [...s.itens, { uid, produto, quantidade: 1, extras: [] }],
    }));
    return uid;
  },

  incrementar: (uid) =>
    set((s) => ({
      itens: s.itens.map((i) =>
        i.uid === uid ? { ...i, quantidade: i.quantidade + 1 } : i
      ),
    })),

  decrementar: (uid) =>
    set((s) => ({
      itens: s.itens
        .map((i) =>
          i.uid === uid ? { ...i, quantidade: i.quantidade - 1 } : i
        )
        .filter((i) => i.quantidade > 0),
    })),

  remover: (uid) =>
    set((s) => ({ itens: s.itens.filter((i) => i.uid !== uid) })),

  definirExtras: (uid, extras) =>
    set((s) => ({
      itens: s.itens.map((i) => (i.uid === uid ? { ...i, extras } : i)),
    })),

  limpar: () => set({ itens: [] }),

  subtotalLinha: (item) => {
    const somaExtras = item.extras.reduce((acc, e) => acc + e.preco, 0);
    return (item.produto.preco + somaExtras) * item.quantidade;
  },

  total: () =>
    get().itens.reduce((acc, i) => acc + get().subtotalLinha(i), 0),

  totalItens: () => get().itens.reduce((acc, i) => acc + i.quantidade, 0),
}));
