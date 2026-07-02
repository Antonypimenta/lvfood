"use client";

import { useEffect, useState } from "react";
import { TEMPO_ATENCAO, TEMPO_CRITICO } from "@/lib/constants";

export type NivelTempo = "normal" | "atencao" | "critico";

interface TempoInfo {
  minutos: number;
  label: string;
  nivel: NivelTempo;
}

/**
 * Cronômetro derivado de `createdAt`. Atualiza a cada 30s (suficiente para
 * granularidade de minutos) sem re-render pesado.
 */
export function useTempo(createdAt: string, ativo = true): TempoInfo {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (!ativo) return;
    const id = setInterval(() => setAgora(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [ativo]);

  const inicio = new Date(createdAt).getTime();
  const minutos = Math.max(0, Math.floor((agora - inicio) / 60_000));

  let nivel: NivelTempo = "normal";
  if (minutos >= TEMPO_CRITICO) nivel = "critico";
  else if (minutos >= TEMPO_ATENCAO) nivel = "atencao";

  const label = minutos < 60 ? `${minutos} min` : `${Math.floor(minutos / 60)}h${String(minutos % 60).padStart(2, "0")}`;

  return { minutos, label, nivel };
}
