"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  activeClass?: string;
}

/**
 * Grupo de "botões-rádio" no estilo segmented control — 1 clique, acessível
 * por teclado (setas / TAB) via inputs rádio nativos ocultos.
 */
export function RadioGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
}) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      role="radiogroup"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? opt.activeClass ??
                    "border-primary bg-primary/5 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-slate-300 hover:bg-secondary"
            )}
          >
            <input
              type="radio"
              className="sr-only"
              checked={active}
              onChange={() => onChange(opt.value)}
            />
            {opt.icon}
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
