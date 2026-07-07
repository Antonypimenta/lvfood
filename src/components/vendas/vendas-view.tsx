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
  AlertCircle,
  Star,
  Boxes,
  Plus,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { calcularVendas, calcularRelatorioItens } from "@/lib/stats";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CATEGORIA_EMOJI } from "@/lib/constants";

export function VendasView() {
  const pedidos = useStore((s) => s.pedidos);
  const produtos = useStore((s) => s.produtos);
  const v = React.useMemo(() => calcularVendas(pedidos), [pedidos]);
  const rel = React.useMemo(
    () => calcularRelatorioItens(pedidos, produtos),
    [pedidos, produtos]
  );

  const formas = [
    { label: "PIX", valor: v.pix, icon: Landmark, color: "text-green-600 bg-green-100" },
    { label: "Dinheiro", valor: v.dinheiro, icon: Wallet, color: "text-amber-600 bg-amber-100" },
    { label: "Cartão", valor: v.cartao, icon: CreditCard, color: "text-blue-600 bg-blue-100" },
  ];
  const totalFormas = v.pix + v.dinheiro + v.cartao;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Valor vendido"
          value={formatCurrency(v.valorVendido)}
          icon={DollarSign}
          iconClass="bg-green-100 text-green-600"
        />
        <StatCard
          label="Pedidos"
          value={pedidos.length}
          icon={Beef}
          iconClass="bg-amber-100 text-amber-600"
        />
        <StatCard
          label="Ticket médio"
          value={formatCurrency(v.ticketMedio)}
          icon={Receipt}
          iconClass="bg-primary/10 text-primary"
        />
        <StatCard
          label="Pedidos entregues"
          value={v.entregues}
          icon={PackageCheck}
          iconClass="bg-slate-100 text-slate-600"
        />
      </div>

      {/* Relatório de itens — combos desmembrados nos seus componentes */}
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
          label="Valor em extras"
          value={formatCurrency(rel.extrasValor)}
          icon={DollarSign}
          iconClass="bg-green-100 text-green-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quanto de cada item</CardTitle>
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
            <CardTitle>Extras vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {rel.porExtra.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum extra vendido ainda.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {rel.porExtra.map((extra) => (
                  <li
                    key={extra.nome}
                    className="flex items-center justify-between gap-2 py-2.5"
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Por forma de pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formas.map((f) => {
              const pct = totalFormas > 0 ? (f.valor / totalFormas) * 100 : 0;
              const Icon = f.icon;
              return (
                <div key={f.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", f.color)}>
                        <Icon className="h-4 w-4" />
                      </span>
                      {f.label}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(f.valor)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
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
