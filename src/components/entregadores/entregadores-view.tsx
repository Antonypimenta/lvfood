"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Bike, Trash2, Flag, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EntregadorStatusBadge } from "@/components/shared/status-badges";
import { useStore } from "@/store/useStore";
import { toast } from "@/components/ui/toast";
import { entregadorSchema, type EntregadorFormValues } from "@/schemas/pedido";
import { formatNumeroPedido } from "@/lib/utils";
import { format } from "date-fns";
import type { EntregadorComPedidos } from "@/types";

export function EntregadoresView() {
  const entregadores = useStore((s) => s.entregadores);
  const criarEntregador = useStore((s) => s.criarEntregador);
  const excluirEntregador = useStore((s) => s.excluirEntregador);
  const finalizarRota = useStore((s) => s.finalizarRota);

  const [excluir, setExcluir] = React.useState<EntregadorComPedidos | null>(
    null
  );

  const { register, handleSubmit, reset, formState } =
    useForm<EntregadorFormValues>({
      resolver: zodResolver(entregadorSchema),
      defaultValues: { nome: "" },
    });

  async function onSubmit(data: EntregadorFormValues) {
    try {
      await criarEntregador(data.nome);
      toast.success("Entregador cadastrado");
      reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao cadastrar");
    }
  }

  async function handleFinalizar(id: string) {
    try {
      await finalizarRota(id);
      toast.success("Rota finalizada — pedidos entregues");
    } catch {
      toast.error("Erro ao finalizar rota");
    }
  }

  return (
    <div className="space-y-6">
      {/* Cadastro */}
      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2 sm:flex-row sm:items-start"
          >
            <div className="flex-1">
              <Input placeholder="Nome do entregador" {...register("nome")} />
              {formState.errors.nome && (
                <p className="mt-1 text-xs text-destructive">
                  {formState.errors.nome.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={formState.isSubmitting} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Adicionar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entregadores.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum entregador cadastrado.
          </p>
        )}
        {entregadores.map((e) => {
          const ativos = e.pedidos.filter((p) => p.status === "EM_ENTREGA");
          const entregues = e.pedidos.filter((p) => p.status === "ENTREGUE");
          const emEntrega = e.status === "EM_ENTREGA";
          const saida = ativos[0]?.horarioSaida;

          return (
            <Card key={e.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Bike className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{e.nome}</p>
                      <EntregadorStatusBadge status={e.status} />
                    </div>
                  </div>
                  <button
                    onClick={() => setExcluir(e)}
                    className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {entregues.length}
                    </p>
                    <p className="text-xs text-muted-foreground">entregas hoje</p>
                  </div>
                  {emEntrega && (
                    <div className="border-l border-border pl-4">
                      <p className="text-2xl font-bold text-blue-600">
                        {ativos.length}
                      </p>
                      <p className="text-xs text-muted-foreground">em rota</p>
                    </div>
                  )}
                </div>

                {emEntrega && (
                  <>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {ativos.map((p) => (
                        <span
                          key={p.id}
                          className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                        >
                          #{formatNumeroPedido(p.numero)}
                        </span>
                      ))}
                    </div>
                    {saida && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Saída às {format(new Date(saida), "HH:mm")}
                      </p>
                    )}
                    <Button
                      onClick={() => handleFinalizar(e.id)}
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full gap-2"
                    >
                      <Flag className="h-4 w-4" />
                      Finalizar rota
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog
        open={Boolean(excluir)}
        onOpenChange={(o) => !o && setExcluir(null)}
        title="Excluir entregador?"
        description={
          excluir
            ? `${excluir.nome} será removido. Pedidos vinculados ficarão sem entregador.`
            : undefined
        }
        confirmLabel="Excluir"
        onConfirm={async () => {
          if (!excluir) return;
          try {
            await excluirEntregador(excluir.id);
            toast.success("Entregador excluído");
          } catch {
            toast.error("Erro ao excluir");
          }
        }}
      />
    </div>
  );
}
