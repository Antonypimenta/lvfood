"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Clock,
  Phone,
  MapPin,
  Home,
  Beef,
  Wallet,
  MessageCircle,
  Pencil,
  GripVertical,
} from "lucide-react";
import { cn, formatCurrency, formatTelefone, whatsappUrl } from "@/lib/utils";
import { useTempo } from "@/hooks/useTempo";
import { useUiStore } from "@/store/useUiStore";
import { useStore } from "@/store/useStore";
import { PagamentoBadge } from "@/components/shared/status-badges";
import { FORMA_PAGAMENTO_LABEL } from "@/lib/constants";
import { formatNumeroPedido } from "@/lib/utils";
import type { Pedido } from "@/types";

interface KanbanCardProps {
  pedido: Pedido;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function KanbanCard({
  pedido,
  selectable = false,
  selected = false,
  onToggleSelect,
}: KanbanCardProps) {
  const abrirEdicao = useUiStore((s) => s.abrirEdicao);
  const alternarPagamento = useStore((s) => s.alternarPagamento);

  const ativo = pedido.status !== "ENTREGUE";
  const tempo = useTempo(pedido.createdAt, ativo);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: pedido.id, data: { status: pedido.status } });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const tempoColor =
    tempo.nivel === "critico"
      ? "text-red-600"
      : tempo.nivel === "atencao"
        ? "text-red-500"
        : "text-slate-500";

  function stop(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border border-border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "opacity-40",
        selected && "ring-2 ring-primary ring-offset-1",
        ativo && tempo.nivel === "critico" && "animate-soft-pulse"
      )}
    >
      {/* Cabeçalho: número + tempo + drag handle */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectable && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect?.(pedido.id)}
              onClick={stop}
              className="h-4 w-4 cursor-pointer rounded border-slate-300 text-primary accent-green-600"
            />
          )}
          <span className="text-sm font-bold text-foreground">
            #{formatNumeroPedido(pedido.numero)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {ativo && (
            <span className={cn("flex items-center gap-1 text-xs font-semibold", tempoColor)}>
              <Clock className="h-3.5 w-3.5" />
              {tempo.label}
            </span>
          )}
          <button
            {...attributes}
            {...listeners}
            onClick={stop}
            className="cursor-grab touch-none rounded p-0.5 text-slate-300 opacity-0 transition-opacity hover:text-slate-500 group-hover:opacity-100 active:cursor-grabbing"
            aria-label="Arrastar"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Nome */}
      <p className="mb-1.5 font-semibold text-foreground">{pedido.nome}</p>

      {/* Dados */}
      <div className="space-y-1 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          {formatTelefone(pedido.telefone)}
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {pedido.bairro}
        </p>
        <p className="flex items-center gap-1.5">
          <Home className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{pedido.endereco}</span>
        </p>
      </div>

      {/* Itens + valor */}
      <div className="mt-2.5 border-t border-border pt-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            {pedido.itens.length > 0 ? (
              pedido.itens.map((it) => (
                <div
                  key={it.id}
                  className="flex items-start gap-1.5 text-sm font-medium text-foreground"
                >
                  <Beef className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span>
                    {it.quantidade}× {it.nomeProduto}
                    {it.extras.length > 0 && (
                      <span className="block text-xs font-normal text-muted-foreground">
                        + {it.extras.map((e) => e.nomeProduto).join(", ")}
                      </span>
                    )}
                  </span>
                </div>
              ))
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Beef className="h-4 w-4 text-amber-500" />
                {pedido.quantidade} {pedido.quantidade === 1 ? "item" : "itens"}
              </span>
            )}
          </div>
          <span className="shrink-0 text-sm font-bold text-primary">
            {formatCurrency(pedido.valor)}
          </span>
        </div>
      </div>

      {/* Pagamento */}
      <div className="mt-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wallet className="h-3.5 w-3.5" />
          {FORMA_PAGAMENTO_LABEL[pedido.formaPagamento]}
        </span>
        <button onClick={(e) => { stop(e); alternarPagamento(pedido.id); }} title="Alternar pagamento">
          <PagamentoBadge pagamento={pedido.pagamento} />
        </button>
      </div>

      {/* Observações */}
      {pedido.observacoes && (
        <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">
          📝 {pedido.observacoes}
        </p>
      )}

      {/* Entregador (quando em entrega) */}
      {pedido.entregador && (
        <p className="mt-2 text-xs font-medium text-blue-600">
          🛵 {pedido.entregador.nome}
        </p>
      )}

      {/* Ações */}
      <div className="mt-3 flex gap-2">
        <a
          href={whatsappUrl(pedido.telefone)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stop}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-50 px-2 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>
        <button
          onClick={(e) => { stop(e); abrirEdicao(pedido); }}
          className="flex items-center justify-center rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
          aria-label="Editar"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
