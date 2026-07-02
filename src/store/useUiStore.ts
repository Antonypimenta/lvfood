"use client";

import { create } from "zustand";
import type { Pedido } from "@/types";
import type { PedidoFormValues } from "@/schemas/pedido";

interface UiState {
  // Modal de pedido (novo / editar / duplicar)
  pedidoModalOpen: boolean;
  pedidoEmEdicao: Pedido | null;
  valoresIniciais: Partial<PedidoFormValues> | null;

  abrirNovoPedido: () => void;
  abrirEdicao: (pedido: Pedido) => void;
  abrirDuplicar: (valores: Partial<PedidoFormValues>) => void;
  fecharPedidoModal: () => void;

  // Foco na busca global (CTRL+K)
  focarBuscaToken: number;
  dispararFoco: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  pedidoModalOpen: false,
  pedidoEmEdicao: null,
  valoresIniciais: null,

  abrirNovoPedido: () =>
    set({
      pedidoModalOpen: true,
      pedidoEmEdicao: null,
      valoresIniciais: null,
    }),

  abrirEdicao: (pedido) =>
    set({
      pedidoModalOpen: true,
      pedidoEmEdicao: pedido,
      valoresIniciais: null,
    }),

  abrirDuplicar: (valores) =>
    set({
      pedidoModalOpen: true,
      pedidoEmEdicao: null,
      valoresIniciais: valores,
    }),

  fecharPedidoModal: () =>
    set({
      pedidoModalOpen: false,
      pedidoEmEdicao: null,
      valoresIniciais: null,
    }),

  focarBuscaToken: 0,
  dispararFoco: () => set((s) => ({ focarBuscaToken: s.focarBuscaToken + 1 })),
}));
