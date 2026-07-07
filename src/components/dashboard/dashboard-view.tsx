"use client";

import * as React from "react";
import {
  ShoppingBag,
  ChefHat,
  CheckCircle2,
  Bike,
  PackageCheck,
  Beef,
  DollarSign,
  Receipt,
  Star,
  Boxes,
  Plus,
} from "lucide-react";
import { StatCard } from "./stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusPedidoBadge, EntregadorStatusBadge } from "@/components/shared/status-badges";
import { useStore } from "@/store/useStore";
import { calcularStats, calcularRelatorioItens } from "@/lib/stats";
import { formatCurrency, formatNumeroPedido } from "@/lib/utils";
import { CATEGORIA_EMOJI } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";
import { format } from "date-fns";

export function DashboardView() {
  const pedidos = useStore((s) => s.pedidos);
  const entregadores = useStore((s) => s.entregadores);
  const config = useStore((s) => s.config);
  const produtos = useStore((s) => s.produtos);

  const stats = React.useMemo(() => calcularStats(pedidos), [pedidos]);
  const rel = React.useMemo(
    () => calcularRelatorioItens(pedidos, produtos),
    [pedidos, produtos]
  );
  const ultimos = React.useMemo(() => pedidos.slice(0, 8), [pedidos]);

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Logo compact />
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {config?.nomeEvento ?? "Burguer LV"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Painel de operação · Delivery em tempo real
            </p>
          </div>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total de pedidos" value={stats.total} icon={ShoppingBag} />
        <StatCard
          label="Em preparo"
          value={stats.emPreparo}
          icon={ChefHat}
          iconClass="bg-amber-100 text-amber-600"
        />
        <StatCard
          label="Prontos"
          value={stats.prontos}
          icon={CheckCircle2}
          iconClass="bg-green-100 text-green-600"
        />
        <StatCard
          label="Em entrega"
          value={stats.emEntrega}
          icon={Bike}
          iconClass="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Entregues"
          value={stats.entregues}
          icon={PackageCheck}
          iconClass="bg-slate-100 text-slate-600"
        />
        <StatCard
          label="Itens vendidos"
          value={stats.combosVendidos}
          icon={Beef}
          iconClass="bg-amber-100 text-amber-600"
        />
        <StatCard
          label="Vendido hoje"
          value={formatCurrency(stats.valorVendido)}
          icon={DollarSign}
          iconClass="bg-green-100 text-green-600"
        />
        <StatCard
          label="Ticket médio"
          value={formatCurrency(stats.ticketMedio)}
          icon={Receipt}
          iconClass="bg-primary/10 text-primary"
        />
      </div>

      {/* Itens do evento — combos desmembrados nos seus componentes */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Itens vendidos no evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat
                icon={<Star className="h-4 w-4" />}
                label="Combos"
                value={rel.combosVendidos}
                color="bg-amber-100 text-amber-600"
              />
              <MiniStat
                icon={<Boxes className="h-4 w-4" />}
                label="Itens totais"
                value={rel.itensTotais}
                color="bg-orange-100 text-orange-600"
              />
              <MiniStat
                icon={<Plus className="h-4 w-4" />}
                label="Extras"
                value={rel.extrasQuantidade}
                color="bg-emerald-100 text-emerald-600"
              />
              <MiniStat
                icon={<DollarSign className="h-4 w-4" />}
                label="Em extras"
                value={formatCurrency(rel.extrasValor)}
                color="bg-green-100 text-green-600"
              />
            </div>

            {rel.porItem.length === 0 ? (
              <p className="py-2 text-center text-sm text-muted-foreground">
                Nenhum item vendido ainda neste evento.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {rel.porItem.map((item) => (
                  <li
                    key={item.nome}
                    className="flex items-center justify-between gap-2 py-2"
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
            <CardTitle>Extras vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {rel.porExtra.length === 0 ? (
              <p className="py-2 text-center text-sm text-muted-foreground">
                Nenhum extra vendido ainda.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {rel.porExtra.map((extra) => (
                  <li
                    key={extra.nome}
                    className="flex items-center justify-between gap-2 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
                      <span className="text-base">➕</span>
                      <span className="truncate">{extra.nome}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-sm font-bold text-foreground">
                      {extra.quantidade}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Últimos pedidos + Entregadores */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Últimos pedidos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {ultimos.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                Nenhum pedido ainda. Use <b>Novo Pedido</b> ou{" "}
                <kbd className="rounded border px-1">Ctrl N</kbd>.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {ultimos.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-secondary/50"
                  >
                    <span className="w-12 shrink-0 text-sm font-bold text-muted-foreground">
                      #{formatNumeroPedido(p.numero)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {p.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.quantidade} {p.quantidade === 1 ? "item" : "itens"} ·{" "}
                        {format(new Date(p.createdAt), "HH:mm")}
                      </p>
                    </div>
                    <span className="hidden text-sm font-semibold text-foreground sm:block">
                      {formatCurrency(p.valor)}
                    </span>
                    <StatusPedidoBadge status={p.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entregadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entregadores.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum entregador cadastrado.
              </p>
            )}
            {entregadores.map((e) => {
              const ativos = e.pedidos.filter(
                (p) => p.status === "EM_ENTREGA"
              ).length;
              const entregues = e.pedidos.filter(
                (p) => p.status === "ENTREGUE"
              ).length;
              return (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{e.nome}</p>
                    <EntregadorStatusBadge status={e.status} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {ativos} ativos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entregues} entregues
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <span
        className={
          "mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg " +
          color
        }
      >
        {icon}
      </span>
      <p className="text-lg font-bold leading-tight text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
