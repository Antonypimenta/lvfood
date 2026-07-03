"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Wallet, Landmark, Plus, Minus, Trash2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { RadioGroup } from "@/components/pedidos/radio-group";
import { ExtrasModal } from "@/components/pedido/extras-modal";
import { pedidoClienteSchema, type PedidoClienteValues } from "@/schemas/pedido";
import { useStore } from "@/store/useStore";
import { useUiStore } from "@/store/useUiStore";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { aceitaExtras } from "@/lib/produto";
import {
  CATEGORIAS_PRODUTO,
  CATEGORIA_PRODUTO_LABEL,
  STATUS_PEDIDO,
  STATUS_PEDIDO_LABEL,
} from "@/lib/constants";
import type { Produto, StatusPedido } from "@/types";

interface LinhaAdmin {
  uid: string;
  produto: Produto;
  quantidade: number;
  extras: Produto[];
}

const defaults: PedidoClienteValues = {
  nome: "",
  telefone: "",
  bairro: "",
  endereco: "",
  complemento: "",
  observacoes: "",
  formaPagamento: "PIX",
  pagamento: "PENDENTE",
  troco: null,
  agendamento: "",
};

let seq = 0;
const novoUid = () => `admin-${Date.now()}-${seq++}`;

export function PedidoModal() {
  const open = useUiStore((s) => s.pedidoModalOpen);
  const fechar = useUiStore((s) => s.fecharPedidoModal);
  const pedidoEmEdicao = useUiStore((s) => s.pedidoEmEdicao);
  const prefill = useUiStore((s) => s.prefill);

  const criarPedido = useStore((s) => s.criarPedido);
  const editarPedido = useStore((s) => s.editarPedido);
  const produtos = useStore((s) => s.produtos);

  const isEdit = Boolean(pedidoEmEdicao);

  const ativos = React.useMemo(
    () => produtos.filter((p) => p.ativo),
    [produtos]
  );
  const extrasDisponiveis = React.useMemo(
    () => ativos.filter((p) => p.categoria === "EXTRAS"),
    [ativos]
  );

  const [linhas, setLinhas] = React.useState<LinhaAdmin[]>([]);
  const [selecionado, setSelecionado] = React.useState("");
  const [status, setStatus] = React.useState<StatusPedido>("EM_PREPARO");
  const [extrasTarget, setExtrasTarget] = React.useState<{
    uid: string;
    nome: string;
    atuais: Produto[];
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PedidoClienteValues>({
    resolver: zodResolver(pedidoClienteSchema),
    defaultValues: defaults,
  });

  // Sincroniza os valores ao abrir o modal.
  React.useEffect(() => {
    if (!open) return;
    setSelecionado("");
    setExtrasTarget(null);
    if (pedidoEmEdicao) {
      reset({
        nome: pedidoEmEdicao.nome,
        telefone: pedidoEmEdicao.telefone,
        bairro: pedidoEmEdicao.bairro,
        endereco: pedidoEmEdicao.endereco,
        complemento: pedidoEmEdicao.complemento ?? "",
        observacoes: pedidoEmEdicao.observacoes ?? "",
        formaPagamento: pedidoEmEdicao.formaPagamento,
        pagamento: pedidoEmEdicao.pagamento,
        troco: pedidoEmEdicao.troco ?? null,
        agendamento: pedidoEmEdicao.agendamento ?? "",
      });
      setStatus(pedidoEmEdicao.status);
      setLinhas([]);
    } else if (prefill) {
      reset({ ...defaults, ...prefill.cliente });
      setStatus("EM_PREPARO");
      const novas: LinhaAdmin[] = [];
      for (const it of prefill.itens ?? []) {
        const produto = produtos.find((p) => p.id === it.produtoId);
        if (!produto) continue;
        const extras = it.extrasIds
          .map((id) => produtos.find((p) => p.id === id))
          .filter((p): p is Produto => Boolean(p));
        novas.push({
          uid: novoUid(),
          produto,
          quantidade: it.quantidade,
          extras,
        });
      }
      setLinhas(novas);
    } else {
      reset(defaults);
      setStatus("EM_PREPARO");
      setLinhas([]);
    }
    // Só sincroniza quando o modal abre / muda de contexto — NÃO depende de
    // `produtos` (o polling troca essa referência a cada 3s e zeraria os itens).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pedidoEmEdicao, prefill, reset]);

  const formaPagamento = watch("formaPagamento");
  const pagamento = watch("pagamento");

  const total = linhas.reduce((acc, l) => {
    const somaExtras = l.extras.reduce((s, e) => s + e.preco, 0);
    return acc + (l.produto.preco + somaExtras) * l.quantidade;
  }, 0);

  function adicionar() {
    const produto = ativos.find((p) => p.id === selecionado);
    if (!produto) return;
    if (!aceitaExtras(produto)) {
      const existente = linhas.find(
        (l) => l.produto.id === produto.id && l.extras.length === 0
      );
      if (existente) {
        setLinhas((ls) =>
          ls.map((l) =>
            l.uid === existente.uid
              ? { ...l, quantidade: l.quantidade + 1 }
              : l
          )
        );
        setSelecionado("");
        return;
      }
    }
    const uid = novoUid();
    setLinhas((ls) => [...ls, { uid, produto, quantidade: 1, extras: [] }]);
    setSelecionado("");
    if (aceitaExtras(produto) && extrasDisponiveis.length > 0) {
      setExtrasTarget({ uid, nome: produto.nome, atuais: [] });
    }
  }

  function ajustar(uid: string, delta: number) {
    setLinhas((ls) =>
      ls
        .map((l) =>
          l.uid === uid ? { ...l, quantidade: l.quantidade + delta } : l
        )
        .filter((l) => l.quantidade > 0)
    );
  }

  function remover(uid: string) {
    setLinhas((ls) => ls.filter((l) => l.uid !== uid));
  }

  function definirExtras(lista: Produto[]) {
    if (!extrasTarget) return;
    setLinhas((ls) =>
      ls.map((l) => (l.uid === extrasTarget.uid ? { ...l, extras: lista } : l))
    );
  }

  async function onSubmit(data: PedidoClienteValues) {
    try {
      if (isEdit && pedidoEmEdicao) {
        await editarPedido(pedidoEmEdicao.id, { ...data, status });
        toast.success("Pedido atualizado");
      } else {
        if (linhas.length === 0) {
          toast.error("Adicione ao menos um item");
          return;
        }
        await criarPedido({
          ...data,
          itens: linhas.map((l) => ({
            produtoId: l.produto.id,
            quantidade: l.quantidade,
            extras: l.extras.map((e) => ({ produtoId: e.id })),
          })),
        });
        toast.success("Pedido criado");
      }
      fechar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : fechar())}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar pedido" : "Novo pedido"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados do cliente e o status."
              : "Monte o pedido escolhendo os produtos do cardápio."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4"
          autoComplete="off"
        >
          {/* Construtor de itens (apenas em novos pedidos) */}
          {!isEdit && (
            <div className="grid gap-2 rounded-xl border border-border bg-secondary/30 p-3">
              <Label>Itens do pedido</Label>
              <div className="flex gap-2">
                <Select
                  value={selecionado}
                  onChange={(e) => setSelecionado(e.target.value)}
                >
                  <option value="">Selecione um produto...</option>
                  {CATEGORIAS_PRODUTO.map((cat) => {
                    const itens = ativos.filter((p) => p.categoria === cat);
                    if (itens.length === 0) return null;
                    return (
                      <optgroup key={cat} label={CATEGORIA_PRODUTO_LABEL[cat]}>
                        {itens.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} — {formatCurrency(p.preco)}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </Select>
                <Button
                  type="button"
                  onClick={adicionar}
                  disabled={!selecionado}
                  className="shrink-0 gap-1"
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>

              {linhas.length > 0 && (
                <div className="mt-1 space-y-2">
                  {linhas.map((l) => {
                    const ehHamburguer = aceitaExtras(l.produto);
                    return (
                      <div
                        key={l.uid}
                        className="rounded-lg border border-border bg-card p-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="min-w-0 font-medium text-foreground">
                            {l.produto.nome}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => ajustar(l.uid, -1)}
                              className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:bg-secondary"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold">
                              {l.quantidade}
                            </span>
                            <button
                              type="button"
                              onClick={() => ajustar(l.uid, 1)}
                              className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:bg-secondary"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            {ehHamburguer && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExtrasTarget({
                                    uid: l.uid,
                                    nome: l.produto.nome,
                                    atuais: l.extras,
                                  })
                                }
                                className="flex h-6 items-center gap-1 rounded border border-border px-1.5 text-xs text-muted-foreground hover:bg-secondary"
                              >
                                <Pencil className="h-3 w-3" /> Extras
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => remover(l.uid)}
                              className="flex h-6 w-6 items-center justify-center rounded text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {l.extras.length > 0 && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {l.extras.map((e) => e.nome).join(", ")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between px-1 pt-1">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Itens (somente leitura) na edição */}
          {isEdit && pedidoEmEdicao && pedidoEmEdicao.itens.length > 0 && (
            <div className="rounded-xl border border-border bg-secondary/30 p-3 text-sm">
              <p className="mb-1 font-medium text-foreground">Itens</p>
              <ul className="space-y-0.5 text-muted-foreground">
                {pedidoEmEdicao.itens.map((it) => (
                  <li key={it.id}>
                    {it.quantidade}× {it.nomeProduto}
                    {it.extras.length > 0 && (
                      <span className="text-xs">
                        {" "}
                        ({it.extras.map((e) => e.nomeProduto).join(", ")})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" placeholder="Maria Oliveira" {...register("nome")} />
            {errors.nome && (
              <p className="text-xs text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                inputMode="tel"
                placeholder="(24) 99999-9999"
                {...register("telefone")}
              />
              {errors.telefone && (
                <p className="text-xs text-destructive">
                  {errors.telefone.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bairro">Bairro *</Label>
              <Input
                id="bairro"
                placeholder="Parque Mambucaba"
                {...register("bairro")}
              />
              {errors.bairro && (
                <p className="text-xs text-destructive">
                  {errors.bairro.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endereco">Endereço *</Label>
            <Input
              id="endereco"
              placeholder="Rua das Flores, 120"
              {...register("endereco")}
            />
            {errors.endereco && (
              <p className="text-xs text-destructive">
                {errors.endereco.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                placeholder="Apto, bloco, referência..."
                {...register("complemento")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="agendamento">🕐 Agendar entrega</Label>
              <Input id="agendamento" type="time" {...register("agendamento")} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Forma de pagamento</Label>
            <RadioGroup
              value={formaPagamento}
              onChange={(v) =>
                setValue(
                  "formaPagamento",
                  v as PedidoClienteValues["formaPagamento"]
                )
              }
              options={[
                { value: "PIX", label: "PIX", icon: <Landmark className="h-4 w-4" /> },
                {
                  value: "DINHEIRO",
                  label: "Dinheiro",
                  icon: <Wallet className="h-4 w-4" />,
                },
                {
                  value: "CARTAO",
                  label: "Cartão",
                  icon: <CreditCard className="h-4 w-4" />,
                },
              ]}
            />
          </div>

          {formaPagamento === "DINHEIRO" && (
            <div className="grid gap-2">
              <Label htmlFor="troco">Troco para (opcional)</Label>
              <Input
                id="troco"
                type="number"
                step="0.01"
                min={0}
                placeholder="Ex.: 50,00"
                {...register("troco")}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label>Pagamento</Label>
            <RadioGroup
              value={pagamento}
              onChange={(v) =>
                setValue("pagamento", v as PedidoClienteValues["pagamento"])
              }
              options={[
                {
                  value: "PAGO",
                  label: "Pago",
                  activeClass: "border-green-500 bg-green-50 text-green-700",
                },
                {
                  value: "PENDENTE",
                  label: "Pendente",
                  activeClass: "border-red-500 bg-red-50 text-red-700",
                },
              ]}
            />
          </div>

          {isEdit && (
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusPedido)}
              >
                {STATUS_PEDIDO.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_PEDIDO_LABEL[s]}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Sem cebola, ponto da carne, etc."
              {...register("observacoes")}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={fechar}
              disabled={isSubmitting}
            >
              Cancelar <kbd className="ml-1 text-[10px] opacity-60">Esc</kbd>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : isEdit
                  ? "Salvar alterações"
                  : "Criar pedido"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <ExtrasModal
        open={extrasTarget !== null}
        onOpenChange={(o) => !o && setExtrasTarget(null)}
        nomeHamburguer={extrasTarget?.nome ?? ""}
        extrasDisponiveis={extrasDisponiveis}
        selecionados={extrasTarget?.atuais ?? []}
        onConfirm={definirExtras}
        confirmLabel="Confirmar extras"
      />
    </Dialog>
  );
}
