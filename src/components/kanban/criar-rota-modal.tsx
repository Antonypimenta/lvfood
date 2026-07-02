"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { toast } from "@/components/ui/toast";
import { STATUS_ENTREGADOR_DOT } from "@/lib/constants";

interface CriarRotaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedidoIds: string[];
  onDone: () => void;
}

export function CriarRotaModal({
  open,
  onOpenChange,
  pedidoIds,
  onDone,
}: CriarRotaModalProps) {
  const entregadores = useStore((s) => s.entregadores);
  const criarRota = useStore((s) => s.criarRota);
  const [selecionado, setSelecionado] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) setSelecionado("");
  }, [open]);

  async function confirmar() {
    if (!selecionado) {
      toast.error("Selecione um entregador");
      return;
    }
    try {
      setLoading(true);
      await criarRota(pedidoIds, selecionado);
      toast.success("Rota criada — pedidos em entrega");
      onDone();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao criar rota");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar para entrega</DialogTitle>
          <DialogDescription>
            {pedidoIds.length}{" "}
            {pedidoIds.length === 1 ? "pedido selecionado" : "pedidos selecionados"}.
            Escolha o entregador da rota.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label>Entregador</Label>
          {entregadores.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum entregador cadastrado.
            </p>
          )}
          <div className="grid gap-2">
            {entregadores.map((e) => {
              const ativo = selecionado === e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => setSelecionado(e.id)}
                  className={cn(
                    "flex items-center justify-between rounded-lg border-2 px-3 py-2.5 text-left transition-all",
                    ativo
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-slate-300 hover:bg-secondary"
                  )}
                >
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_ENTREGADOR_DOT[e.status])} />
                    {e.nome}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {e.status === "EM_ENTREGA" ? "Ocupado" : "Disponível"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={loading || !selecionado}>
            {loading ? "Enviando..." : "Confirmar rota"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
