"use client";

import { create } from "zustand";
import type { Pedido } from "@/types";
import type { PedidoClienteValues } from "@/schemas/pedido";

/** Valores usados para pré-preencher o modal ao duplicar um pedido. */
export interface PedidoPrefill {
  cliente?: Partial<PedidoClienteValues>;
  itens?: { produtoId: string; quantidade: number; extrasIds: string[] }[];
}

interface UiState {
  // Modal de pedido (novo / editar / duplicar)
  pedidoModalOpen: boolean;
  pedidoEmEdicao: Pedido | null;
  prefill: PedidoPrefill | null;

  abrirNovoPedido: () => void;
  abrirEdicao: (pedido: Pedido) => void;
  abrirDuplicar: (prefill: PedidoPrefill) => void;
  fecharPedidoModal: () => void;

  // Foco na busca global (CTRL+K)
  focarBuscaToken: number;
  dispararFoco: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  pedidoModalOpen: false,
  pedidoEmEdicao: null,
  prefill: null,

  abrirNovoPedido: () =>
    set({
      pedidoModalOpen: true,
      pedidoEmEdicao: null,
      prefill: null,
    }),

  abrirEdicao: (pedido) =>
    set({
      pedidoModalOpen: true,
      pedidoEmEdicao: pedido,
      prefill: null,
    }),

  abrirDuplicar: (prefill) =>
    set({
      pedidoModalOpen: true,
      pedidoEmEdicao: null,
      prefill,
    }),

  fecharPedidoModal: () =>
    set({
      pedidoModalOpen: false,
      pedidoEmEdicao: null,
      prefill: null,
    }),

  focarBuscaToken: 0,
  dispararFoco: () => set((s) => ({ focarBuscaToken: s.focarBuscaToken + 1 })),
}));
