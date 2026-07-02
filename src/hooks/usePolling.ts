"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { POLL_INTERVAL } from "@/lib/constants";

/**
 * Carrega os dados na montagem e mantém tudo sincronizado por polling leve.
 * Pausa o polling quando a aba não está visível (economiza recursos).
 */
export function usePolling() {
  const fetchAll = useStore((s) => s.fetchAll);

  useEffect(() => {
    let ativo = true;

    const tick = () => {
      if (document.visibilityState === "visible") {
        fetchAll().catch(() => {});
      }
    };

    // carga inicial
    fetchAll().catch(() => {});

    const id = setInterval(() => {
      if (ativo) tick();
    }, POLL_INTERVAL);

    return () => {
      ativo = false;
      clearInterval(id);
    };
  }, [fetchAll]);
}
