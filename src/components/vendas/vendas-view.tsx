"use client";

import * as React from "react";
import {
  DollarSign,
  Beef,
  Receipt,
  Landmark,
  Wallet,
  CreditCard,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  Star,
  Boxes,
  Plus,
  Layers,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { calcularVendas, calcularRelatorioItens, calcularPorForma } from "@/lib/stats";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CATEGORIA_EMOJI } from "@/lib/constants";
import type { FormaPagamento } from "@/types";

type Filtro = FormaPagamento | "TODAS";

const FORMA_META: Record<
  FormaPagamento,
  { label: string; icon: typeof Landmark; color: string }
> = {
  PIX: { label: "PIX", icon: Landmark, color: "text-green-600 bg-green-100" },
  DINHEIRO: { label: "Dinheiro", icon: Wallet, color: "text-amber-600 bg-amber-100" },
  CARTAO: { label: "Cartão", icon: CreditCard, color: "text-blue-600 bg-blue-100" },
};

export function VendasView() {
  const pedidos = useStore((s) => s.pedidos);
  const produtos = useStore((s) => s.produtos);
  const config = useStore((s) => s.config);

  const [filtro, setFiltro] = React.useState<Filtro>("TODAS");

  // Pedidos filtrados pela forma de pagamento selecionada.
  const pedidosFiltrados = React.useMemo(
    () =>
      filtro === "TODAS"
        ? pedidos
        : pedidos.filter((p) => p.formaPagamento === filtro),
    [pedidos, filtro]
  );

  const v = React.useMemo(
    () => calcularVendas(pedidosFiltrados),
    [pedidosFiltrados]
  );
  const rel = React.useMemo(
    () => calcularRelatorioItens(pedidosFiltrados, produtos),
    [pedidosFiltrados, produtos]
  );
  // Resumo por forma sempre sobre todos os pedidos do evento (mostra as 3 formas).
  const porForma = React.useMemo(() => calcularPorForma(pedidos), [pedidos]);

  // Recebido / pendente do conjunto filtrado.
  const recebido = React.useMemo(
    () =>
      pedidosFiltrados
        .filter((p) => p.pagamento === "PAGO")
        .reduce((acc, p) => acc + p.valor, 0),
    [pedidosFiltrados]
  );
  const pendenteValor = v.valorVendido - recebido;

  const tabs: { valor: Filtro; label: string }[] = [
    { valor: "TODAS", label: "Todas" },
    { valor: "PIX", label: "PIX" },
    { valor: "DINHEIRO", label: "Dinheiro" },
    { valor: "CARTAO", label: "Cartão" },
  ];

  return (
    <div className="space-y-6">
      {/* Contexto do evento + filtro por forma de pagamento */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Evento:{" "}
          <b className="text-foreground">{config?.nomeEvento ?? "—"}</b>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const ativo = filtro === t.valor;
            return (
              <button
                key={t.valor}
                onClick={() => setFiltro(t.valor)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  ativo
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards do conjunto filtrado */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={filtro === "TODAS" ? "Valor vendido" : `Vendido (${FORMA_META[filtro].label})`}
          value={formatCurrency(v.valorVendido)}
          icon={DollarSign}
          iconClass="bg-green-100 text-green-600"
        />
        <StatCard
          label="Recebido (pago)"
          value={formatCurrency(recebido)}
          icon={CheckCircle2}
          iconClass="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label="A receber (pendente)"
          value={formatCurrency(pendenteValor)}
          icon={AlertCircle}
          iconClass="bg-red-100 text-red-600"
        />
        <StatCard
          label="Pedidos"
          value={pedidosFiltrados.length}
          icon={Beef}
          iconClass="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Valor pago em cada forma de pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Valor pago por forma de pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {porForma.map((f) => {
            const meta = FORMA_META[f.forma];
            const Icon = meta.icon;
            const pct = f.total > 0 ? (f.pago / f.total) * 100 : 0;
            const ativo = filtro === f.forma;
            return (
              <button
                key={f.forma}
                onClick={() => setFiltro(ativo ? "TODAS" : f.forma)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-colors",
                  ativo
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-secondary/50"
                )}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg",
                        meta.color
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {meta.label}
                    <span className="text-xs font-normal text-muted-foreground">
                      · {f.quantidade}{" "}
                      {f.quantidade === 1 ? "pedido" : "pedidos"}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-bold text-emerald-600">
                      {formatCurrency(f.pago)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        recebido
                      </span>
                    </span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Pendente:{" "}
                    <b className="text-red-600">{formatCurrency(f.pendente)}</b>
                  </span>
                  <span>
                    Total: <b className="text-foreground">{formatCurrency(f.total)}</b>
                  </span>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Relatório de itens (do conjunto filtrado) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Combos vendidos"
          value={rel.combosVendidos}
          icon={Star}
          iconClass="bg-amber-100 text-amber-600"
        />
        <StatCard
          label="Itens totais"
          value={rel.itensTotais}
          icon={Boxes}
          iconClass="bg-orange-100 text-orange-600"
        />
        <StatCard
          label="Extras vendidos"
          value={rel.extrasQuantidade}
          icon={Plus}
          iconClass="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label="Ticket médio"
          value={formatCurrency(v.ticketMedio)}
          icon={Receipt}
          iconClass="bg-primary/10 text-primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Quanto de cada item
              {filtro !== "TODAS" && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({FORMA_META[filtro].label})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rel.porItem.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum item vendido ainda.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {rel.porItem.map((item) => (
                  <li
                    key={item.nome}
                    className="flex items-center justify-between gap-2 py-2.5"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
                      <span className="text-base">
                        {item.categoria === "DESCONHECIDO"
                          ? "🍽️"
                          : CATEGORIA_EMOJI[item.categoria]}
                      </span>
                      <span className="truncate">{item.nome}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-sm font-bold text-foreground">
                      {item.quantidade}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Situação dos pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
              <span className="flex items-center gap-2 text-sm font-medium text-green-700">
                <PackageCheck className="h-4 w-4" />
                Entregues
              </span>
              <span className="text-xl font-bold text-green-700">
                {v.entregues}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
              <span className="flex items-center gap-2 text-sm font-medium text-red-700">
                <AlertCircle className="h-4 w-4" />
                Pagamento pendente
              </span>
              <span className="text-xl font-bold text-red-700">
                {v.pendentes}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
