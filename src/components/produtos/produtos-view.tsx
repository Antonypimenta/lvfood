"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProdutoModal } from "./produto-modal";
import { useStore } from "@/store/useStore";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { CATEGORIAS_PRODUTO, CATEGORIA_PRODUTO_LABEL } from "@/lib/constants";
import type { Produto } from "@/types";

export function ProdutosView() {
  const produtos = useStore((s) => s.produtos);
  const editarProduto = useStore((s) => s.editarProduto);
  const excluirProduto = useStore((s) => s.excluirProduto);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [emEdicao, setEmEdicao] = React.useState<Produto | null>(null);
  const [excluir, setExcluir] = React.useState<Produto | null>(null);

  const grupos = CATEGORIAS_PRODUTO.map((cat) => ({
    categoria: cat,
    itens: produtos
      .filter((p) => p.categoria === cat)
      .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome)),
  }));

  function abrirNovo() {
    setEmEdicao(null);
    setModalOpen(true);
  }

  function abrirEdicao(p: Produto) {
    setEmEdicao(p);
    setModalOpen(true);
  }

  async function alternarAtivo(p: Produto) {
    try {
      await editarProduto(p.id, { ativo: !p.ativo });
    } catch {
      toast.error("Erro ao atualizar situação");
    }
  }

  // Troca a ordem de exibição com o vizinho (mesma categoria).
  async function mover(lista: Produto[], index: number, dir: -1 | 1) {
    const alvo = lista[index];
    const vizinho = lista[index + dir];
    if (!alvo || !vizinho) return;
    try {
      await Promise.all([
        editarProduto(alvo.id, { ordem: vizinho.ordem }),
        editarProduto(vizinho.id, { ordem: alvo.ordem }),
      ]);
    } catch {
      toast.error("Erro ao reordenar");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {produtos.length} produto(s) no cardápio
        </p>
        <Button onClick={abrirNovo} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo produto</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {produtos.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Nenhum produto cadastrado. Clique em <b>Novo produto</b> para começar.
        </div>
      )}

      {grupos.map(
        (grupo) =>
          grupo.itens.length > 0 && (
            <div key={grupo.categoria} className="space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {CATEGORIA_PRODUTO_LABEL[grupo.categoria]}
              </h2>
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                {grupo.itens.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                  >
                    {/* Reordenar */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => mover(grupo.itens, i, -1)}
                        disabled={i === 0}
                        className="text-slate-400 transition-colors hover:text-foreground disabled:opacity-30"
                        aria-label="Subir"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => mover(grupo.itens, i, 1)}
                        disabled={i === grupo.itens.length - 1}
                        className="text-slate-400 transition-colors hover:text-foreground disabled:opacity-30"
                        aria-label="Descer"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{p.nome}</p>
                      {p.categoria === "COMBOS" && p.componentes.length > 0 ? (
                        <p className="truncate text-xs text-muted-foreground">
                          🍔 {p.componentes.map((c) => c.nome).join(" + ")}
                        </p>
                      ) : (
                        p.descricao && (
                          <p className="truncate text-xs text-muted-foreground">
                            {p.descricao}
                          </p>
                        )
                      )}
                    </div>

                    <span className="whitespace-nowrap text-sm font-semibold text-foreground">
                      {formatCurrency(p.preco)}
                    </span>

                    {/* Ativar/Desativar */}
                    <button
                      onClick={() => alternarAtivo(p)}
                      className={
                        "rounded-full px-2.5 py-1 text-xs font-medium transition-colors " +
                        (p.ativo
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200")
                      }
                    >
                      {p.ativo ? "Ativo" : "Inativo"}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => abrirEdicao(p)}
                        className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-secondary"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setExcluir(p)}
                        className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
      )}

      <ProdutoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        produto={emEdicao}
      />

      <ConfirmDialog
        open={Boolean(excluir)}
        onOpenChange={(o) => !o && setExcluir(null)}
        title="Excluir produto?"
        description={
          excluir
            ? `"${excluir.nome}" será removido do cardápio. Pedidos antigos mantêm o registro.`
            : undefined
        }
        confirmLabel="Excluir"
        onConfirm={async () => {
          if (!excluir) return;
          try {
            await excluirProduto(excluir.id);
            toast.success("Produto excluído");
          } catch {
            toast.error("Erro ao excluir");
          }
        }}
      />
    </div>
  );
}
