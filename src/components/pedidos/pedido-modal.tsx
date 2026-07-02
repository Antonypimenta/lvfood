"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { RadioGroup } from "@/components/pedidos/radio-group";
import { pedidoFormSchema, type PedidoFormValues } from "@/schemas/pedido";
import { useStore } from "@/store/useStore";
import { useUiStore } from "@/store/useUiStore";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Wallet, Landmark } from "lucide-react";

const defaults: PedidoFormValues = {
  nome: "",
  telefone: "",
  bairro: "",
  endereco: "",
  quantidade: 1,
  observacoes: "",
  formaPagamento: "PIX",
  pagamento: "PENDENTE",
};

export function PedidoModal() {
  const open = useUiStore((s) => s.pedidoModalOpen);
  const fechar = useUiStore((s) => s.fecharPedidoModal);
  const pedidoEmEdicao = useUiStore((s) => s.pedidoEmEdicao);
  const valoresIniciais = useUiStore((s) => s.valoresIniciais);

  const criarPedido = useStore((s) => s.criarPedido);
  const editarPedido = useStore((s) => s.editarPedido);
  const config = useStore((s) => s.config);
  const valorCombo = config?.valorCombo ?? 18;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PedidoFormValues>({
    resolver: zodResolver(pedidoFormSchema),
    defaultValues: defaults,
  });

  const isEdit = Boolean(pedidoEmEdicao);

  // Sincroniza os valores do form quando o modal abre.
  React.useEffect(() => {
    if (!open) return;
    if (pedidoEmEdicao) {
      reset({
        nome: pedidoEmEdicao.nome,
        telefone: pedidoEmEdicao.telefone,
        bairro: pedidoEmEdicao.bairro,
        endereco: pedidoEmEdicao.endereco,
        quantidade: pedidoEmEdicao.quantidade,
        observacoes: pedidoEmEdicao.observacoes ?? "",
        formaPagamento: pedidoEmEdicao.formaPagamento,
        pagamento: pedidoEmEdicao.pagamento,
      });
    } else if (valoresIniciais) {
      reset({ ...defaults, ...valoresIniciais });
    } else {
      reset(defaults);
    }
  }, [open, pedidoEmEdicao, valoresIniciais, reset]);

  const quantidade = Number(watch("quantidade")) || 0;
  const formaPagamento = watch("formaPagamento");
  const pagamento = watch("pagamento");
  const valorTotal = quantidade * valorCombo;

  async function onSubmit(data: PedidoFormValues) {
    try {
      if (isEdit && pedidoEmEdicao) {
        await editarPedido(pedidoEmEdicao.id, data);
        toast.success("Pedido atualizado");
      } else {
        await criarPedido(data);
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
          <DialogTitle>
            {isEdit ? "Editar pedido" : "Novo pedido"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados. O valor é calculado automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4"
          autoComplete="off"
        >
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              autoFocus
              placeholder="Maria Oliveira"
              {...register("nome")}
            />
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
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min={1}
                {...register("quantidade")}
              />
              {errors.quantidade && (
                <p className="text-xs text-destructive">
                  {errors.quantidade.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Valor (automático)</Label>
              <div className="flex h-10 items-center rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 text-lg font-bold text-primary">
                {formatCurrency(valorTotal)}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Forma de pagamento</Label>
            <RadioGroup
              value={formaPagamento}
              onChange={(v) =>
                setValue("formaPagamento", v as PedidoFormValues["formaPagamento"])
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

          <div className="grid gap-2">
            <Label>Pagamento</Label>
            <RadioGroup
              value={pagamento}
              onChange={(v) =>
                setValue("pagamento", v as PedidoFormValues["pagamento"])
              }
              options={[
                { value: "PAGO", label: "Pago", activeClass: "border-green-500 bg-green-50 text-green-700" },
                {
                  value: "PENDENTE",
                  label: "Pendente",
                  activeClass: "border-red-500 bg-red-50 text-red-700",
                },
              ]}
            />
          </div>

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
    </Dialog>
  );
}
