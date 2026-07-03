"use client";

import * as React from "react";
import { Search, Pencil, Trash2, Copy, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  StatusPedidoBadge,
  PagamentoBadge,
} from "@/components/shared/status-badges";
import { WhatsAppMenu } from "@/components/shared/whatsapp-menu";
import { useStore } from "@/store/useStore";
import { useUiStore } from "@/store/useUiStore";
import { toast } from "@/components/ui/toast";
import {
  cn,
  formatCurrency,
  formatNumeroPedido,
  formatTelefone,
  onlyDigits,
} from "@/lib/utils";
import { STATUS_PEDIDO, STATUS_PEDIDO_LABEL } from "@/lib/constants";
import { format } from "date-fns";
import type { Pedido } from "@/types";

export function PedidosView() {
  const pedidos = useStore((s) => s.pedidos);
  const excluirPedido = useStore((s) => s.excluirPedido);
  const abrirEdicao = useUiStore((s) => s.abrirEdicao);
  const abrirDuplicar = useUiStore((s) => s.abrirDuplicar);
  const focarToken = useUiStore((s) => s.focarBuscaToken);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busca, setBusca] = React.useState("");
  const [filtroStatus, setFiltroStatus] = React.useState("");
  const [filtroBairro, setFiltroBairro] = React.useState("");
  const [filtroPagamento, setFiltroPagamento] = React.useState("");
  const [excluir, setExcluir] = React.useState<Pedido | null>(null);

  // Foco via CTRL+K (token muda → foca).
  React.useEffect(() => {
    if (focarToken > 0) inputRef.current?.focus();
  }, [focarToken]);

  const bairros = React.useMemo(
    () => Array.from(new Set(pedidos.map((p) => p.bairro))).sort(),
    [pedidos]
  );

  const filtrados = React.useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const termoDigits = onlyDigits(busca);
    return pedidos.filter((p) => {
      if (filtroStatus && p.status !== filtroStatus) return false;
      if (filtroBairro && p.bairro !== filtroBairro) return false;
      if (filtroPagamento && p.pagamento !== filtroPagamento) return false;
      if (!termo) return true;
      return (
        p.nome.toLowerCase().includes(termo) ||
        (termoDigits && onlyDigits(p.telefone).includes(termoDigits)) ||
        formatNumeroPedido(p.numero).includes(termoDigits || termo) ||
        String(p.numero).includes(termo)
      );
    });
  }, [pedidos, busca, filtroStatus, filtroBairro, filtroPagamento]);

  function duplicar(p: Pedido) {
    abrirDuplicar({
      cliente: {
        nome: p.nome,
        telefone: p.telefone,
        bairro: p.bairro,
        endereco: p.endereco,
        complemento: p.complemento ?? "",
        formaPagamento: p.formaPagamento,
        observacoes: p.observacoes ?? "",
        pagamento: "PENDENTE",
      },
      itens: p.itens
        .filter((it) => it.produtoId)
        .map((it) => ({
          produtoId: it.produtoId as string,
          quantidade: it.quantidade,
          extrasIds: it.extras
            .filter((e) => e.produtoId)
            .map((e) => e.produtoId as string),
        })),
    });
  }

  async function confirmarExclusao() {
    if (!excluir) return;
    try {
      await excluirPedido(excluir.id);
      toast.success(`Pedido #${formatNumeroPedido(excluir.numero)} excluído`);
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  const temFiltro = filtroStatus || filtroBairro || filtroPagamento || busca;

  return (
    <div className="space-y-4">
      {/* Busca + filtros */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por nome, telefone ou nº do pedido..."
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 lg:flex lg:w-auto lg:flex-none">
          <Select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="lg:w-40"
          >
            <option value="">Status</option>
            {STATUS_PEDIDO.map((s) => (
              <option key={s} value={s}>
                {STATUS_PEDIDO_LABEL[s]}
              </option>
            ))}
          </Select>
          <Select
            value={filtroBairro}
            onChange={(e) => setFiltroBairro(e.target.value)}
            className="lg:w-40"
          >
            <option value="">Bairro</option>
            {bairros.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          <Select
            value={filtroPagamento}
            onChange={(e) => setFiltroPagamento(e.target.value)}
            className="lg:w-40"
          >
            <option value="">Pagamento</option>
            <option value="PAGO">Pago</option>
            <option value="PENDENTE">Pendente</option>
          </Select>
        </div>
        {temFiltro && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setBusca("");
              setFiltroStatus("");
              setFiltroBairro("");
              setFiltroPagamento("");
            }}
            className="gap-1"
          >
            <X className="h-4 w-4" /> Limpar
          </Button>
        )}
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Bairro</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Pagamento</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Entregador</th>
                <th className="px-4 py-3 font-medium">Horário</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtrados.map((p) => (
                <tr
                  key={p.id}
                  className="transition-colors hover:bg-secondary/40"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-muted-foreground">
                    #{formatNumeroPedido(p.numero)}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {p.nome}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatTelefone(p.telefone)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.bairro}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                    {formatCurrency(p.valor)}
                  </td>
                  <td className="px-4 py-3">
                    <PagamentoBadge pagamento={p.pagamento} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPedidoBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.entregador?.nome ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {format(new Date(p.createdAt), "HH:mm")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <WhatsAppMenu pedido={p} variant="icon" />
                      <button
                        onClick={() => abrirEdicao(p)}
                        className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-secondary"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => duplicar(p)}
                        className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-secondary"
                        title="Duplicar"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setExcluir(p)}
                        className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtrados.length === 0 && (
          <div className={cn("px-4 py-12 text-center text-sm text-muted-foreground")}>
            Nenhum pedido encontrado.
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {filtrados.length} de {pedidos.length} pedidos
      </p>

      <ConfirmDialog
        open={Boolean(excluir)}
        onOpenChange={(o) => !o && setExcluir(null)}
        title="Excluir pedido?"
        description={
          excluir
            ? `O pedido #${formatNumeroPedido(excluir.numero)} de ${excluir.nome} será removido permanentemente.`
            : undefined
        }
        confirmLabel="Excluir"
        onConfirm={confirmarExclusao}
      />
    </div>
  );
}
