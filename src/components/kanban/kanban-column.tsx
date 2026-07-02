"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn, formatCurrency } from "@/lib/utils";
import { STATUS_PEDIDO_DOT, STATUS_PEDIDO_LABEL } from "@/lib/constants";
import type { Pedido, StatusPedido } from "@/types";

interface KanbanColumnProps {
  status: StatusPedido;
  pedidos: Pedido[];
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export function KanbanColumn({
  status,
  pedidos,
  children,
  headerAction,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const valorTotal = pedidos.reduce((acc, p) => acc + p.valor, 0);

  return (
    <div className="flex min-w-[280px] flex-1 flex-col">
      {/* Cabeçalho da coluna */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_PEDIDO_DOT[status])} />
          <h3 className="text-sm font-semibold text-foreground">
            {STATUS_PEDIDO_LABEL[status]}
          </h3>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {pedidos.length}
          </span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {formatCurrency(valorTotal)}
        </span>
      </div>

      {headerAction}

      {/* Área de drop */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-1 flex-col gap-3 rounded-xl border-2 border-dashed border-transparent p-1 transition-colors",
          isOver && "border-primary/40 bg-primary/5"
        )}
      >
        {children}
        {pedidos.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg py-8 text-xs text-muted-foreground/60">
            Sem pedidos
          </div>
        )}
      </div>
    </div>
  );
}
