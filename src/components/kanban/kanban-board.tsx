"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Send } from "lucide-react";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { CriarRotaModal } from "./criar-rota-modal";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { toast } from "@/components/ui/toast";
import { STATUS_PEDIDO } from "@/lib/constants";
import type { Pedido, StatusPedido } from "@/types";

export function KanbanBoard() {
  const pedidos = useStore((s) => s.pedidos);
  const moverPedido = useStore((s) => s.moverPedido);

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [selecionados, setSelecionados] = React.useState<string[]>([]);
  const [rotaOpen, setRotaOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 6 },
    })
  );

  const porStatus = React.useMemo(() => {
    const map: Record<StatusPedido, Pedido[]> = {
      EM_PREPARO: [],
      PRONTO: [],
      EM_ENTREGA: [],
      ENTREGUE: [],
    };
    for (const p of pedidos) map[p.status].push(p);
    return map;
  }, [pedidos]);

  const activePedido = pedidos.find((p) => p.id === activeId) ?? null;

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  async function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const pedidoId = String(active.id);
    const novoStatus = String(over.id) as StatusPedido;
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido || pedido.status === novoStatus) return;

    try {
      await moverPedido(pedidoId, novoStatus);
    } catch {
      toast.error("Não foi possível mover o pedido");
    }
  }

  function toggleSelect(id: string) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // Mantém seleção coerente caso pedidos saiam da coluna Pronto.
  React.useEffect(() => {
    const prontosIds = new Set(porStatus.PRONTO.map((p) => p.id));
    setSelecionados((prev) => prev.filter((id) => prontosIds.has(id)));
  }, [porStatus]);

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {STATUS_PEDIDO.map((status) => {
            const isPronto = status === "PRONTO";
            const temSelecao = isPronto && selecionados.length > 0;
            return (
              <KanbanColumn
                key={status}
                status={status}
                pedidos={porStatus[status]}
                headerAction={
                  temSelecao ? (
                    <div className="mb-3 px-1">
                      <Button
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => setRotaOpen(true)}
                      >
                        <Send className="h-4 w-4" />
                        Enviar para entrega ({selecionados.length})
                      </Button>
                    </div>
                  ) : undefined
                }
              >
                {porStatus[status].map((pedido) => (
                  <KanbanCard
                    key={pedido.id}
                    pedido={pedido}
                    selectable={isPronto}
                    selected={selecionados.includes(pedido.id)}
                    onToggleSelect={toggleSelect}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activePedido ? (
            <div className="w-[280px] rotate-2 opacity-90">
              <KanbanCard pedido={activePedido} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CriarRotaModal
        open={rotaOpen}
        onOpenChange={setRotaOpen}
        pedidoIds={selecionados}
        onDone={() => setSelecionados([])}
      />
    </>
  );
}
