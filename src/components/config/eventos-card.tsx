"use client";

import * as React from "react";
import { Plus, Check, Pencil, Trash2, CalendarDays } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useStore } from "@/store/useStore";
import { toast } from "@/components/ui/toast";
import type { Evento } from "@/types";

export function EventosCard() {
  const eventos = useStore((s) => s.eventos);
  const config = useStore((s) => s.config);
  const criarEvento = useStore((s) => s.criarEvento);
  const renomearEvento = useStore((s) => s.renomearEvento);
  const selecionarEvento = useStore((s) => s.selecionarEvento);
  const excluirEvento = useStore((s) => s.excluirEvento);

  const ativoId = config?.eventoAtivoId ?? null;

  const [novoNome, setNovoNome] = React.useState("");
  const [criando, setCriando] = React.useState(false);
  const [editando, setEditando] = React.useState<string | null>(null);
  const [nomeEdicao, setNomeEdicao] = React.useState("");
  const [excluir, setExcluir] = React.useState<Evento | null>(null);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    const nome = novoNome.trim();
    if (!nome) return;
    setCriando(true);
    try {
      await criarEvento(nome);
      setNovoNome("");
      toast.success(`Evento "${nome}" criado e selecionado`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar evento");
    } finally {
      setCriando(false);
    }
  }

  async function handleSelecionar(id: string) {
    try {
      await selecionarEvento(id);
      toast.success("Evento selecionado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao selecionar");
    }
  }

  async function handleRenomear(id: string) {
    const nome = nomeEdicao.trim();
    if (!nome) return;
    try {
      await renomearEvento(id, nome);
      setEditando(null);
      toast.success("Evento renomeado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao renomear");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Eventos
        </CardTitle>
        <CardDescription>
          Cada evento tem seus próprios pedidos e relatórios. O evento
          selecionado é o que aparece no painel e recebe os novos pedidos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleCriar} className="flex gap-2">
          <Input
            placeholder="Nome do novo evento"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
          />
          <Button
            type="submit"
            disabled={criando || !novoNome.trim()}
            className="shrink-0 gap-1.5"
          >
            <Plus className="h-4 w-4" /> Criar
          </Button>
        </form>

        <ul className="divide-y divide-border rounded-xl border border-border">
          {eventos.map((ev) => {
            const ativo = ev.id === ativoId;
            const emEdicao = editando === ev.id;
            return (
              <li
                key={ev.id}
                className={
                  "flex items-center gap-2 px-3 py-2.5 " +
                  (ativo ? "bg-primary/5" : "")
                }
              >
                {emEdicao ? (
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      autoFocus
                      value={nomeEdicao}
                      onChange={(e) => setNomeEdicao(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleRenomear(ev.id);
                        }
                        if (e.key === "Escape") setEditando(null);
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleRenomear(ev.id)}
                      className="shrink-0"
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditando(null)}
                      className="shrink-0"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-medium text-foreground">
                        <span className="truncate">{ev.nome}</span>
                        {ativo && (
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            Ativo
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ev.totalPedidos}{" "}
                        {ev.totalPedidos === 1 ? "pedido" : "pedidos"}
                      </p>
                    </div>

                    {!ativo && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelecionar(ev.id)}
                        className="shrink-0 gap-1"
                        title="Selecionar este evento"
                      >
                        <Check className="h-3.5 w-3.5" /> Selecionar
                      </Button>
                    )}
                    <button
                      onClick={() => {
                        setEditando(ev.id);
                        setNomeEdicao(ev.nome);
                      }}
                      className="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-secondary"
                      title="Renomear"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setExcluir(ev)}
                      disabled={eventos.length <= 1}
                      className="shrink-0 rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-30"
                      title={
                        eventos.length <= 1
                          ? "Não é possível excluir o único evento"
                          : "Excluir evento"
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>

      <ConfirmDialog
        open={Boolean(excluir)}
        onOpenChange={(o) => !o && setExcluir(null)}
        title="Excluir evento?"
        description={
          excluir
            ? `"${excluir.nome}" e todos os seus ${excluir.totalPedidos} pedido(s) serão apagados. Esta ação é irreversível.`
            : undefined
        }
        confirmLabel="Excluir evento"
        onConfirm={async () => {
          if (!excluir) return;
          try {
            await excluirEvento(excluir.id);
            toast.success("Evento excluído");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao excluir");
          }
        }}
      />
    </Card>
  );
}
