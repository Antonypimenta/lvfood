"use client";

import { useEffect } from "react";
import { useUiStore } from "@/store/useUiStore";

/**
 * Atalhos globais:
 *  - CTRL/CMD + N  → novo pedido
 *  - CTRL/CMD + K  → focar busca
 */
export function useAtalhos() {
  const abrirNovoPedido = useUiStore((s) => s.abrirNovoPedido);
  const dispararFoco = useUiStore((s) => s.dispararFoco);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "n") {
        e.preventDefault();
        abrirNovoPedido();
      } else if (key === "k") {
        e.preventDefault();
        dispararFoco();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [abrirNovoPedido, dispararFoco]);
}
