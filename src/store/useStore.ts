"use client";

import { create } from "zustand";
import type {
  Pedido,
  EntregadorComPedidos,
  Configuracao,
  StatusPedido,
} from "@/types";
import type { PedidoFormValues } from "@/schemas/pedido";

interface StoreState {
  pedidos: Pedido[];
  entregadores: EntregadorComPedidos[];
  config: Configuracao | null;
  loaded: boolean;

  // busca / carga
  fetchAll: () => Promise<void>;

  // pedidos
  criarPedido: (data: PedidoFormValues) => Promise<Pedido | null>;
  editarPedido: (id: string, data: Partial<PedidoFormValues>) => Promise<void>;
  moverPedido: (id: string, status: StatusPedido) => Promise<void>;
  alternarPagamento: (id: string) => Promise<void>;
  excluirPedido: (id: string) => Promise<void>;

  // rotas / entregadores
  criarRota: (pedidoIds: string[], entregadorId: string) => Promise<void>;
  finalizarRota: (entregadorId: string) => Promise<void>;
  criarEntregador: (nome: string) => Promise<void>;
  excluirEntregador: (id: string) => Promise<void>;

  // config
  salvarConfig: (data: {
    nomeEvento: string;
    valorCombo: number;
  }) => Promise<void>;
  limparSistema: () => Promise<void>;
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || "Erro na requisição");
  }
  return res.json();
}

export const useStore = create<StoreState>((set, get) => ({
  pedidos: [],
  entregadores: [],
  config: null,
  loaded: false,

  fetchAll: async () => {
    const [pedidos, entregadores, config] = await Promise.all([
      api<Pedido[]>("/api/pedidos"),
      api<EntregadorComPedidos[]>("/api/entregadores"),
      api<Configuracao>("/api/config"),
    ]);
    set({ pedidos, entregadores, config, loaded: true });
  },

  criarPedido: async (data) => {
    const pedido = await api<Pedido>("/api/pedidos", {
      method: "POST",
      body: JSON.stringify(data),
    });
    set((s) => ({ pedidos: [pedido, ...s.pedidos] }));
    return pedido;
  },

  editarPedido: async (id, data) => {
    const atualizado = await api<Pedido>(`/api/pedidos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    set((s) => ({
      pedidos: s.pedidos.map((p) => (p.id === id ? atualizado : p)),
    }));
    await get().fetchAll();
  },

  moverPedido: async (id, status) => {
    // Optimistic: move imediatamente no estado.
    const anterior = get().pedidos;
    set((s) => ({
      pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, status } : p)),
    }));
    try {
      await api<Pedido>(`/api/pedidos/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      set({ pedidos: anterior }); // rollback
      throw e;
    }
  },

  alternarPagamento: async (id) => {
    const pedido = get().pedidos.find((p) => p.id === id);
    if (!pedido) return;
    const novo = pedido.pagamento === "PAGO" ? "PENDENTE" : "PAGO";
    const anterior = get().pedidos;
    set((s) => ({
      pedidos: s.pedidos.map((p) =>
        p.id === id ? { ...p, pagamento: novo } : p
      ),
    }));
    try {
      await api(`/api/pedidos/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ pagamento: novo }),
      });
    } catch (e) {
      set({ pedidos: anterior });
      throw e;
    }
  },

  excluirPedido: async (id) => {
    await api(`/api/pedidos/${id}`, { method: "DELETE" });
    set((s) => ({ pedidos: s.pedidos.filter((p) => p.id !== id) }));
  },

  criarRota: async (pedidoIds, entregadorId) => {
    await api("/api/pedidos/rota", {
      method: "POST",
      body: JSON.stringify({ pedidoIds, entregadorId }),
    });
    await get().fetchAll();
  },

  finalizarRota: async (entregadorId) => {
    await api(`/api/entregadores/${entregadorId}`, { method: "POST" });
    await get().fetchAll();
  },

  criarEntregador: async (nome) => {
    await api("/api/entregadores", {
      method: "POST",
      body: JSON.stringify({ nome }),
    });
    await get().fetchAll();
  },

  excluirEntregador: async (id) => {
    await api(`/api/entregadores/${id}`, { method: "DELETE" });
    await get().fetchAll();
  },

  salvarConfig: async (data) => {
    const config = await api<Configuracao>("/api/config", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    set({ config });
  },

  limparSistema: async () => {
    await api("/api/limpar", { method: "POST" });
    await get().fetchAll();
  },
}));
