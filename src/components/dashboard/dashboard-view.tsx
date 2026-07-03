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
} from "lucide-react";
import { StatCard } from "./stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusPedidoBadge, EntregadorStatusBadge } from "@/components/shared/status-badges";
import { useStore } from "@/store/useStore";
import { calcularStats } from "@/lib/stats";
import { formatCurrency, formatNumeroPedido } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { format } from "date-fns";

export function DashboardView() {
  const pedidos = useStore((s) => s.pedidos);
  const entregadores = useStore((s) => s.entregadores);
  const config = useStore((s) => s.config);

  const stats = React.useMemo(() => calcularStats(pedidos), [pedidos]);
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
